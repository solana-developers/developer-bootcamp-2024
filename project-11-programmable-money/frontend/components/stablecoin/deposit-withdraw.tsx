import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CollateralMintUI from "@/components/stablecoin/deposit";
import RedeemBurnUI from "@/components/stablecoin/withdraw";

// deposit/withdraw widget
const DepositWithdrawUI = () => {
  const [mode, setMode] = useState("deposit");

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Deposit and Withdraw</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>
          <TabsContent value="deposit">
            <CollateralMintUI />
          </TabsContent>
          <TabsContent value="withdraw">
            <RedeemBurnUI />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DepositWithdrawUI;
