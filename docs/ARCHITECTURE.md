# Zerolyn — Architecture & Threat Model

> **Status legend:** **[Live]** = implemented and verifiable on Stellar Testnet today · **[Roadmap]** = designed, not yet shipped.

## 1. Goals

1. **Confidentiality** — hide transfer amounts and balances on a public ledger.
2. **Compliance** — keep regulators satisfied via (a) a public, provable compliance limit today and (b) selective disclosure + an allow-list on the roadmap.
3. **Real-world rails** — operate on real Stellar assets (XLM / USDC / EURC), not a toy token.
4. **Load-bearing ZK** — the on-chain verification is a real Groth16 pairing check, not a stub.

## 2. Components

### 2.1 Circuit (`circuits/transfer.circom`) — [Live]
A Groth16 circuit compiled over the **BLS12-381** scalar field (`--prime bls12381`). It proves, in zero knowledge, that a transfer is **solvent and compliant** without revealing the hidden numbers:
- private `amount`, private `balance`; public `limit`, public `paid`;
- `amount >= 1` (a real, non-zero transfer);
- `amount <= balance` (solvency);
- `amount <= limit` (compliance);
- `amount === paid` (the hidden amount equals the public `paid` signal).

Range checks use circomlib's field-agnostic comparators (`GreaterEqThan` / `LessEqThan` → `Num2Bits` + arithmetic), so **no curve-specific Poseidon is required** and the circuit runs on BLS12-381 today. Public signals: `limit` and `paid` (`nPublic = 2`). Exposing `paid` (set equal to `amount`) reveals nothing new — the send-page payment is a transparent public payment — but it lets `paid` be reconciled against the real on-chain payment; see §3 and §6.

### 2.2 Verifier contract (`contracts/verifier`) — [Live]
Soroban contract that stores the verifying key and runs the standard Groth16 equation
`e(-A,B) · e(α,β) · e(vk_x,γ) · e(C,δ) == 1`
using Stellar's **native BLS12-381 host functions shipped in Protocol 22** (`env.crypto().bls12_381()`: `g1_msm`, `g1_add`, `g1_mul`, `pairing_check`). Here `vk_x = IC[0] + Σ publicᵢ · IC[i]`, and `A` is negated via the scalar `r-1`. Verifying-key bytes are exported by snarkjs (`zkey export`) and serialized uncompressed, big-endian (G1 = 96 B, G2 = 192 B, Fr = 32 B) by `scripts/vk_to_args.js`. The contract is generic over the number of public inputs (`IC.len() == nPublic + 1`), so adding `paid` only required re-running `set_vk` with the new key — no redeploy. **There is no stub** — the pairing executes inside Stellar's host.

### 2.3 Pool & ASP contracts (`contracts/pool`, `contracts/asp`) — [Roadmap]
Deployed scaffolding for the full shielded pool. The shielded-transfer logic — Poseidon note commitments, a Merkle commitment tree, a nullifier set, and ASP allow-list membership proven *inside* the circuit — is the **roadmap target** and is **not yet part of the live, on-chain-verified path**. Today the load-bearing ZK is the verifier (§2.2) + the `transfer.circom` solvency/compliance statement (§2.1). Reaching the full pool requires a BLS12-381-correct Poseidon implementation.

### 2.4 Frontend (`assets/`) — [Live]
Static, no-build multi-page site (`*.html` + `assets/`). Proofs are generated client-side with snarkjs WASM (artifacts in `assets/zk/`), so secrets never leave the device, then `verify(proof, public_inputs)` is submitted to the deployed verifier via Soroban RPC. `verify.html` and `send.html` run the full real path; `compliance.html` / `pools.html` are clearly-labelled UX demos with simulated, Groth16-shaped proofs. Wallets: **Freighter** browser extension on desktop and **Freighter Mobile via WalletConnect v2 / Reown** on phones (`assets/walletconnect.js`).

## 3. Privacy model

