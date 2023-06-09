
import { GasPrice, Secp256k1HdWallet } from "@cosmjs/launchpad";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
const elysDemon = "uelys";
const RPC_ENDPOINT = "https://rpc.testnet.elys.network/";
const PREFIX = "elys";

export default async function handler(req, res) {

  const decryptedMnemonic = req.body['decryptedMnemonic']

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

  const balanceFrom = await client.getAllBalances(
    account.address
  );
  const address = account.address;

  // Send the variable as the response
  res.status(200).json({ balanceFrom, address });
}