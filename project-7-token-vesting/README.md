# developer-bootcamp-2024

## Token Vesting

This dApp allows for any project to use the UI and create a vesting account and set up individual employee vesting information. It also allows for any employee to claim all currently available tokens.

### Program Functions

- `create_vesting_account`: Initializes a vesting account for a company and initializes a vesting token account to hold the entire token allocation.
- `create_employee_vesting`: Initializes a vesting schedule for an employee adn initializes an employee token account to receive their unlocked allocation.
- `claim_tokens`: Allows an employee to claim all vested tokens that have unlocked.

### Account Structures

- `CreateEmployeeAccount`: Account structure for creating an employee vesting account.
- `CreateVestingAccount`: Account structure for creating a company's vesting account.
- `ClaimTokens`: Account structure for claiming tokens.

### Data Structures

- `EmployeeAccount`: Stores details about an employee's vesting schedule.
- `VestingAccount`: Stores details about a company's vesting account.
