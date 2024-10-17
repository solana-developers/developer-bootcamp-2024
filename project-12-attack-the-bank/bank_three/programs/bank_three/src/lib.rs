use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("H2vvatVxBg1LufZqsXBuc4BHgK5TKLmrGY7rSEK2dD2L");

#[program]
pub mod bank_three {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let bank_account = &mut ctx.accounts.bank;

        if !bank_account.is_initialized {
            bank_account.is_initialized = true;
            bank_account.authority = ctx.accounts.authority.key();
            bank_account.vault = ctx.accounts.vault.key();
        }

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // Manual deserialization of account data
        let bank_account = ctx.accounts.bank.try_borrow_data()?;
        let mut account_data_slice: &[u8] = &bank_account;
        let bank_state = Bank::try_deserialize(&mut account_data_slice)?;

        // Authority Check
        if bank_state.authority != ctx.accounts.authority.key() {
            return Err(ProgramError::InvalidAccountData.into());
        }

        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", &[ctx.bumps.vault]]];
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.authority.to_account_info(),
                },
            )
            .with_signer(signer_seeds),
            amount,
        )?;
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
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub bank: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"vault"],
        bump,
    )]
    pub vault: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace, Debug)]
pub struct Bank {
    pub authority: Pubkey,
    pub vault: Pubkey,
    pub is_initialized: bool,
}
