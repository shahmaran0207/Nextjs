set -e  # 에러 시 즉시 중단

CURRENT=$(cat .current 2>/dev/null || echo "blue")

if [ "$CURRENT" = "blue" ]; then
    NEXT="green"
    NEXT_SERVICE="nextjs-green"
    CURRENT_SERVICE="nextjs-blue"
else
    NEXT="blue"
    NEXT_SERVICE="nextjs-blue"
    CURRENT_SERVICE="nextjs-green"
fi

echo "현재: $CURRENT -> 배포: $NEXT"

# 1. 새 컨테이너 빌드 & 실행
docker-compose build $NEXT_SERVICE
docker-compose up -d $NEXT_SERVICE

# 2. 헬스체크 (최대 60초 대기)
echo "새 컨테이너 헬스체크 중..."
MAX_RETRY=12
COUNT=0

until docker-compose exec -T $NEXT_SERVICE node -e "fetch('http://127.0.0.1:3000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" > /dev/null 2>&1; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_RETRY ]; then
        echo "❌ 헬스체크 실패"
        docker logs $NEXT_SERVICE --tail 100
        docker inspect $NEXT_SERVICE --format='{{json .State}}'
        exit 1
    fi
    echo "대기중... ($COUNT/$MAX_RETRY)"
    sleep 5
done

echo "✅ 헬스체크 통과"

# 3. nginx upstream 변수만 교체 후 reload
sed -i "s|nextjs-${CURRENT}:3000|nextjs-${NEXT}:3000|g" nginx-current.conf
sed -i "s|nextjs-${CURRENT}:3001|nextjs-${NEXT}:3001|g" nginx-current.conf

# 4. nginx reload 성공 확인
if ! docker-compose exec nginx nginx -s reload; then
    echo "❌ nginx reload 실패 - nginx.conf 복구"
    sed -i "s|nextjs-${NEXT}:3000|nextjs-${CURRENT}:3000|g" nginx-current.conf
    sed -i "s|nextjs-${NEXT}:3001|nextjs-${CURRENT}:3001|g" nginx-current.conf
    docker-compose stop $NEXT_SERVICE
    exit 1
fi

echo "✅ nginx 전환 완료: $CURRENT -> $NEXT"

# 5. 구 컨테이너 종료 (전환 확인 후)
sleep 3  # 기존 요청 drain
docker-compose stop $CURRENT_SERVICE

echo $NEXT > .current
echo "🎉 배포 완료!"