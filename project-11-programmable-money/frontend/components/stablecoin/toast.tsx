import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// Toast with link to solana explorer transaction
export const useTransactionToast = () => {
  const { toast } = useToast();

  const showTransactionToast = (transactionSignature: string) => {
    toast({
      title: "Transaction Sent",
      description: (
        <Button
          variant="link"
          className="p-0 text-blue-500 hover:text-blue-600"
          asChild
        >
          <a
            href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            View on Solana Explorer
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
      ),
      duration: 3000,
    });
  };

  return { showTransactionToast };
};
