
import { GasPrice, Secp256k1HdWallet } from "@cosmjs/launchpad";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
const elysDemon = "uelys";
const RPC_ENDPOINT = "https://rpc.testnet.elys.network/";
const PREFIX = "elys";

export default async function handler(req, res) {

    const decryptedMnemonic = req.body['decryptedMnemonic']
    const addressTo = req.body['addressTo']
    const amountTo = req.body['amountTo']

    console.log("ASDFASDF", decryptedMnemonic);
    const wallet = await Secp256k1HdWallet.fromMnemonic(decryptedMnemonic, {
        prefix: PREFIX,
      });
      const [account] = await wallet.getAccounts();

      const aliceSigner = await DirectSecp256k1HdWallet.fromMnemonic(
        decryptedMnemonic,
        { prefix: PREFIX }
      );
      const client = await SigningStargateClient.connectWithSigner(
        RPC_ENDPOINT,
        aliceSigner,
        {
          gasPrice: GasPrice.fromString("0.025" + elysDemon),
          gasLimits: { send: 100000 },
        },
      );
      const fee = { amount: [{ denom: "uelys", amount: "2000", },], gas: "180000", };

      const result = await client.sendTokens(account.address, addressTo, [{ denom: "uelys", amount: amountTo, },], fee, "Test");

      const tx = await client.getTx(result.transactionHash);

      
      console.log(tx);
      if (tx.code === 0) {
        const balanceFrom = await client.getAllBalances(
          account.address
        );
        const balanceTo = await client.getAllBalances(
          addressTo
        );
        res.status(200).json({ balanceFrom, balanceTo});      
      } else {
        res.status(403).json({ tx });      
      }
}