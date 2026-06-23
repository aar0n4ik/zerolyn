#!/usr/bin/env bash
# ShieldPay — compile the circuit and run a (demo) Groth16 trusted setup.
# Requires: circom 2.x, snarkjs, node 18+, curl.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CIRC="$ROOT/circuits"
BUILD="$CIRC/build"
mkdir -p "$BUILD"

echo "==> Installing circomlib (poseidon, comparators, bitify)"
if [ ! -d "$CIRC/node_modules/circomlib" ]; then
  ( cd "$CIRC" && npm init -y >/dev/null 2>&1 || true && npm i circomlib snarkjs >/dev/null 2>&1 )
fi

echo "==> Compiling transfer.circom"
circom "$CIRC/transfer.circom" \
  --r1cs --wasm --sym \
  -l "$CIRC/node_modules/circomlib/circuits" \
  -o "$BUILD"

echo "==> Powers of Tau (demo ceremony — DO NOT use in production)"
PTAU="$BUILD/pot16.ptau"
if [ ! -f "$PTAU" ]; then
  npx snarkjs powersoftau new bn128 16 "$BUILD/pot16_0000.ptau" -v
  npx snarkjs powersoftau contribute "$BUILD/pot16_0000.ptau" "$BUILD/pot16_0001.ptau" --name="shieldpay-demo" -e="$(date +%s)"
  npx snarkjs powersoftau prepare phase2 "$BUILD/pot16_0001.ptau" "$PTAU" -v
fi

echo "==> Groth16 zkey + verification key"
npx snarkjs groth16 setup "$BUILD/transfer.r1cs" "$PTAU" "$BUILD/transfer_0000.zkey"
npx snarkjs zkey contribute "$BUILD/transfer_0000.zkey" "$BUILD/transfer_final.zkey" --name="shieldpay" -e="$(date +%s)"
npx snarkjs zkey export verificationkey "$BUILD/transfer_final.zkey" "$BUILD/verification_key.json"

echo "==> Copy artifacts for the web client"
cp "$BUILD/transfer_js/transfer.wasm" "$ROOT/web/circuits_transfer.wasm" 2>/dev/null || true
cp "$BUILD/transfer_final.zkey" "$ROOT/web/transfer_final.zkey" 2>/dev/null || true

echo "✅ Setup complete. Verifying key: $BUILD/verification_key.json"
echo "   Next: bash scripts/deploy.sh"