- **Today [Live]:** the ZK proof reveals the public `limit` and `paid` (the transferred amount); the `amount` and `balance` stay private inside the proof. Because `amount === paid` is enforced in-circuit, the hidden `amount` provably equals the public `paid`, so `paid` can be reconciled against the actual Stellar Testnet payment on `send.html` — itself a normal, transparent public payment by design. The proof is a private solvency/compliance attestation about that payment.
- **Witness honesty (important):** `amount` and `balance` are **prover-supplied private witnesses**. The circuit *soundly* proves the relationship between them (`amount >= 1`, `amount <= balance`, `amount <= limit`, `amount === paid`) and exposes `paid` publicly so the proven amount can be checked against the real payment. But the circuit does **not yet read the sender's real on-chain balance, nor does the app automatically verify `paid` against the specific Stellar payment** — `paid` remains a prover-supplied witness. The browser prover uses the real displayed balance when available and now **refuses** amounts above it instead of fabricating `balance = amount`. Cryptographically binding the proof to settlement (a public commitment to recipient/asset/amount, or proving inside the pool's `transfer`) is the top roadmap item — see §6.
- **Roadmap:** a fully shielded transfer (hidden sender/recipient, value settled inside the pool via commitments + nullifiers + Merkle membership) requires the Poseidon layer described in §2.3.

## 4. Selective disclosure — [Roadmap]

Per-transaction view keys let an auditor open exactly one shielded transfer (amount + recipient) without making everything public. This applies to shielded-pool transfers and ships together with §2.3, not to today's transparent public payments.

## 5. Threat model & mitigations

| Threat | Mitigation | Status |
|---|---|---|
| Forged transfer / fake proof | Groth16 soundness + real on-chain BLS12-381 pairing check | **Live** |
| Insolvent transfer | `amount <= balance` enforced in-circuit over the prover-supplied `balance` witness¹ | **Live (witness-bound)** |
| Over-limit (non-compliant) transfer | `amount <= limit` enforced in-circuit; `limit` is the public, app-set policy cap | **Live** |
| Proof/payment amount mismatch | `amount === paid` enforced in-circuit; `paid` is public so it can be reconciled against the on-chain payment² | **Live (reconciliation manual)** |
| Double-spend | Unique nullifier set checked on-chain | Roadmap |
| Sanctioned recipient | ASP membership enforced inside the circuit | Roadmap |
| Stale root replay | Pool checks `root` equals the current root | Roadmap |
| Trusted-setup compromise | Production needs a multi-party ceremony (Powers of Tau); the bundled setup is single-party / demo | Known limitation |

¹ `balance` (and `amount`) are private witnesses chosen by the prover, **not yet read from the sender's on-chain account**. The circuit soundly proves the *relationship* between the numbers; binding `balance` to the real account balance and binding the proof to the actual payment is roadmap (§6). The browser prover no longer fabricates `balance = amount`: an amount above the displayed balance is refused rather than trivially "proven" solvent.

² `paid` is exposed publicly and constrained to equal the hidden `amount`, so a verifier *can* compare it to the settled Stellar payment. The app does **not yet** perform that `paid`↔Horizon comparison automatically, and `paid` is prover-supplied — see §6.

## 6. Known limitations (honest)

- Hackathon prototype, unaudited, Testnet only.
- The live ZK statement is solvency + compliance over a hidden amount; the full shielded pool (Poseidon / Merkle / nullifiers, §2.3) is roadmap.
- **The proof is not yet fully bound to settlement.** The circuit now exposes a public `paid` signal and enforces `amount === paid`, so the proven amount is part of the public statement and *can* be reconciled against the on-chain payment. But `paid` is still a prover-supplied witness, the app does **not yet automatically verify `paid` against the Horizon payment**, and the proof does not bind recipient/asset or settle value inside the pool. Closing this — automatic `paid`↔payment reconciliation, and ultimately a public payment commitment or proving inside the pool's `transfer` — is the highest-priority next step.
- **Verifier `init` authorization.** `init` is one-time and **access-controlled**: it calls `admin.require_auth()`, so the admin role cannot be front-run by a third party racing the first call (`set_vk` likewise requires the stored admin's auth). The live contract is already initialized with the key installed.
- **Demo-wallet balance fallback.** When no real balance is available (e.g. the clearly-labelled demo wallet), the send page proves the entered amount as a labelled demo rather than against a real balance, and now shows an explicit on-screen notice that demo solvency uses a placeholder balance (balance set equal to amount).
- The trusted setup in `scripts/setup.sh` is single-party (demo).
- The verifier targets the Protocol 22 BLS12-381 host ABI and must be built against a matching host.
