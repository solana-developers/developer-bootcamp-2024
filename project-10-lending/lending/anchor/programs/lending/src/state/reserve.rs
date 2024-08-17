use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Reserve {
    /// Version of the struct
    pub version: u8,
    /// Last slot when supply and rates updated
    pub last_update: LastUpdate,
    /// Lending market address
    pub lending_market: Pubkey,
    /// Reserve liquidity
    pub liquidity: ReserveLiquidity,
    /// Reserve collateral
    pub collateral: ReserveCollateral,
    /// Reserve configuration values
    pub config: ReserveConfig,
}

#[derive(Accounts)]
pub struct InitReserve {
    #[account(
        init, 
        payer = signer, 
        space = Reserve::InitSpace,
    )]
    pub reserve: Account<'info, Reserve>,
    pub signer: Signer<'info>,
    pub lending_market: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}