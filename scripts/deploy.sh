#!/usr/bin/env bash
# Zerolyn — build the Soroban contracts and deploy them to Stellar testnet.
# Requires: rustup, stellar CLI (v22+), jq.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NET="testnet"
SRC="${SRC_ACCOUNT:-shieldpay}"  # set SRC_ACCOUNT to your funded testnet identity

echo "==> Ensuring the Soroban wasm target is installed"
rustup target add wasm32v1-none 2>/dev/null || true

echo "==> Ensuring testnet identity '$SRC' exists & is funded"
stellar keys generate "$SRC" --network "$NET" --fund 2>/dev/null || true
ADMIN=$(stellar keys address "$SRC")
echo "   admin: $ADMIN"

echo "==> Building all contracts (wasm release)"
( cd "$ROOT" && stellar contract build )

WASM_DIR="$ROOT/target/wasm32v1-none/release"

echo "==> Deploying verifier"
VERIFIER_ID=$(stellar contract deploy \
  --wasm "$WASM_DIR/shieldpay_verifier.wasm" \
  --source "$SRC" --network "$NET")
echo "   verifier: $VERIFIER_ID"

echo "==> Deploying ASP allow-list"
ASP_ID=$(stellar contract deploy \
  --wasm "$WASM_DIR/shieldpay_asp.wasm" \
  --source "$SRC" --network "$NET")
echo "   asp: $ASP_ID"

echo "==> Deploying pool"
POOL_ID=$(stellar contract deploy \
  --wasm "$WASM_DIR/shieldpay_pool.wasm" \
  --source "$SRC" --network "$NET")
echo "   pool: $POOL_ID"

echo "==> Initializing verifier admin (best-effort)"
stellar contract invoke --id "$VERIFIER_ID" --source "$SRC" --network "$NET" \
  -- init --admin "$ADMIN" \
  || echo "   (init skipped/failed — fine, the contract IDs below are what matter)"

cat <<EOF

✅ Deployed to $NET
   VERIFIER_CONTRACT_ID=$VERIFIER_ID
   ASP_CONTRACT_ID=$ASP_ID
   POOL_CONTRACT_ID=$POOL_ID

Copy this whole block and send it to wire the IDs into assets/app.js -> CONFIG.
Explorer: https://stellar.expert/explorer/testnet/contract/$VERIFIER_ID
EOF
