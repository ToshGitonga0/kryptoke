#!/bin/bash
echo ""
echo "🌿 Starting KryptoKE Platform..."
echo "   Backend  →  http://localhost:8000/docs"
echo "   Frontend →  http://localhost:3000"
echo ""

trap 'kill %1 %2 2>/dev/null; echo "Stopped."' EXIT SIGINT

bash "$(dirname "$0")/run-backend.sh" &
sleep 3
bash "$(dirname "$0")/run-frontend.sh" &
wait
