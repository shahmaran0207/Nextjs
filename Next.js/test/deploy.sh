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
docker compose build --no-cache $NEXT_SERVICE
docker compose up -d --force-recreate $NEXT_SERVICE

# 2. 헬스체크 (최대 60초 대기)
echo "새 컨테이너 실행 확인 중..."
sleep 10

if [ "$(docker inspect -f '{{.State.Running}}' $NEXT_SERVICE 2>/dev/null)" != "true" ]; then
    echo "❌ 컨테이너 실행 실패"
    docker logs $NEXT_SERVICE --tail 100
    exit 1
fi

echo "✅ 컨테이너 실행 확인"

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