#!/usr/bin/env bash
# Zerolyn — compile the compliant private-transfer circuit and run a Groth16
# trusted setup on BLS12-381. Produces a real proving/verifying key whose proofs
# are verified ON-CHAIN by the Soroban verifier using Stellar's native BLS12-381
# host functions (Protocol 22).
# Requires: circom 2.1.6+, snarkjs 0.7+, node 18+.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CIRC="$ROOT/circuits"
BUILD="$CIRC/build"
CURVE="bls12381"
POWER="${POWER:-12}"
CIRCUIT="${CIRCUIT:-transfer}"
mkdir -p "$BUILD"

echo "==> Installing circuit deps (snarkjs + circomlib)"
( cd "$CIRC" && npm init -y >/dev/null 2>&1 || true; npm i snarkjs circomlib >/dev/null 2>&1 || true )

echo "==> Compiling $CIRCUIT.circom on $CURVE"
circom "$CIRC/$CIRCUIT.circom" --r1cs --wasm --sym --prime "$CURVE" -l "$CIRC/node_modules" -o "$BUILD"

echo "==> Powers of Tau ($CURVE, demo ceremony — DO NOT use in production)"
PTAU="$BUILD/pot_final.ptau"
if [ ! -f "$PTAU" ]; then
  npx snarkjs powersoftau new "$CURVE" "$POWER" "$BUILD/pot_0000.ptau" -v
  npx snarkjs powersoftau contribute "$BUILD/pot_0000.ptau" "$BUILD/pot_0001.ptau" --name="zerolyn-demo" -e="$(date +%s)"
  npx snarkjs powersoftau prepare phase2 "$BUILD/pot_0001.ptau" "$PTAU" -v
fi

echo "==> Groth16 setup + verifying key"
npx snarkjs groth16 setup "$BUILD/$CIRCUIT.r1cs" "$PTAU" "$BUILD/${CIRCUIT}_0000.zkey"
npx snarkjs zkey contribute "$BUILD/${CIRCUIT}_0000.zkey" "$BUILD/${CIRCUIT}_final.zkey" --name="zerolyn" -e="$(date +%s)"
npx snarkjs zkey export verificationkey "$BUILD/${CIRCUIT}_final.zkey" "$BUILD/verification_key.json"

echo "==> Convert verifying key to Soroban set_vk args"
node "$ROOT/scripts/vk_to_args.js" "$BUILD/verification_key.json" > "$BUILD/vk_args.json"

echo "==> Copy prover artifacts for the web client"
mkdir -p "$ROOT/assets/zk"
cp "$BUILD/${CIRCUIT}_js/${CIRCUIT}.wasm" "$ROOT/assets/zk/${CIRCUIT}.wasm" 2>/dev/null || true
cp "$BUILD/${CIRCUIT}_final.zkey" "$ROOT/assets/zk/${CIRCUIT}_final.zkey" 2>/dev/null || true
cp "$BUILD/verification_key.json" "$ROOT/assets/zk/verification_key.json" 2>/dev/null || true

echo "\u2705 Setup complete."
echo "   set_vk args: $BUILD/vk_args.json"
echo "   web prover:  assets/zk/${CIRCUIT}.wasm + assets/zk/${CIRCUIT}_final.zkey"
echo "   Install the key on the LIVE verifier (no redeploy needed):"
echo "     stellar contract invoke --id <VERIFIER_ID> --source zerolyn --network testnet -- set_vk --vk \"\$(cat $BUILD/vk_args.json)\""
