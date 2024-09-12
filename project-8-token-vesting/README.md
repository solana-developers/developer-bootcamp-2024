# Developer Bootcamp 2024
# Token Vesting

### Disclaimer: This code is not audited and should not be used in production. There are several edge cases that have not been addressed and error handling that has not been implemented. This is for education purposes only.

This repository contains a Solana smart contract written in Rust using the Anchor framework for managing token vesting schedules. The program allows for the creation of vesting accounts for companies and employees, enabling token distributions based on predefined vesting schedules.

This project is generated with the [create-solana-dapp](https://github.com/solana-developers/create-solana-dapp) generator.

## Features

Create Vesting Account: Set up a vesting account for a company, specifying the company name and associated accounts.
Create Employee Vesting: Establish a vesting schedule for an employee, including start and end times, total amount, and a cliff period.
Claim Tokens: Allows employees to claim their vested tokens after the cliff period, based on the time elapsed and the amount vested.

## Program Functions

- `create_vesting_account`: Initializes a vesting account for a company and initializes a vesting token account to hold the entire token allocation.
- `create_employee_vesting`: Initializes a vesting schedule for an employee adn initializes an employee token account to receive their unlocked allocation.
- `claim_tokens`: Allows an employee to claim all vested tokens that have unlocked.

## Account Structures

- `CreateEmployeeAccount`: Account structure for creating an employee vesting account.
- `CreateVestingAccount`: Account structure for creating a company's vesting account.
- `ClaimTokens`: Account structure for claiming tokens.

## Data Structures

- `EmployeeAccount`: Stores details about an employee's vesting schedule.
- `VestingAccount`: Stores details about a company's vesting account.

## Running the App

### Anchor

To use this contract, you'll need to set up your Solana development environment. Here are the prerequisites and steps to get started:

1. Sync the program ID:

```shell
npm run anchor keys sync
```

Note: Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/vesting-exports.ts` to match the new program id.

2. Build the project:

```shell
npm run anchor-build
```

3. Start the test validator and deploy your program:

```shell
npm run anchor-localnet
```

### Web App

1. Install Dependencies

```shell
npm install
```

2. Start the Web App

```shell
npm run dev
```
