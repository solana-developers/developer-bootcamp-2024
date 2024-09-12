# Simplified Lending Protocol

### Disclaimer: This code is not audited and should not be used in production. There are several edge cases that have not been addressed and error handling that has not been implemented. This is for education purposes only.

## Program Terminology

1. Health Factor -
2. Max Loan to Value Ratio (LTV) - Max percentage of collateral that can be borrowed
3. Collateral -
4. Liquidation Threshold -
5. Shares -
   When users deposit assets into a lending protocol, these assets typically earn interest over time. If the protocol only recorded the initial deposit amount without a mechanism for shares:

   It would need to continuously update every user's balance as interest is added, which is computationally expensive and inefficient on a blockchain where each state update consumes gas and resources.

   By using shares:

   The total amount of deposited assets and the total number of shares issued are tracked.
   When a user deposits assets, they receive a proportion of total shares relative to their deposit.
   The value of each share increases over time as interest accrues to the pool, but the number of shares owned by each depositor remains constant. This way, the system only needs to update the total balance and the share value, not each individual's balance.

Interest Rate Model for implementing a dynamic APY:

## Formulas

**Variable Interest Rate Model:**

- $Utilization Ratio = total Borrows/total Deposits$

- $Deposit Interest Rate = d_b + min(UR, 1) * (d_m, d_b)$

- $Borrow Interest Rate = b_b + UR * (b_m - b_b)$

- $Accrued Deposit Interest = total Deposits * deposit Rate * (now - last Interest Update)$

- $Accrued Borrow Interest = total Borrows * borrow Rate (now - late Interest Update)$

where,

- $UR = Utilization Ratio$
- $d_b = Deposit Base Rate$
- $b_b = Borrow Base Rate$
- $d_m = Deposit Max Rate$
- $b_m = Borrow Max Rate$

Note: This is to be used if you are attempting the challenge to implement a dynamic apy into the program

**Share Value**

- $TotalAssets = TotalDeposits + AccruedInterest$

- $Share Price = TotalAssets / TotalShares$

- $WithdrawableAssets = UserShares * SharePrice$

**Deposit and Borrow Shares**

- $Deposit Ratio = amountDeposited / totalBankDeposits$

- $User Deposit Shares = totalBankDepositShares * depositRatio$

- $Borrow Ratio = amountBorrowed / totalBankBorrowed$

- $User Borrowed Shares = totalBankBorrowedShares * borrowRatio$

**Health Factor**

- $Total Collateral = ∑ (assetPrice_i * assetDepositAmount_i)$

- $Total Borrowed = ∑ (assetPrice_i * assetBorrowAmount_i)$

- $Health Factor =

Note: Health Factor should be updated dynamically based on key triggers:

- **Deposits/Withdrawals:** Recalculate when users deposit or withdraw collateral.
- **Borrow/Repay:** Recalculate when users borrow new funds or repay existing debts.
- **Price Updates:** Recalculate when the price feed updates the value of any assets involved.
