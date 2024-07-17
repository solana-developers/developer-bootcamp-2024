use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Obligation {
    /// Version of the struct
    pub version: u8,
    /// Last update to collateral, liquidity, or their market values
    pub last_update: LastUpdate,
    /// Lending market address
    pub lending_market: Pubkey,
    /// Owner authority which can borrow liquidity
    pub owner: Pubkey,
    /// Deposited collateral for the obligation, unique by deposit reserve
    /// address
    pub deposits: Vec<ObligationCollateral>,
    /// Borrowed liquidity for the obligation, unique by borrow reserve address
    pub borrows: Vec<ObligationLiquidity>,
    /// Market value of deposits
    pub deposited_value: Decimal,
    /// Market value of borrows
    pub borrowed_value: Decimal,
    /// The maximum borrow value at the weighted average loan to value ratio
    pub allowed_borrow_value: Decimal,
    /// The dangerous borrow value at the weighted average liquidation threshold
    pub unhealthy_borrow_value: Decimal,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct LastUpdate {
    slot: u64,
    stale: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ObligationCollateral {
    deposit_reserve: Pubkey,
    deposited_amount: u64,
    market_value: u128,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ObligationLiquidity {
    borrow_reserve: Pubkey,
    cumulative_borrow_rate_wads: u128,
    borrowed_amount_wads: u128,
    market_value: u128,
}

#[derive(Accounts)]
pub struct InitObligation {
    #[account(
        init, 
        payer = signer, 
        space = Obligation::InitSpace,
    )]
    pub obligation: Account<'info, Obligation>,
    pub signer: Signer<'info>,
    pub lending_market: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}