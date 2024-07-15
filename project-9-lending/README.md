# developer-bootcamp-2024

## Lending Project

### Program state

Solana program states are stored in data accounts. There are three accounts involved here which are used for storing the state of the lending program.

1. `LendingProgram` -> This account stores the owner which has authority to manage tokens of reserve.
2. `Reserve` -> The reserve holds tokens of specific mint which are deposited by the users. It has state which keeps tracks of liquidity tokens and collateral tokens of users.
3. `Obligation` -> This account is a contract between user and the lending program. It keeps track of users deposits and borrows from reserve.

### Program Instructions

Instructions are functions where logic of the program is stored. We can create new accounts, create tokens, mint and transfer tokens with instructions. Instructions can be called from client programs.

There are seven instructions in this program.

1. `init_lending_market` -> Create new lending market account.
2. `init_reserve` -> Create new reserve account. Also create liquidity and collateral token accounts.
3. `init_obligation` -> Create new obligation for user.
4. `supply` -> Users can lend tokens by calling this instruction with token mint and token account.
5. `borrow` -> Borrow tokens from the reserve
6. `repay` -> Repay borrowed tokens
7. `withdraw` -> Withdraw all the deposited tokens.
