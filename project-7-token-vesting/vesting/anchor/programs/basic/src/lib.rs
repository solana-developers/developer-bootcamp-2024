use anchor_lang::prelude::*;
pub use anchor_spl::associated_token::AssociatedToken;
pub use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

declare_id!("7AGmMcgd1SjoMsCcXAAYwRgB9ihCyM8cZqjsUqriNRQt");

#[program]
mod vesting_contract {
    use super::*;

    pub fn create_vesting_account(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        let vesting_account = &mut ctx.accounts.vesting_account;
        vesting_account.owner = *ctx.accounts.signer.key;
        vesting_account.company_name = company_name;
        vesting_account.bump = ctx.bumps.vesting_account;

        let mint_account = ctx.accounts.mint.to_account_info();
        vesting_account.token_mint = *mint_account.key;
        vesting_account.token_decimals = ctx.accounts.mint.decimals;

        Ok(())
    }

    pub fn create_employee_vesting(
        ctx: Context<CreateEmployeeAccount>,
        beneficiary: Pubkey,
        start_time: i64,
        end_time: i64,
        total_amount: i64,
        cliff_time: i64,
    ) -> Result<()> {
        let employee_account = &mut ctx.accounts.employee_account;
        employee_account.beneficiary = beneficiary;
        employee_account.start_time = start_time;
        employee_account.end_time = end_time;
        employee_account.total_amount = total_amount;
        employee_account.total_withdrawn = 0;
        employee_account.cliff_time = cliff_time;
        employee_account.bump = ctx.bumps.employee_account;
        employee_account.vesting_account = *ctx.accounts.vesting_account.to_account_info().key;

        Ok(())
    }

    pub fn claim_tokens(
        ctx: Context<ClaimTokens>,
        _beneficiary: Pubkey,
        _company_name: String,
    ) -> Result<()> {
        let employee_account = &mut ctx.accounts.employee_account;
        let now = Clock::get()?.unix_timestamp;
        let mint_key = ctx.accounts.mint.key();

        // let seeds: &[&[u8]; 3] = &[b"vesting_auth", mint_key.as_ref(), &[ctx.bumps.mint_auth]];
        // let signer_seeds = &[&seeds[..]];

        // Check if the current time is before the cliff time
        if now < employee_account.cliff_time {
            return Err(ErrorCode::ClaimNotAvailableYet.into());
        }

        // Calculate the vested amount
        let time_since_start = now.saturating_sub(employee_account.start_time);
        let total_vesting_time = employee_account
            .end_time
            .saturating_sub(employee_account.start_time);
        let vested_amount = if now >= employee_account.end_time {
            employee_account.total_amount
        } else {
            employee_account.total_amount * (time_since_start) / (total_vesting_time)
        };

        //Calculate the amount that can be withdrawn
        let claimable_amount = vested_amount.saturating_sub(employee_account.total_withdrawn);

        // Check if there is anything left to claim
        if claimable_amount == 0 {
            return Err(ErrorCode::NothingToClaim.into());
        }

        let transfer_cpi_accounts = TransferChecked {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.employee_token_account.to_account_info(),
            authority: ctx.accounts.treasury_token_account.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, transfer_cpi_accounts);
        let decimals = ctx.accounts.vesting_account.token_decimals;

        token_interface::transfer_checked(cpi_context, claimable_amount as u64, decimals)?;

        employee_account.total_withdrawn += claimable_amount;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(beneficiary: Pubkey)]
pub struct CreateEmployeeAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        constraint = vesting_account.owner == *signer.key,
        space = 8 + EmployeeAccount::INIT_SPACE,
        payer = signer,
        seeds = [b"employee_vesting".as_ref(), beneficiary.as_ref(), vesting_account.to_account_info().key.as_ref()],
        bump, 
    )]
    pub employee_account: Account<'info, EmployeeAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        constraint = vesting_account.owner == *signer.key,
        token::mint = mint, 
        token::authority = employee_token_account, 
        payer = signer,
        seeds = [b"employee_tokens".as_ref(), beneficiary.as_ref(), vesting_account.to_account_info().key.as_ref()],
        bump, 
    )]
    pub employee_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub vesting_account: Account<'info, VestingAccount>,
}

#[derive(Accounts)]
#[instruction(company_name: String)]
pub struct CreateVestingAccount<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init, 
        space = 8 + VestingAccount::INIT_SPACE,
        payer = signer,
        seeds = [company_name.as_ref()],
        bump,
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
        init,
        token::mint = mint,
        token::authority = treasury_token_account,
        payer = signer,
        seeds = [b"vesting_treasury".as_ref(), company_name.as_ref()],
        bump,
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(beneficiary: Pubkey, company_name: String)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut, 
        seeds = [b"employee_vesting".as_ref(), beneficiary.as_ref(), vesting_account.to_account_info().key.as_ref()],
        bump,
    )]
    pub employee_account: Account<'info, EmployeeAccount>,
    #[account(
        mut, 
        seeds = [company_name.as_ref()],
        bump,
    )]
    pub vesting_account: Account<'info, VestingAccount>,
    #[account(
        mut, 
        token::mint = mint,
        token::authority = treasury_token_account,
        seeds = [b"vesting_treasury".as_ref(), company_name.as_ref()],
        bump,
    )]
    pub treasury_token_account: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = employee_token_account,
        seeds = [b"employee_tokens".as_ref(), beneficiary.as_ref(), vesting_account.to_account_info().key.as_ref()],
        bump,
    )]
    pub employee_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
#[derive(InitSpace)]
pub struct EmployeeAccount {
    pub beneficiary: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_amount: i64,
    pub total_withdrawn: i64,
    pub cliff_time: i64,
    pub vesting_account: Pubkey,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VestingAccount {
    pub owner: Pubkey,
    pub token_mint: Pubkey,
    pub token_decimals: u8,
    #[max_len(50)]
    pub company_name: String,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Claiming is not available yet.")]
    ClaimNotAvailableYet,
    #[msg("There is nothing to claim.")]
    NothingToClaim,
}
