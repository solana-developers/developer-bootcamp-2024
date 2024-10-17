use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("B8o5MhGbbxCxM5ugMZ8WKUpxrDKSUAHktdSQRSCa1S6i");

#[program]
pub mod bank_two {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank;
        bank_account.bank_balance += amount;

        if !bank_account.is_initialized {
            bank_account.is_initialized = true;
            bank_account.authority = ctx.accounts.authority.key();
            bank_account.bump = ctx.bumps.bank;
        }
        msg!("{:#?}", bank_account);

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.bank.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        ctx.accounts.bank.bank_balance -= amount;
        ctx.accounts.bank.sub_lamports(amount)?;
        ctx.accounts.authority.add_lamports(amount)?;
        msg!("{:#?}", ctx.accounts.bank);
        Ok(())
    }

    pub fn update_authority(ctx: Context<UpdateAuthority>) -> Result<()> {
        ctx.accounts.bank.authority = ctx.accounts.new_authority.key();
        msg!("{:#?}", ctx.accounts.bank);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + Bank::INIT_SPACE,
        seeds = [b"bank"],
        bump,
    )]
    pub bank: Account<'info, Bank>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"bank"],
        bump,
    )]
    pub bank: Account<'info, Bank>,
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    pub authority: SystemAccount<'info>,
    pub new_authority: SystemAccount<'info>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"bank"],
        bump,
    )]
    pub bank: Account<'info, Bank>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Bank {
    pub authority: Pubkey,
    pub bank_balance: u64,
    pub is_initialized: bool,
    pub bump: u8,
}
