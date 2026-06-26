# Zerolyn — Architecture & Threat Model

> **Status legend:** **[Live]** = implemented and verifiable on Stellar Testnet today · **[Roadmap]** = designed, not yet shipped.

## 1. Goals

1. **Confidentiality** — hide transfer amounts and balances on a public ledger.
2. **Compliance** — keep regulators satisfied via (a) a public, provable compliance limit today and (b) selective disclosure + an allow-list on the roadmap.
3. **Real-world rails** — operate on real Stellar assets (XLM / USDC / EURC), not a toy token.
4. **Load-bearing ZK** — the on-chain verification is a real Groth16 pairing check, not a stub.

## 2. Components

### 2.1 Circuit (`circuits/transfer.circom`) — [Live]
A Groth16 circuit compiled over the **BLS12-381** scalar field (`--prime bls12381`). It proves, in zero knowledge, that a transfer is **solvent and compliant** without revealing the numbers:
- private `amount`, private `balance`, public `limit`;
- `amount >= 1` (a real, non-zero transfer);
- `amount <= balance` (solvency);
- `amount <= limit` (compliance).

Range checks use circomlib's field-agnostic comparators (`GreaterEqThan` / `LessEqThan` → `Num2Bits` + arithmetic), so **no curve-specific Poseidon is required** and the circuit runs on BLS12-381 today. Public signal: `limit`.

### 2.2 Verifier contract (`contracts/verifier`) — [Live]
Soroban contract that stores the verifying key and runs the standard Groth16 equation
`e(-A,B) · e(α,β) · e(vk_x,γ) · e(C,δ) == 1`
using Stellar's **native BLS12-381 host functions shipped in Protocol 22** (`env.crypto().bls12_381()`: `g1_msm`, `g1_add`, `g1_mul`, `pairing_check`). Here `vk_x = IC[0] + Σ publicᵢ · IC[i]`, and `A` is negated via the scalar `r-1`. Verifying-key bytes are exported by snarkjs (`zkey export`) and serialized uncompressed, big-endian (G1 = 96 B, G2 = 192 B, Fr = 32 B) by `scripts/vk_to_args.js`. **There is no stub** — the pairing executes inside Stellar's host.

### 2.3 Pool & ASP contracts (`contracts/pool`, `contracts/asp`) — [Roadmap]
Deployed scaffolding for the full shielded pool. The shielded-transfer logic — Poseidon note commitments, a Merkle commitment tree, a nullifier set, and ASP allow-list membership proven *inside* the circuit — is the **roadmap target** and is **not yet part of the live, on-chain-verified path**. Today the load-bearing ZK is the verifier (§2.2) + the `transfer.circom` solvency/compliance statement (§2.1). Reaching the full pool requires a BLS12-381-correct Poseidon implementation.

### 2.4 Frontend (`assets/`) — [Live]
Static, no-build multi-page site (`*.html` + `assets/`). Proofs are generated client-side with snarkjs WASM (artifacts in `assets/zk/`), so secrets never leave the device, then `verify(proof, public_inputs)` is submitted to the deployed verifier via Soroban RPC. `verify.html` and `send.html` run the full real path; `compliance.html` / `pools.html` are clearly-labelled UX demos with simulated, Groth16-shaped proofs. Wallets: **Freighter** browser extension on desktop and **Freighter Mobile via WalletConnect v2 / Reown** on phones (`assets/walletconnect.js`).

## 3. Privacy model

- **Today [Live]:** the ZK proof reveals only the public `limit`; the `amount` and `balance` stay private inside the proof. The accompanying Stellar Testnet payment on `send.html` is a normal, transparent public payment by design — the proof is a private solvency/compliance attestation about it.
- **Roadmap:** a fully shielded transfer (hidden sender/recipient, value settled inside the pool via commitments + nullifiers + Merkle membership) requires the Poseidon layer described in §2.3.

## 4. Selective disclosure — [Roadmap]

Per-transaction view keys let an auditor open exactly one shielded transfer (amount + recipient) without making everything public. This applies to shielded-pool transfers and ships together with §2.3, not to today's transparent public payments.

## 5. Threat model & mitigations

| Threat | Mitigation | Status |
|---|---|---|
| Forged transfer / fake proof | Groth16 soundness + real on-chain BLS12-381 pairing check | **Live** |
| Insolvent transfer | `amount <= balance` enforced in-circuit | **Live** |
| Over-limit (non-compliant) transfer | `amount <= limit` enforced in-circuit | **Live** |
| Double-spend | Unique nullifier set checked on-chain | Roadmap |
| Sanctioned recipient | ASP membership enforced inside the circuit | Roadmap |
| Stale root replay | Pool checks `root` equals the current root | Roadmap |
| Trusted-setup compromise | Production needs a multi-party ceremony (Powers of Tau); the bundled setup is single-party / demo | Known limitation |

## 6. Known limitations (honest)

- Hackathon prototype, unaudited, Testnet only.
- The live ZK statement is solvency + compliance over a hidden amount; the full shielded pool (Poseidon / Merkle / nullifiers, §2.3) is roadmap.
- The trusted setup in `scripts/setup.sh` is single-party (demo).
- The verifier targets the Protocol 22 BLS12-381 host ABI and must be built against a matching host.
