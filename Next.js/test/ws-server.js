const WebSocket = require('ws');
const http = require('http');
const { createClient } = require('redis');

const PORT = 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Flash Mob WebSocket Server Running\n');
});

const wss = new WebSocket.Server({ server });

async function startServer() {
  // Redis 클라이언트 생성 (기본 포트 6379)
  const redisClient = createClient({
    url: 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.error('[Redis] Client Error', err));

  await redisClient.connect();
  console.log('[Redis] Connected successfully');

  wss.on('connection', (ws, req) => {
    console.log('[WS] New connection established');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'join') {
          const productId = String(data.productId);
          ws.productId = productId; // 연결 객체에 방 정보 저장
          
          const redisKey = `flashmob:${productId}`;
          
          // Redis에서 현재 카운트 조회
          let currentCountStr = await redisClient.get(redisKey);
          
          // 데이터가 없으면 초기값(10~30 랜덤) 세팅
          if (currentCountStr === null) {
            const initialCount = Math.floor(Math.random() * 20) + 10;
            await redisClient.set(redisKey, initialCount);
            currentCountStr = String(initialCount);
          }
          
          const currentCount = parseInt(currentCountStr, 10);
          console.log(`[WS] Client joined room ${productId}, current count: ${currentCount}`);

          // 본인에게 현재 카운트 전송
          ws.send(JSON.stringify({ type: 'updateCount', count: currentCount }));
        } 
        else if (data.type === 'purchase') {
          const productId = String(data.productId);
          const redisKey = `flashmob:${productId}`;
          
          // Redis INCR 명령어로 원자적 1 증가 (동시성 보장)
          const newCount = await redisClient.incr(redisKey);
          console.log(`[WS] Purchase in room ${productId}, new count: ${newCount}`);

          // 동일한 productId(방)에 있는 모든 클라이언트에게 브로드캐스트
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.productId === productId) {
              client.send(JSON.stringify({ type: 'updateCount', count: newCount }));
              
              // 목표 달성 시 성공 이벤트 발송 (예: 50명)
              if (newCount === 50) {
                client.send(JSON.stringify({ type: 'flashMobSuccess' }));
              }
            }
          });
        }
        else if (data.type === 'join_cart') {
          const roomId = String(data.roomId);
          ws.cartRoom = roomId;
          
          const redisKey = `shared_cart:${roomId}`;
          let cartDataStr = await redisClient.get(redisKey);
          if (!cartDataStr) {
            cartDataStr = "[]";
            await redisClient.set(redisKey, cartDataStr);
          }
          
          // Send current cart state to the joined user
          ws.send(JSON.stringify({ type: 'cart_sync', items: JSON.parse(cartDataStr) }));
          
          // Count participants
          let participants = 0;
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.cartRoom === roomId) {
              participants++;
            }
          });
          
          // Broadcast participant count
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client.cartRoom === roomId) {
              client.send(JSON.stringify({ type: 'cart_participants', count: participants }));
            }
          });
        }
        else if (data.type === 'update_cart') {
          const roomId = String(data.roomId);
          const items = data.items || [];
          
          const redisKey = `shared_cart:${roomId}`;
          await redisClient.set(redisKey, JSON.stringify(items));
          
          // Broadcast to everyone in the room
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.cartRoom === roomId) {
              client.send(JSON.stringify({ type: 'cart_sync', items: items }));
            }
          });
        }
      } catch (err) {
        console.error('[WS] Error parsing message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[WS] Connection closed');
      
      // If it was a cart connection, broadcast updated participant count
      if (ws.cartRoom) {
        let participants = 0;
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.cartRoom === ws.cartRoom) {
            participants++;
          }
        });
        
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.cartRoom === ws.cartRoom) {
            client.send(JSON.stringify({ type: 'cart_participants', count: participants }));
          }
        });
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`[Flash Mob WS] Server listening on ws://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
