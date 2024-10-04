use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Below Minimum Health Factor")]
    BelowMinimumHealthFactor,
    #[msg("Above Minimum Health Factor, Cannot Liquidate Healthy Account")]
    AboveMinimumHealthFactor,
    #[msg("Price should not be negative")]
    InvalidPrice,
}
