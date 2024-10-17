use crate::{
    burn_tokens_internal, check_health_factor, withdraw_sol_internal, Collateral, Config,
    SEED_COLLATERAL_ACCOUNT, SEED_CONFIG_ACCOUNT,
};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022, TokenAccount};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

#[derive(Accounts)]
pub struct RedeemCollateralAndBurnTokens<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    pub price_update: Account<'info, PriceUpdateV2>,
    #[account(
        seeds = [SEED_CONFIG_ACCOUNT],
        bump = config_account.bump,
        has_one = mint_account
    )]
    pub config_account: Account<'info, Config>,
    #[account(
        mut,
        seeds = [SEED_COLLATERAL_ACCOUNT, depositor.key().as_ref()],
        bump = collateral_account.bump,
        has_one = sol_account,
        has_one = token_account
    )]
    pub collateral_account: Account<'info, Collateral>,
    #[account(mut)]
    pub sol_account: SystemAccount<'info>,
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

// https://github.com/Cyfrin/foundry-defi-stablecoin-cu/blob/main/src/DSCEngine.sol#L157
pub fn process_redeem_collateral_and_burn_tokens(
    ctx: Context<RedeemCollateralAndBurnTokens>,
    amount_collateral: u64,
    amount_to_burn: u64,
) -> Result<()> {
    let collateral_account = &mut ctx.accounts.collateral_account;
    collateral_account.lamport_balance = ctx.accounts.sol_account.lamports() - amount_collateral;
    collateral_account.amount_minted -= amount_to_burn;

    check_health_factor(
        &ctx.accounts.collateral_account,
        &ctx.accounts.config_account,
        &ctx.accounts.price_update,
    )?;

    burn_tokens_internal(
        &ctx.accounts.mint_account,
        &ctx.accounts.token_account,
        &ctx.accounts.depositor,
        &ctx.accounts.token_program,
        amount_to_burn,
    )?;

    withdraw_sol_internal(
        &ctx.accounts.sol_account,
        &ctx.accounts.depositor.to_account_info(),
        &ctx.accounts.system_program,
        &ctx.accounts.depositor.key(),
        ctx.accounts.collateral_account.bump_sol_account,
        amount_collateral,
    )?;

    Ok(())
}
