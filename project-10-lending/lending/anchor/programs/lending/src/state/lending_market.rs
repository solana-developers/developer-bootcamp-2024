use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct LendingMarket {
    /// Version of lending market
    pub version: u8,
    /// Bump seed for derived authority address
    pub bump_seed: u8,
    /// Owner authority which can add new reserves
    pub owner: Pubkey,
    /// Currency market prices are quoted in
    /// e.g. "USD" null padded
    /// (`*b"USD\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0"`) or
    /// a SPL token mint pubkey
    pub quote_currency: [u8; 32],
    /// Token program id
    pub token_program_id: Pubkey,
    /// Oracle (Pyth) program id
    pub oracle_program_id: Pubkey,
}


#[derive(Accounts)]
pub struct InitMarket { 
    #[account(
        init, 
        payer = signer, 
        space = LendingMarket::InitSpace,
    )]
    pub lending_market: Account<'info, LendingMarket>,
    pub signer: Signer<'info>,
    pub token_program: AccountInfo<'info>,
    pub oracle_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}