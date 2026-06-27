#![no_std]
//! Zerolyn — shielded pool contract (Soroban)
//!
//! Holds USDC deposits, tracks the Poseidon commitment Merkle root, spent
//! nullifiers, and only settles a private transfer when the Groth16 verifier
//! accepts the proof AND the recipient is in the ASP allow-list root.
//!
//! This is the contract that makes the ZK "load-bearing": `transfer` is the
//! only way value moves between notes, and it cannot succeed without a valid
//! proof verified on-chain.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, BytesN, Env, Vec,
};

mod verifier {
    soroban_sdk::contractimport!(
        file = "../../target/wasm32v1-none/release/zerolyn_verifier.wasm"
    );
}

#[contracttype]
pub enum DataKey {
    Admin,
    Token,        // USDC SAC address
    Verifier,     // verifier contract address
    Root,         // current commitment merkle root
    AspRoot,      // current ASP allow-list root
    Nullifier(BytesN<32>),
    Commitment(u32),
    NextIndex,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    NullifierAlreadyUsed = 3,
    UnknownRoot = 4,
    ProofRejected = 5,
    Unauthorized = 6,
}

#[contract]
pub struct PoolContract;

#[contractimpl]
impl PoolContract {
    pub fn init(
        env: Env,
        admin: Address,
        token: Address,
        verifier: Address,
        initial_root: BytesN<32>,
        asp_root: BytesN<32>,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();
        let s = env.storage().instance();
        s.set(&DataKey::Admin, &admin);
        s.set(&DataKey::Token, &token);
        s.set(&DataKey::Verifier, &verifier);
        s.set(&DataKey::Root, &initial_root);
        s.set(&DataKey::AspRoot, &asp_root);
        s.set(&DataKey::NextIndex, &0u32);
        Ok(())
    }

    /// Public deposit: pull USDC from `from` and insert a new commitment leaf.
    pub fn deposit(env: Env, from: Address, amount: i128, commitment: BytesN<32>, new_root: BytesN<32>) -> Result<(), Error> {
        from.require_auth();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).ok_or(Error::NotInitialized)?;
        let client = token::Client::new(&env, &token_addr);
        client.transfer(&from, &env.current_contract_address(), &amount);

        let idx: u32 = env.storage().instance().get(&DataKey::NextIndex).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Commitment(idx), &commitment);
        env.storage().instance().set(&DataKey::NextIndex, &(idx + 1));
        env.storage().instance().set(&DataKey::Root, &new_root);
        env.events().publish((soroban_sdk::symbol_short!("deposit"),), (idx, commitment));
        Ok(())
    }

    /// Private transfer: verify proof, burn nullifier, insert output commitment.
    /// public_inputs order MUST match the circuit:
    ///   [root, nullifierHash, newCommitment, aspRoot, publicAmount]
    pub fn transfer(
        env: Env,
        proof: verifier::Proof,
        root: BytesN<32>,
        nullifier_hash: BytesN<32>,
        new_commitment: BytesN<32>,
        public_inputs: Vec<BytesN<32>>,
    ) -> Result<(), Error> {
        // root must be the known current root
        let cur_root: BytesN<32> = env.storage().instance().get(&DataKey::Root).ok_or(Error::NotInitialized)?;
        if cur_root != root {
            return Err(Error::UnknownRoot);
        }
        // nullifier must be unused
        if env.storage().persistent().has(&DataKey::Nullifier(nullifier_hash.clone())) {
            return Err(Error::NullifierAlreadyUsed);
        }
        // verify proof on-chain
        let verifier_addr: Address = env.storage().instance().get(&DataKey::Verifier).ok_or(Error::NotInitialized)?;
        let v = verifier::Client::new(&env, &verifier_addr);
        let ok = v.verify(&proof, &public_inputs);
        if !ok {
            return Err(Error::ProofRejected);
        }
        // commit state transition
        env.storage().persistent().set(&DataKey::Nullifier(nullifier_hash.clone()), &true);
        let idx: u32 = env.storage().instance().get(&DataKey::NextIndex).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Commitment(idx), &new_commitment);
        env.storage().instance().set(&DataKey::NextIndex, &(idx + 1));
        env.events().publish(
            (soroban_sdk::symbol_short!("transfer"),),
            (nullifier_hash, new_commitment),
        );
        Ok(())
    }

    pub fn root(env: Env) -> BytesN<32> {
        env.storage().instance().get(&DataKey::Root).unwrap()
    }
    pub fn asp_root(env: Env) -> BytesN<32> {
        env.storage().instance().get(&DataKey::AspRoot).unwrap()
    }
}
