#!/bin/bash
# ================================================================
# generate-keystores.sh
# Run ONCE on your local machine (needs Java — check: java -version)
# Generates two keystores and prints all 8 GitHub Secrets values.
# ================================================================
set -e

echo "Generating Driver keystore..."
keytool -genkey -v \
  -keystore shulecanteen-driver.keystore \
  -alias shulecanteen-driver \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass ShuleDriver2024! -keypass ShuleDriver2024! \
  -dname "CN=ShuleCanteen Driver, OU=Mobile, O=Babyeyi, L=Kigali, S=Kigali, C=RW"

echo ""
echo "Generating Seller keystore..."
keytool -genkey -v \
  -keystore shulecanteen-seller.keystore \
  -alias shulecanteen-seller \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass ShulesCanteen2024! -keypass ShulesCanteen2024! \
  -dname "CN=ShuleCanteen Seller, OU=Mobile, O=Babyeyi, L=Kigali, S=Kigali, C=RW"

echo ""
echo "==========================================================="
echo " Paste these into GitHub → Repo → Settings → Secrets"
echo "==========================================================="
echo ""
echo "--- DRIVER_KEYSTORE_BASE64 ---"
base64 -w 0 shulecanteen-driver.keystore
echo -e "\n"
echo "DRIVER_KEYSTORE_PASSWORD  →  ShuleDriver2024!"
echo "DRIVER_KEY_ALIAS          →  shulecanteen-driver"
echo "DRIVER_KEY_PASSWORD       →  ShuleDriver2024!"
echo ""
echo "--- SELLER_KEYSTORE_BASE64 ---"
base64 -w 0 shulecanteen-seller.keystore
echo -e "\n"
echo "SELLER_KEYSTORE_PASSWORD  →  ShulesCanteen2024!"
echo "SELLER_KEY_ALIAS          →  shulecanteen-seller"
echo "SELLER_KEY_PASSWORD       →  ShulesCanteen2024!"
echo ""
echo "Keystore files saved locally:"
echo "  shulecanteen-driver.keystore"
echo "  shulecanteen-seller.keystore"
echo "Back these up — you need them to update the APKs later."
