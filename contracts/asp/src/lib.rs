#![no_std]
//! Zerolyn — ASP (Association Set Provider) allow-list contract
//!
//! Maintains the Merkle root of approved (KYC'd / non-sanctioned) recipient
//! pubkeys. The pool's transfer proof must show membership in this root, so a
//! shielded transfer to a non-approved address is impossible — this is how
//! Zerolyn keeps privacy AND compliance at the same time.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, Address, BytesN, Env};

#[contracttype]
pub enum DataKey {
    Admin,
    Root,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
}

#[contract]
pub struct AspContract;

#[contractimpl]
impl AspContract {
    pub fn init(env: Env, admin: Address, root: BytesN<32>) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Root, &root);
        Ok(())
    }

    /// Admin updates the allow-list root after re-computing it off-chain when
    /// members are added/removed (KYC approvals, sanctions delistings, etc).
    pub fn update_root(env: Env, new_root: BytesN<32>) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        env.storage().instance().set(&DataKey::Root, &new_root);
        env.events().publish((soroban_sdk::symbol_short!("asp_root"),), new_root.clone());
        Ok(())
    }

    pub fn root(env: Env) -> BytesN<32> {
        env.storage().instance().get(&DataKey::Root).unwrap()
    }
}
