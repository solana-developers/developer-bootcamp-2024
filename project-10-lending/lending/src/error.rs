use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Borrowed amount exceeds the maximum LTV.")]
    OverLTV,
    #[msg("Borrowed amount results in an under collateralized loan.")]
    UnderCollateralized,
    #[msg("Insufficient funds to withdraw.")]
    InsufficientFunds,
    #[msg("Attempting to repay more than borrowed.")]
    OverRepay,
    #[msg("Attempting to borrow more than allowed.")]
    OverBorrowableAmount,
    #[msg("User is not undercollateralized.")]
    NotUndercollateralized
}