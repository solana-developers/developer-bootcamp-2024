use anchor_lang::prelude::*;

declare_id!("BxCpw82nktAbJWnYJqXgq8HhDLL5nFsR9KYLSZLs2T19");

#[program]
pub mod basic {
    use super::*;

    pub fn greet(_ctx: Context<Initialize>) -> Result<()> {
        msg!("GM!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
