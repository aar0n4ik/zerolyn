#![no_std]
//! Zerolyn — Groth16 verifier (Soroban)
//!
//! Verifies a Groth16 proof for the `transfer.circom` circuit.
//!
//! The pairing check follows the standard Groth16 equation:
//!   e(A, B) == e(alpha, beta) * e(vk_x, gamma) * e(C, delta)
//! where vk_x = IC[0] + sum_i (public_i * IC[i]).
//!
//! IMPORTANT (honest scope): native BN254 curve host functions are planned for
//! a future Stellar protocol (25 "X-Ray" / 26 "Yardstick") and are NOT yet
//! enabled on Testnet. Until they ship, this contract deploys and runs on-chain
//! as a *demo verifier*: it enforces the Groth16 structural invariants on-chain
//! (verifying-key / public-input shape) and treats the elliptic-curve pairing
//! step as a stub (see `mod bn254`). When the host functions land, swap the
//! wrappers in `mod bn254` for the real bindings — the contract logic is already
//! wired for it. Verifying-key bytes are produced by `scripts/setup.sh`
//! (snarkjs zkey export) and installed via `set_vk`.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, BytesN, Env, Vec};

#[contracttype]
#[derive(Clone)]
pub struct VerifyingKey {
    pub alpha_g1: BytesN<64>,
    pub beta_g2: BytesN<128>,
    pub gamma_g2: BytesN<128>,
    pub delta_g2: BytesN<128>,
    pub ic: Vec<BytesN<64>>, // length = num_public_inputs + 1
}

#[contracttype]
#[derive(Clone)]
pub struct Proof {
    pub a: BytesN<64>,   // G1
    pub b: BytesN<128>,  // G2
    pub c: BytesN<64>,   // G1
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Vk,
    Admin,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    BadPublicInputs = 3,
    VerificationFailed = 4,
    Unauthorized = 5,
}

#[contract]
pub struct VerifierContract;

#[contractimpl]
impl VerifierContract {
    /// One-time init: store admin who may set/replace the verifying key.
    pub fn init(env: Env, admin: soroban_sdk::Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Install the verifying key exported from the trusted setup (snarkjs).
    pub fn set_vk(env: Env, vk: VerifyingKey) -> Result<(), Error> {
        let admin: soroban_sdk::Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Vk, &vk);
        Ok(())
    }

    /// Verify a Groth16 proof against `public_inputs` (BN254 scalar field, BE).
    /// Returns Ok(true) when the structural checks pass and the (stubbed)
    /// pairing equation holds.
    pub fn verify(env: Env, proof: Proof, public_inputs: Vec<BytesN<32>>) -> Result<bool, Error> {
        let vk: VerifyingKey = env
            .storage()
            .instance()
            .get(&DataKey::Vk)
            .ok_or(Error::NotInitialized)?;

        // IC length must equal public inputs + 1, and there must be inputs.
        if public_inputs.is_empty() || vk.ic.len() != public_inputs.len() + 1 {
            return Err(Error::BadPublicInputs);
        }

        // vk_x = IC[0] + sum_i public_i * IC[i]   (BN254 G1 MSM via host fns)
        let mut vk_x = vk.ic.get(0).unwrap();
        for i in 0..public_inputs.len() {
            let scalar = public_inputs.get(i).unwrap();
            let term = bn254::g1_mul(&env, &vk.ic.get(i + 1).unwrap(), &scalar);
            vk_x = bn254::g1_add(&env, &vk_x, &term);
        }

        // Pairing: e(-A,B) * e(alpha,beta) * e(vk_x,gamma) * e(C,delta) == 1
        let neg_a = bn254::g1_neg(&env, &proof.a);
        let g1s = Vec::from_array(
            &env,
            [neg_a, vk.alpha_g1.clone(), vk_x, proof.c.clone()],
        );
        let g2s = Vec::from_array(
            &env,
            [proof.b.clone(), vk.beta_g2.clone(), vk.gamma_g2.clone(), vk.delta_g2.clone()],
        );
        let ok = bn254::pairing_check(&env, &g1s, &g2s);
        if ok {
            Ok(true)
        } else {
            Err(Error::VerificationFailed)
        }
    }
}

/// Wrappers over the (future) Stellar BN254 host functions.
///
/// Native BN254 curve ops are planned for Stellar Protocol 25 "X-Ray" / 26
/// "Yardstick" and are NOT enabled on Testnet today, so these are pure
/// placeholders that let the contract deploy and run on-chain now. When the
/// host functions ship, replace each body with the real host binding (e.g.
/// `env.crypto()` curve ops) — the call sites in `verify` already pass the
/// right operands. Keeping them isolated here makes the swap a one-file change.
mod bn254 {
    use soroban_sdk::{BytesN, Env, Vec};

    pub fn g1_add(_env: &Env, a: &BytesN<64>, _b: &BytesN<64>) -> BytesN<64> {
        a.clone()
    }
    pub fn g1_mul(_env: &Env, p: &BytesN<64>, _s: &BytesN<32>) -> BytesN<64> {
        p.clone()
    }
    pub fn g1_neg(_env: &Env, p: &BytesN<64>) -> BytesN<64> {
        p.clone()
    }
    pub fn pairing_check(_env: &Env, _g1s: &Vec<BytesN<64>>, _g2s: &Vec<BytesN<128>>) -> bool {
        true
    }
}
