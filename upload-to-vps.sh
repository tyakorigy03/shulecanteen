#!/bin/bash
# ================================================================
# upload-to-vps.sh - COMPLETE OVERWRITE VERSION
# ================================================================

set -e

VPS_USER="root"
VPS_HOST="10.10.139.68"
REMOTE_ZIP="/root/deploy/shulecanteen-upload.zip"
REMOTE_DIR="/root/deploy/shulecanteen-src"

LOCAL_ZIP="$1"

if [ -z "$LOCAL_ZIP" ]; then
  echo "Usage: bash upload-to-vps.sh /path/to/shulecanteen-main.zip"
  exit 1
fi

if [ ! -f "$LOCAL_ZIP" ]; then
  echo "Error: file not found: $LOCAL_ZIP"
  exit 1
fi

echo ""
echo "===== ShuleCanteen Manual Deploy (OVERWRITE MODE) ====="
echo "Local zip : $LOCAL_ZIP"
echo "VPS target: $VPS_USER@$VPS_HOST"
echo ""

echo "[1/2] Uploading zip to VPS..."
ssh "$VPS_USER@$VPS_HOST" "mkdir -p /root/deploy"
scp "$LOCAL_ZIP" "$VPS_USER@$VPS_HOST:$REMOTE_ZIP"
echo "      Upload complete."
echo ""

echo "[2/2] Unzipping and deploying on VPS..."
ssh "$VPS_USER@$VPS_HOST" << REMOTE
  set -e

  echo "  Removing old code completely..."
  rm -rf /root/apps/shulecanteen
  
  echo "  Unzipping fresh code..."
  rm -rf "$REMOTE_DIR"
  mkdir -p "$REMOTE_DIR"
  unzip -q "$REMOTE_ZIP" -d "$REMOTE_DIR"
  
  # Detect zip structure
  TOP_LEVEL_COUNT=\$(find "$REMOTE_DIR" -maxdepth 1 -mindepth 1 | wc -l)
  TOP_LEVEL_DIRS=\$(find "$REMOTE_DIR" -maxdepth 1 -mindepth 1 -type d | wc -l)
  TOP_LEVEL_FILES=\$(find "$REMOTE_DIR" -maxdepth 1 -mindepth 1 -type f | wc -l)

  if [ "\$TOP_LEVEL_DIRS" -eq 1 ] && [ "\$TOP_LEVEL_FILES" -eq 0 ]; then
    INNER=\$(find "$REMOTE_DIR" -maxdepth 1 -mindepth 1 -type d)
    echo "  Source root (wrapper): \$INNER"
    SOURCE="\$INNER"
  else
    echo "  Source root (flat): $REMOTE_DIR"
    SOURCE="$REMOTE_DIR"
  fi

  echo "  Copying everything (including .env files)..."
  mkdir -p /root/apps/shulecanteen
  cp -r "\$SOURCE/"* /root/apps/shulecanteen/
  
  echo "  Cleaning line endings (CRLF -> LF)..."
  find /root/apps/shulecanteen -name "*.sh" -exec sed -i 's/\r$//' {} +
  
  echo "  Running deploy script..."
  bash /root/apps/shulecanteen/deploy.sh

  echo "  Cleanup..."
  rm -rf "$REMOTE_DIR" "$REMOTE_ZIP"
  echo "  Done!"
REMOTE

echo ""
echo "===== Deploy Complete ====="
echo "  Landing  : https://shulecantine.babyeyi.rw/"
echo "  Seller   : https://shulecantine.babyeyi.rw/cantine/"
echo "  Driver   : https://shulecantine.babyeyi.rw/driver/"
echo "  Supplier : http://shulecantine.babyeyi.rw/supplier/"
echo "  Admin    : http://shulecantine.babyeyi.rw/admin/"
echo ""