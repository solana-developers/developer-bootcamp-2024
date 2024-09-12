use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Bank {
    /// Authority to make changes to Bank State
    pub authority: Pubkey,
    /// Mint address of the asset 
    pub mint_address: Pubkey,
    /// Current number of tokens in the bank
    pub total_deposits: u64,
    /// Current number of deposit shares in the bank
    pub total_deposit_shares: u64,
    // Current number of borrowed tokens in the bank
    pub total_borrowed: u64,
    /// Current number of borrowed shares in the bank
    pub total_borrowed_shares: u64,
    /// LTV at which the loan is defined as under collateralized and can be liquidated 
    pub liquidation_threshold: u64,
    /// Bonus percentage of collateral that can be liquidated
    pub liquidation_bonus: u64,
    /// Percentage of collateral that can be liquidated
    pub liquidation_close_factor: u64,
    /// Max percentage of collateral that can be borrowed
    pub max_ltv: u64,
    /// Last updated timestamp
    pub last_updated: i64,
    pub interest_rate: u64,
}

// Challenge: How would you update the user state to save "all_deposited_assets" and "all_borrowed_assets" to accommodate for several asset listings?  
#[account]
#[derive(InitSpace)]
pub struct User {
    /// Pubkey of the user's wallet 
    pub owner: Pubkey,
    /// User's deposited tokens in the SOL bank
    pub deposited_sol: u64,
    /// User's deposited shares in the SOL bank 
    pub deposited_sol_shares: u64,
    /// User's borrowed tokens in the SOL bank
    pub borrowed_sol: u64,
    /// User's borrowed shares in the SOL bank
    pub borrowed_sol_shares: u64, 
    /// User's deposited tokens in the USDC bank
    pub deposited_usdc: u64,
    /// User's deposited shares in the USDC bank 
    pub deposited_usdc_shares: u64, 
    /// User's borrowed tokens in the USDC bank
    pub borrowed_usdc: u64,
    /// User's borrowed shares in the USDC bank
    pub borrowed_usdc_shares: u64, 
    /// USDC mint address
    pub usdc_address: Pubkey,
    /// Current health factor of the user
    pub health_factor: u64,
    /// Last updated timestamp
    pub last_updated: i64,
}

