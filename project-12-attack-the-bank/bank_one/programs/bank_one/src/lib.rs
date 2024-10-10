use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("HAAzYF1LMBi8R2avDaa4s2VZyMyGzA1RGQNFPXPjctZo");

#[program]
pub mod bank_one {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        *ctx.accounts.bank = Bank {
            authority: ctx.accounts.authority.key(),
            bank_balance: ctx.accounts.bank.bank_balance + amount,
            bump: ctx.bumps.bank,
        };
        msg!("{:#?}", ctx.accounts.bank);

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

#[account]
#[derive(InitSpace, Debug)]
pub struct Bank {
    pub authority: Pubkey,
    pub bank_balance: u64,
    pub bump: u8,
}
