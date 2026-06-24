#![no_std]
//! Zerolyn — Groth16 verifier (Soroban), REAL on-chain pairing on BLS12-381.
//!
//! Verifies a Groth16 proof using Stellar's native BLS12-381 host functions
//! (available since Protocol 22 via `env.crypto().bls12_381()`), following the
//! standard Groth16 equation:
//!   e(-A, B) * e(alpha, beta) * e(vk_x, gamma) * e(C, delta) == 1
//! where vk_x = IC[0] + sum_i (public_i * IC[i]).
//!
//! There is NO stub here: `pairing_check` is the host elliptic-curve pairing.
//!
//! Serialization (uncompressed, big-endian; produced by scripts/vk_to_args.js
//! and scripts/proof_to_args.js):
//!   Fp = 48 bytes, G1 = 96 bytes (x||y), G2 = 192 bytes (x.c0||x.c1||y.c0||y.c1),
//!   Fr / public inputs = 32 bytes big-endian.
//!
//! The verifying key is produced by scripts/setup.sh (snarkjs zkey export over
//! the bls12381 curve) and installed via `set_vk`.

use soroban_sdk::crypto::bls12_381::{Fr, G1Affine, G2Affine};
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, Bytes, BytesN, Env, Vec, U256,
};

// -1 mod r for the BLS12-381 scalar field r, big-endian (used to negate A).
// r   = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
// r-1 = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000000
const NEG_ONE: [u8; 32] = [
    0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09, 0xa1, 0xd8, 0x05,
    0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x00,
];

#[contracttype]
#[derive(Clone)]
pub struct VerifyingKey {
    pub alpha_g1: BytesN<96>,
    pub beta_g2: BytesN<192>,
    pub gamma_g2: BytesN<192>,
    pub delta_g2: BytesN<192>,
    pub ic: Vec<BytesN<96>>, // length = num_public_inputs + 1
}

#[contracttype]
#[derive(Clone)]
pub struct Proof {
    pub a: BytesN<96>,  // G1
    pub b: BytesN<192>, // G2
    pub c: BytesN<96>,  // G1
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
    pub fn init(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Install the verifying key exported from the trusted setup (snarkjs).
    pub fn set_vk(env: Env, vk: VerifyingKey) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Vk, &vk);
        Ok(())
    }

    /// Verify a Groth16 proof against `public_inputs` (BLS12-381 scalar field,
    /// 32-byte big-endian each). Runs the real pairing check on-chain and
    /// returns Ok(true) on success.
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

        let bls = env.crypto().bls12_381();

        // vk_x = IC[0] + MSM(IC[1..], public_inputs)
        let mut points: Vec<G1Affine> = Vec::new(&env);
        let mut scalars: Vec<Fr> = Vec::new(&env);
        for i in 0..public_inputs.len() {
            points.push_back(G1Affine::from_bytes(vk.ic.get(i + 1).unwrap()));
            let arr = public_inputs.get(i).unwrap().to_array();
            let u = U256::from_be_bytes(&env, &Bytes::from_array(&env, &arr));
            scalars.push_back(Fr::from_u256(u));
        }
        let acc = bls.g1_msm(points, scalars);
        let ic0 = G1Affine::from_bytes(vk.ic.get(0).unwrap());
        let vk_x = bls.g1_add(&ic0, &acc);

        // -A (negate via scalar multiplication by r-1)
        let neg_one = Fr::from_u256(U256::from_be_bytes(&env, &Bytes::from_array(&env, &NEG_ONE)));
        let neg_a = bls.g1_mul(&G1Affine::from_bytes(proof.a.clone()), &neg_one);

        // Pairing inputs: e(-A,B) * e(alpha,beta) * e(vk_x,gamma) * e(C,delta) == 1
        let mut g1s: Vec<G1Affine> = Vec::new(&env);
        g1s.push_back(neg_a);
        g1s.push_back(G1Affine::from_bytes(vk.alpha_g1.clone()));
        g1s.push_back(vk_x);
        g1s.push_back(G1Affine::from_bytes(proof.c.clone()));

        let mut g2s: Vec<G2Affine> = Vec::new(&env);
        g2s.push_back(G2Affine::from_bytes(proof.b.clone()));
        g2s.push_back(G2Affine::from_bytes(vk.beta_g2.clone()));
        g2s.push_back(G2Affine::from_bytes(vk.gamma_g2.clone()));
        g2s.push_back(G2Affine::from_bytes(vk.delta_g2.clone()));

        if bls.pairing_check(g1s, g2s) {
            Ok(true)
        } else {
            Err(Error::VerificationFailed)
        }
    }
}
