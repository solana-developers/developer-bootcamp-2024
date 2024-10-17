/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stablecoin.json`.
 */
export type Stablecoin = {
  address: "6DjiD8tQhJ9ZS3WZrwNubfoBRBrqfWacNR3bXBQ7ir91";
  metadata: {
    name: "stablecoin";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "depositCollateralAndMint";
      discriminator: [186, 99, 85, 148, 89, 72, 66, 57];
      accounts: [
        {
          name: "depositor";
          writable: true;
          signer: true;
        },
        {
          name: "configAccount";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "collateralAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 108, 108, 97, 116, 101, 114, 97, 108];
              },
              {
                kind: "account";
                path: "depositor";
              },
            ];
          };
        },
        {
          name: "solAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 111, 108];
              },
              {
                kind: "account";
                path: "depositor";
              },
            ];
          };
        },
        {
          name: "mintAccount";
          writable: true;
          relations: ["configAccount"];
        },
        {
          name: "priceUpdate";
        },
        {
          name: "tokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "depositor";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "mintAccount";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "tokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amountCollateral";
          type: "u64";
        },
        {
          name: "amountToMint";
          type: "u64";
        },
      ];
    },
    {
      name: "initializeConfig";
      discriminator: [208, 127, 21, 1, 194, 190, 196, 70];
      accounts: [
        {
          name: "authority";
          writable: true;
          signer: true;
        },
        {
          name: "configAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "mintAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: "tokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "liquidate";
      discriminator: [223, 179, 226, 125, 48, 46, 39, 74];
      accounts: [
        {
          name: "liquidator";
          writable: true;
          signer: true;
        },
        {
          name: "priceUpdate";
        },
        {
          name: "configAccount";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "collateralAccount";
          writable: true;
        },
        {
          name: "solAccount";
          writable: true;
          relations: ["collateralAccount"];
        },
        {
          name: "mintAccount";
          writable: true;
          relations: ["configAccount"];
        },
        {
          name: "tokenAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "liquidator";
              },
              {
                kind: "account";
                path: "tokenProgram";
              },
              {
                kind: "account";
                path: "mintAccount";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "tokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amountToBurn";
          type: "u64";
        },
      ];
    },
    {
      name: "redeemCollateralAndBurnTokens";
      discriminator: [133, 209, 165, 17, 145, 53, 164, 84];
      accounts: [
        {
          name: "depositor";
          writable: true;
          signer: true;
        },
        {
          name: "priceUpdate";
        },
        {
          name: "configAccount";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
        {
          name: "collateralAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 108, 108, 97, 116, 101, 114, 97, 108];
              },
              {
                kind: "account";
                path: "depositor";
              },
            ];
          };
        },
        {
          name: "solAccount";
          writable: true;
          relations: ["collateralAccount"];
        },
        {
          name: "mintAccount";
          writable: true;
          relations: ["configAccount"];
        },
        {
          name: "tokenAccount";
          writable: true;
          relations: ["collateralAccount"];
        },
        {
          name: "tokenProgram";
          address: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "amountCollateral";
          type: "u64";
        },
        {
          name: "amountToBurn";
          type: "u64";
        },
      ];
    },
    {
      name: "updateConfig";
      discriminator: [29, 158, 252, 191, 10, 83, 219, 99];
      accounts: [
        {
          name: "configAccount";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 111, 110, 102, 105, 103];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: "minHealthFactor";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "collateral";
      discriminator: [123, 130, 234, 63, 255, 240, 255, 92];
    },
    {
      name: "config";
      discriminator: [155, 12, 170, 224, 30, 250, 204, 130];
    },
    {
      name: "priceUpdateV2";
      discriminator: [34, 241, 35, 99, 157, 126, 244, 205];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "belowMinimumHealthFactor";
      msg: "Below Minimum Health Factor";
    },
    {
      code: 6001;
      name: "aboveMinimumHealthFactor";
      msg: "Above Minimum Health Factor, Cannot Liquidate Healthy Account";
    },
    {
      code: 6002;
      name: "invalidPrice";
      msg: "Price should not be negative";
    },
  ];
  types: [
    {
      name: "collateral";
      type: {
        kind: "struct";
        fields: [
          {
            name: "depositor";
            type: "pubkey";
          },
          {
            name: "solAccount";
            type: "pubkey";
          },
          {
            name: "tokenAccount";
            type: "pubkey";
          },
          {
            name: "lamportBalance";
            type: "u64";
          },
          {
            name: "amountMinted";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "bumpSolAccount";
            type: "u8";
          },
          {
            name: "isInitialized";
            type: "bool";
          },
        ];
      };
    },
    {
      name: "config";
      type: {
        kind: "struct";
        fields: [
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "mintAccount";
            type: "pubkey";
          },
          {
            name: "liquidationThreshold";
            type: "u64";
          },
          {
            name: "liquidationBonus";
            type: "u64";
          },
          {
            name: "minHealthFactor";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "bumpMintAccount";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "priceFeedMessage";
      repr: {
        kind: "c";
      };
      type: {
        kind: "struct";
        fields: [
          {
            name: "feedId";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "price";
            type: "i64";
          },
          {
            name: "conf";
            type: "u64";
          },
          {
            name: "exponent";
            type: "i32";
          },
          {
            name: "publishTime";
            docs: ["The timestamp of this price update in seconds"];
            type: "i64";
          },
          {
            name: "prevPublishTime";
            docs: [
              "The timestamp of the previous price update. This field is intended to allow users to",
              "identify the single unique price update for any moment in time:",
              "for any time t, the unique update is the one such that prev_publish_time < t <= publish_time.",
              "",
              "Note that there may not be such an update while we are migrating to the new message-sending logic,",
              "as some price updates on pythnet may not be sent to other chains (because the message-sending",
              "logic may not have triggered). We can solve this problem by making the message-sending mandatory",
              "(which we can do once publishers have migrated over).",
              "",
              "Additionally, this field may be equal to publish_time if the message is sent on a slot where",
              "where the aggregation was unsuccesful. This problem will go away once all publishers have",
              "migrated over to a recent version of pyth-agent.",
            ];
            type: "i64";
          },
          {
            name: "emaPrice";
            type: "i64";
          },
          {
            name: "emaConf";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "priceUpdateV2";
      docs: [
        "A price update account. This account is used by the Pyth Receiver program to store a verified price update from a Pyth price feed.",
        "It contains:",
        "- `write_authority`: The write authority for this account. This authority can close this account to reclaim rent or update the account to contain a different price update.",
        "- `verification_level`: The [`VerificationLevel`] of this price update. This represents how many Wormhole guardian signatures have been verified for this price update.",
        "- `price_message`: The actual price update.",
        "- `posted_slot`: The slot at which this price update was posted.",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "writeAuthority";
            type: "pubkey";
          },
          {
            name: "verificationLevel";
            type: {
              defined: {
                name: "verificationLevel";
              };
            };
          },
          {
            name: "priceMessage";
            type: {
              defined: {
                name: "priceFeedMessage";
              };
            };
          },
          {
            name: "postedSlot";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "verificationLevel";
      docs: [
        "Pyth price updates are bridged to all blockchains via Wormhole.",
        "Using the price updates on another chain requires verifying the signatures of the Wormhole guardians.",
        "The usual process is to check the signatures for two thirds of the total number of guardians, but this can be cumbersome on Solana because of the transaction size limits,",
        "so we also allow for partial verification.",
        "",
        "This enum represents how much a price update has been verified:",
        "- If `Full`, we have verified the signatures for two thirds of the current guardians.",
        "- If `Partial`, only `num_signatures` guardian signatures have been checked.",
        "",
        "# Warning",
        "Using partially verified price updates is dangerous, as it lowers the threshold of guardians that need to collude to produce a malicious price update.",
      ];
      type: {
        kind: "enum";
        variants: [
          {
            name: "partial";
            fields: [
              {
                name: "numSignatures";
                type: "u8";
              },
            ];
          },
          {
            name: "full";
          },
        ];
      };
    },
  ];
  constants: [
    {
      name: "feedId";
      type: "string";
      value: '"0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"';
    },
  ];
};
