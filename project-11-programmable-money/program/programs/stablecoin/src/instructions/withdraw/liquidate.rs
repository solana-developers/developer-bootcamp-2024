use crate::{
    burn_tokens_internal, calculate_health_factor, error::CustomError, get_lamports_from_usd,
    withdraw_sol_internal, Collateral, Config, SEED_CONFIG_ACCOUNT,
};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, Token2022, TokenAccount};
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

#[derive(Accounts)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub liquidator: Signer<'info>,

    pub price_update: Account<'info, PriceUpdateV2>,
    #[account(
        seeds = [SEED_CONFIG_ACCOUNT],
        bump = config_account.bump,
        has_one = mint_account
    )]
    pub config_account: Account<'info, Config>,
    #[account(
        mut,
        has_one = sol_account
    )]
    pub collateral_account: Account<'info, Collateral>,
    #[account(mut)]
    pub sol_account: SystemAccount<'info>,
    #[account(mut)]
    pub mint_account: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = liquidator,
        associated_token::token_program = token_program
    )]
    pub token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}

// https://github.com/Cyfrin/foundry-defi-stablecoin-cu/blob/main/src/DSCEngine.sol#L215
pub fn process_liquidate(ctx: Context<Liquidate>, amount_to_burn: u64) -> Result<()> {
    let health_factor = calculate_health_factor(
        &ctx.accounts.collateral_account,
        &ctx.accounts.config_account,
        &ctx.accounts.price_update,
    )?;

    require!(
        health_factor < ctx.accounts.config_account.min_health_factor,
        CustomError::AboveMinimumHealthFactor
    );

    let lamports = get_lamports_from_usd(&amount_to_burn, &ctx.accounts.price_update)?;
    let liquidation_bonus = lamports * ctx.accounts.config_account.liquidation_bonus / 100;
    let amount_to_liquidate = lamports + liquidation_bonus;

    msg!("*** LIQUIDATION ***");
    msg!("Bonus {}%", ctx.accounts.config_account.liquidation_bonus);
    msg!("Bonus Amount  : {:.9}", liquidation_bonus as f64 / 1e9);
    msg!("SOL Liquidated: {:.9}", amount_to_liquidate as f64 / 1e9);

    withdraw_sol_internal(
        &ctx.accounts.sol_account,
        &ctx.accounts.liquidator.to_account_info(),
        &ctx.accounts.system_program,
        &ctx.accounts.collateral_account.depositor,
        ctx.accounts.collateral_account.bump_sol_account,
        amount_to_liquidate,
    )?;

    burn_tokens_internal(
        &ctx.accounts.mint_account,
        &ctx.accounts.token_account,
        &ctx.accounts.liquidator,
        &ctx.accounts.token_program,
        amount_to_burn,
    )?;

    let collateral_account = &mut ctx.accounts.collateral_account;
    collateral_account.lamport_balance = ctx.accounts.sol_account.lamports();
    collateral_account.amount_minted -= amount_to_burn;

    // Optional, logs new health factor
    calculate_health_factor(
        &ctx.accounts.collateral_account,
        &ctx.accounts.config_account,
        &ctx.accounts.price_update,
    )?;
    Ok(())
}
