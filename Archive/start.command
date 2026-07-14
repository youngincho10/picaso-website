#!/bin/bash
cd "$(dirname "$0")"
PORT=8000

if lsof -i :$PORT >/dev/null 2>&1; then
  open -a "Google Chrome" "http://localhost:$PORT"
  exit 0
fi

python3 -m http.server $PORT > /tmp/picaso_booth_server.log 2>&1 &
SERVER_PID=$!
sleep 1
open -a "Google Chrome" "http://localhost:$PORT"

echo "PICASO 부스 서버가 실행 중입니다."
echo "종료하려면 이 창에서 Control + C를 누르세요."
wait $SERVER_PID
