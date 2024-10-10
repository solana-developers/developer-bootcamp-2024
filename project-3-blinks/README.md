# Project 3: Integrating Blinks

[Blinks and Actions]() bring the blockchain to any website that can handle a hyperlink. Throughout this project, we will learn how to integrate Blinks into a website and use them to interact with a Solana smart contract.

## Resources

- [Blinks Documentation](https://solana.com/docs/advanced/actions)
- [Blinks Tester](https://dial.to)

## Running This Project

We highly recommend creating your own github repository and building along with the video. This will help you learn the most and give you a reference to look back on later.

If you want to check the final result of the project, you can clone this repository and run the following commands:

```
npm i
cd anchor
anchor build
anchor test
cd ..
npm run dev
```

You should be able to view the project at [http://localhost:3000](http://localhost:3000) and interact with the blinks at [dial.to](https://dial.to/?action=solana-action:http://localhost:3000/api/vote)