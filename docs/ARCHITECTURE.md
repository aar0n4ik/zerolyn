# ShieldPay — Architecture & Threat Model

## 1. Goals

1. **Confidentiality** — hide transfer amounts and counterparties on a public ledger.
2. **Compliance** — keep regulators satisfied via (a) selective disclosure to an auditor and (b) an allow-list that blocks sanctioned recipients.
3. **Real-world rails** — operate on USDC, not a toy token.
4. **Load-bearing ZK** — the protocol must be impossible without the proof.

## 2. Components

### 2.1 Circuit (`circuits/transfer.circom`)
A Groth16 circuit over BN254 using Poseidon. It enforces:
- **Ownership** — prover knows the spending secret behind the input note commitment.
- **Membership** — the input commitment is in the pool's Merkle tree at the published `root` (20 levels).
- **Nullifier correctness** — `nullifierHash = Poseidon(inCommitment, secret)` prevents double-spends and is unlinkable to the note.
- **Value conservation** — `inAmount = outAmount + publicAmount` with 64-bit range checks (no field-overflow tricks).
- **Compliance** — the recipient pubkey is in the ASP allow-list Merkle tree at `aspRoot` (16 levels).

Public signals: `root, nullifierHash, newCommitment, aspRoot, publicAmount`.

### 2.2 Verifier contract (`contracts/verifier`)
Soroban contract that stores the verifying key and runs the Groth16 pairing check using the Stellar BN254 host functions shipped in Protocol 25 (“X-Ray”) and extended in Protocol 26 (“Yardstick”). Verifying key bytes come from the snarkjs `zkey export`.

### 2.3 Pool contract (`contracts/pool`)
Custodies USDC, maintains the commitment root + nullifier set, and exposes:
- `deposit` — pulls USDC and inserts a commitment leaf.
- `transfer` — checks `root` is current, the nullifier is fresh, calls the verifier, and only then burns the nullifier + inserts the output commitment. **This call is the chokepoint that makes the proof mandatory.**

### 2.4 ASP contract (`contracts/asp`)
Holds the allow-list Merkle root of KYC'd / non-sanctioned recipient pubkeys; admin updates it as membership changes. The circuit proves membership against this root.

### 2.5 Frontend (`web/`)
Generates proofs client-side (snarkjs WASM), so secrets never leave the device, then submits proof + public signals to the pool via the Stellar SDK.

## 3. Privacy model
- On-chain observers see: a nullifier, a new commitment, the two roots, and `publicAmount` (0 for internal transfers). They learn **nothing** about amount, sender note, or recipient.
- Linkability between deposit and spend is broken by the nullifier construction.

## 4. Selective disclosure
Each note carries a blinding factor. An auditor holding the recipient's **view key** can recompute the commitment and confirm amount + recipient for a specific transfer, giving regulators a lawful window without making everything public.

## 5. Threat model & mitigations
| Threat | Mitigation |
|---|---|
| Double-spend | Unique nullifier set, checked on-chain. |
| Forged transfer | Groth16 soundness + on-chain verification. |
| Sanctioned recipient | ASP membership enforced inside the circuit. |
| Value inflation | In-circuit value conservation + range checks. |
| Stale root replay | Pool checks `root` equals the current root. |
| Trusted-setup compromise | Production needs a multi-party ceremony (Powers of Tau) — the bundled setup is demo-only. |

## 6. Known limitations (honest)
- Hackathon prototype, unaudited; testnet only.
- The verifier's host-function bindings are written against the Protocol 25/26 BN254 ABI and must be built against a matching host.
- The trusted setup ceremony in `scripts/setup.sh` is single-party (demo).
- Withdrawals and multi-input/multi-output notes are sketched but trimmed for hackathon scope.
