#!/usr/bin/env bash
# ShieldPay — build the Soroban contracts and deploy them to Stellar testnet.
# Requires: rustup + wasm32-unknown-unknown target, stellar CLI, jq.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NET="testnet"
SRC="${SRC_ACCOUNT:-shieldpay}"  # set SRC_ACCOUNT to your funded testnet identity

echo "==> Ensuring testnet identity '$SRC' exists & is funded"
stellar keys generate "$SRC" --network "$NET" --fund 2>/dev/null || true
ADMIN=$(stellar keys address "$SRC")
echo "   admin: $ADMIN"

echo "==> Building contracts (wasm release)"
for c in verifier pool asp; do
  ( cd "$ROOT/contracts/$c" && stellar contract build )
done

WASM_DIR="target/wasm32-unknown-unknown/release"

echo "==> Deploying verifier"
VERIFIER_ID=$(stellar contract deploy \
  --wasm "$ROOT/contracts/verifier/$WASM_DIR/shieldpay_verifier.wasm" \
  --source "$SRC" --network "$NET")
echo "   verifier: $VERIFIER_ID"
stellar contract invoke --id "$VERIFIER_ID" --source "$SRC" --network "$NET" -- init --admin "$ADMIN"

echo "==> Installing verifying key (from scripts/setup.sh output)"
node "$ROOT/scripts/vk_to_args.js" "$ROOT/circuits/build/verification_key.json" > /tmp/vk_args.json || true
echo "   (run: stellar contract invoke --id $VERIFIER_ID -- set_vk ... using /tmp/vk_args.json)"

echo "==> Deploying ASP allow-list"
ASP_ID=$(stellar contract deploy \
  --wasm "$ROOT/contracts/asp/$WASM_DIR/shieldpay_asp.wasm" \
  --source "$SRC" --network "$NET")
echo "   asp: $ASP_ID"

echo "==> Deploying pool"
POOL_ID=$(stellar contract deploy \
  --wasm "$ROOT/contracts/pool/$WASM_DIR/shieldpay_pool.wasm" \
  --source "$SRC" --network "$NET")
echo "   pool: $POOL_ID"

cat <<EOF

✅ Deployed to $NET
   VERIFIER_CONTRACT_ID=$VERIFIER_ID
   ASP_CONTRACT_ID=$ASP_ID
   POOL_CONTRACT_ID=$POOL_ID

Paste these into web/js/app.js -> CONFIG, then init the pool with your USDC SAC
and the initial Merkle + ASP roots.
EOF
