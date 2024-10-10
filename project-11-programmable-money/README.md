# Programmable Money

### Disclaimer: This code is not audited and should not be used in production. There are several edge cases that have not been addressed and error handling that has not been implemented. This is for education purposes only.

## Frontend

View hosted frontend here: [Programmable Money UI](anchor-stablecoin.vercel.app)

## Anchor Program

1. Build the program

```shell
cd program
anchor build
```

2. Run local validator

```shell
solana-test-validator
```

3. Deploy the program locally

```shell
anchor deploy --provider.cluster localnet
```

4. Test

```shell
anchor test
```
