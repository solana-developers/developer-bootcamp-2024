use anchor_lang::prelude::*;

declare_id!("Eoiuq1dXvHxh6dLx3wh9gj8kSAUpga11krTrbfF5XYsC");

mod state;
mod instructions;
mod constants;

pub use instructions::*;
pub use constants::*;
pub use state::*;

#[program]
pub mod lending_protocol {
    use super::*;

    pub fn init_lending_market(ctx: Context<InitMarket>) -> Result<()> {
        let lending_market = &mut ctx.accounts.lending_market;
        lending_market.version = 1;
        lending_market.bump_seed = ctx.accounts.bump_seed;
        lending_market.owner = *ctx.accounts.owner.key;
        lending_market.quote_currency = ctx.accounts.quote_currency;
        lending_market.token_program_id = *ctx.accounts.token_program.key;
        lending_market.oracle_program_id = *ctx.accounts.oracle_program.key;
        Ok(())
    }

    pub fn init_reserve(ctx: Context<InitReserve>) -> Result<()> { 

    }

    pub fn init_obligation(
        ctx: Context<InitObligation>, 
        version: u8,
        last_update: LastUpdate,
        lending_market: Pubkey,
        owner: Pubkey,
        deposits: Vec<ObligationCollateral>,
        borrows: Vec<ObligationLiquidity>,
        deposited_value: u128,
        borrowed_value: u128,
        allowed_borrow_value: u128,
        unhealthy_borrow_value: u128,
    ) -> Result<()> { 
        let obligation = &mut ctx.accounts.obligation;
        obligation.version = version;
        obligation.last_update = last_update;
        obligation.lending_market = lending_market;
        obligation.owner = owner;
        obligation.deposits = deposits;
        obligation.borrows = borrows;
        obligation.deposited_value = deposited_value;
        obligation.borrowed_value = borrowed_value;
        obligation.allowed_borrow_value = allowed_borrow_value;
        obligation.unhealthy_borrow_value = unhealthy_borrow_value;
        Ok(())
    }

    pub fn deposit(ctx: Context<DepositCollateral>, amount: u64) -> Result<()> { 
        let ob_collateral = &mut ctx.accounts.obligation_collateral;
        ob_collateral.deposited_amount = ob_collateral.deposited_amount
            .checked_add(collateral_amount)
            .ok_or(LendingError::MathOverflow)?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<RepayCollateral>, amount: u64) -> Result<()> { 
        let ob_collateral = &mut ctx.accounts.obligation_collateral;
        ob_collateral.deposited_amount = ob_collateral.deposited_amount
            .checked_sub(collateral_amount)
            .ok_or(LendingError::MathOverflow)?;
        Ok(())
    }

    pub fn supply(ctx: Context<Supply>, amount: u64) -> Result<()> { 

    }

    pub fn borrow(ctx: Context<Borrow>, amount: u64) -> Result<()> { 

    }   
}