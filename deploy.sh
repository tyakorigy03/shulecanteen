#!/bin/bash
# ================================================================
# deploy.sh - CLEAN OVERWRITE VERSION
# ================================================================
set -e

LIVE="/root/apps/shulecanteen"
WEB="/var/www/shulecanteen"
BACKEND="$LIVE/shule_canteen_backend"

echo "===== ShuleCanteen Deploy $(date '+%Y-%m-%d %H:%M:%S') ====="

[ -f "$BACKEND/server.js" ] || { echo "ERROR: backend not found at $BACKEND"; exit 1; }

mkdir -p "$WEB"/{landing,cantine,driver,supplier,admin}
mkdir -p "$BACKEND/public/uploads/apk"

build_app() {
    local DIR="$1" DEST="$2" BASE="${3:-/}"
    echo "  -> $DIR"
    cd "$LIVE/$DIR"
    npm install --prefer-offline --silent
    VITE_BASE_URL="$BASE" npm run build --silent
    rm -rf "$WEB/$DEST" && mkdir -p "$WEB/$DEST"
    cp -r dist/. "$WEB/$DEST/"
    echo "     deployed → $WEB/$DEST/"
}

echo "[1/3] Building web apps..."
build_app shule_canteen_landing    landing  /
build_app shule_canteen_seller_app cantine  /cantine/
build_app sulecanteen_driver_app   driver   /driver/
build_app shule_canteen_supplier   supplier /supplier/
build_app shule_canteen_superadmin admin    /admin/

echo "[2/3] Backend..."
cd "$BACKEND"
npm install --production --prefer-offline --silent

# Kill existing PM2 instance if running
pm2 delete shulecanteen-backend 2>/dev/null || true

# Start fresh
pm2 start server.js --name shulecanteen-backend
pm2 save --force

echo "[3/3] Permissions..."
chown -R www-data:www-data "$WEB"
chmod -R 755 "$WEB"
chmod -R 775 "$BACKEND/public/uploads"

echo ""
echo "===== Done ====="
pm2 list | grep shulecanteen