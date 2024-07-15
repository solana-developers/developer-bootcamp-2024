use anchor_lang::prelude::*;

declare_id!("7FDB7bi9YNFgXP58kzAmQLVJdec29PH7zLrJGbsVzWW5");

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
