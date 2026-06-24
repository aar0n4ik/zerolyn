#!/usr/bin/env bash
# Zerolyn — compile the demo circuit and run a Groth16 trusted setup on BLS12-381.
# Produces a real proving/verifying key whose proofs are verified ON-CHAIN by the
# Soroban verifier using Stellar's native BLS12-381 host functions (Protocol 22).
# Requires: circom 2.1.6+, snarkjs 0.7+, node 18+.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CIRC="$ROOT/circuits"
BUILD="$CIRC/build"
CURVE="bls12381"
POWER="${POWER:-12}"
mkdir -p "$BUILD"

echo "==> Installing circuit deps (snarkjs)"
if [ ! -d "$CIRC/node_modules/snarkjs" ]; then
  ( cd "$CIRC" && npm init -y >/dev/null 2>&1 || true && npm i snarkjs circomlib >/dev/null 2>&1 )
fi

echo "==> Compiling demo.circom on $CURVE"
circom "$CIRC/demo.circom" --r1cs --wasm --sym --prime "$CURVE" -o "$BUILD"

echo "==> Powers of Tau ($CURVE, demo ceremony — DO NOT use in production)"
PTAU="$BUILD/pot_final.ptau"
if [ ! -f "$PTAU" ]; then
  npx snarkjs powersoftau new "$CURVE" "$POWER" "$BUILD/pot_0000.ptau" -v
  npx snarkjs powersoftau contribute "$BUILD/pot_0000.ptau" "$BUILD/pot_0001.ptau" --name="zerolyn-demo" -e="$(date +%s)"
  npx snarkjs powersoftau prepare phase2 "$BUILD/pot_0001.ptau" "$PTAU" -v
fi

echo "==> Groth16 setup + verifying key"
npx snarkjs groth16 setup "$BUILD/demo.r1cs" "$PTAU" "$BUILD/demo_0000.zkey"
npx snarkjs zkey contribute "$BUILD/demo_0000.zkey" "$BUILD/demo_final.zkey" --name="zerolyn" -e="$(date +%s)"
npx snarkjs zkey export verificationkey "$BUILD/demo_final.zkey" "$BUILD/verification_key.json"

echo "==> Convert verifying key to Soroban set_vk args"
node "$ROOT/scripts/vk_to_args.js" "$BUILD/verification_key.json" > "$BUILD/vk_args.json"

echo "==> Copy prover artifacts for the web client (verify page)"
mkdir -p "$ROOT/assets/zk"
cp "$BUILD/demo_js/demo.wasm" "$ROOT/assets/zk/demo.wasm" 2>/dev/null || true
cp "$BUILD/demo_final.zkey" "$ROOT/assets/zk/demo_final.zkey" 2>/dev/null || true
cp "$BUILD/verification_key.json" "$ROOT/assets/zk/verification_key.json" 2>/dev/null || true

echo "✅ Setup complete."
echo "   set_vk args: $BUILD/vk_args.json"
echo "   web prover:  assets/zk/demo.wasm + assets/zk/demo_final.zkey"
echo "   Next: bash scripts/deploy.sh   (deploys contracts + installs the verifying key)"
