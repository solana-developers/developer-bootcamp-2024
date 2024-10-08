use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Collateral {
    pub depositor: Pubkey,     // depositor wallet address
    pub sol_account: Pubkey,   // depositor pda collateral account (deposit SOL to this account)
    pub token_account: Pubkey, // depositor ata token account (mint stablecoins to this account)
    pub lamport_balance: u64, // current lamport balance of depositor sol_account (for health check calculation)
    pub amount_minted: u64, // current amount stablecoins minted, base unit adjusted for decimal precision (for health check calculation)
    pub bump: u8,           // store bump seed for this collateral account PDA
    pub bump_sol_account: u8, // store bump seed for the  sol_account PDA
    pub is_initialized: bool, // indicate if account data has already been initialized (for check to prevent overriding certain fields)
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Config {
    pub authority: Pubkey,          // authority of the this program config account
    pub mint_account: Pubkey,       // the stablecoin mint address, which is a PDA
    pub liquidation_threshold: u64, // determines how much extra collateral is required
    pub liquidation_bonus: u64,     // % bonus lamports to liquidator for liquidating an account
    pub min_health_factor: u64, // minimum health factor, if below min then Collateral account can be liquidated
    pub bump: u8,               // store bump seed for this config account
    pub bump_mint_account: u8,  // store bump seed for the stablecoin mint account PDA
}
