"use client";

import { Keypair } from "@solana/web3.js";
import { useBasicProgram } from "./basic-data-access";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { BN } from "@coral-xyz/anchor";

export function PollCreate() {
  const { newPoll } = useBasicProgram();
  const { publicKey } = useWallet();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const pollId: BN = new BN(Number(1));
  const startTime: BN = new BN(Number(1747065554));
  const endTime: BN = new BN(Number(1847065554));

  const isFormValid = name.trim() !== "" && description.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      newPoll.mutateAsync({ pollId, startTime, endTime, name, description });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div>
      <textarea
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <br></br>
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={newPoll.isPending || !isFormValid}
      >
        Create New Poll {newPoll.isPending && "..."}
      </button>
    </div>
  );
}

// export function BasicCreate() {
//   const { newPoll } = useBasicProgram();

//   return (
//     <button
//       className="btn btn-xs lg:btn-md btn-primary"
//       onClick={() => newPoll.mutateAsync(Keypair.generate())}
//       disabled={newPoll.isPending}
//     >
//       Run program{newPoll.isPending && "..."}
//     </button>
//   );
// }

export function BasicProgram() {
  const { getProgramAccount } = useBasicProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className={"space-y-6"}>
      {/* <pre>{JSON.stringify(getProgramAccount.data.value, null, 2)}</pre> */}
    </div>
  );
}
