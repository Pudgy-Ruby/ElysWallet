import Layout from "../components/layout";
import Link from "next/link";
import React, { useState } from "react";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { GasPrice, Secp256k1HdWallet } from "@cosmjs/launchpad";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { useRouter } from 'next/router';

const elysDemon = "uelys";
const RPC_ENDPOINT = "https://rpc.testnet.elys.network/";
const PREFIX = "elys";

export default function ProfilePage() {

  const router = useRouter();
  const { email, created, encrypted } = router.query;

  const [password, setPassword] = useState("");
  const [balanceFrom, setBalanceFrom] = useState("");
  const [balanceTo, setBalanceTo] = useState("");
  const [status, setStatus] = useState("");
  const [statusDecrypt, setDecryptStatus] = useState("");
  const [addressFrom, setAddressFrom] = useState("");
  const [addressTo, setAddressTo] = useState("");
  const [amountTo, setAmountTo] = useState("");
  const [isDecrypt, setDecrypt] = useState(false);

  const inputChange = (event) => {
    const { name, value } = event.target;

    if (name == "password") {
      setPassword(value);
    } else if (name == "addressTo") {
      setAddressTo(value);
    } else if (name == "amountTo") {
      setAmountTo(value);
    } else if (name == "balanceTo") {
      setBalanceTo(value);
    }
  };
  const decrypt = async () => {
    const password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    try {
      setDecryptStatus("Decrypting...");
      const bytes = CryptoJS.AES.decrypt(encrypted, password_hash);

      var decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedMnemonic.length == 0) {
        setDecryptStatus("Failed...");

      }

      const wallet = await Secp256k1HdWallet.fromMnemonic(decryptedMnemonic, {
        prefix: PREFIX,
      });
      const [account] = await wallet.getAccounts();

      setAddressFrom(account.address);

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
          headers: {
            "Access-Control-Allow-Headers": "Content-Type"
          }
        },
      );

      client.headers = { "Access-Control-Allow-Headers": "Content-Type" };

      const balanceFrom = await client.getAllBalances(
        account.address
      );
      if (balanceFrom.length > 0) {
        setBalanceFrom(balanceFrom[0].amount);
      } else {
        setBalanceFrom("0");
      }
      setDecryptStatus("Succeeded...");
      setDecrypt(true);
    } catch (error) {
      setDecryptStatus("Failed...");
      setDecrypt(false);
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    }
  };

  const transfer = async () => {
    const password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, password_hash);

      var decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedMnemonic.length == 0) {

        return {
          redirect: {
            permanent: false,
            destination: "/",
          },
        };
      }

      const wallet = await Secp256k1HdWallet.fromMnemonic(decryptedMnemonic, {
        prefix: PREFIX,
      });
      const [account] = await wallet.getAccounts();

      setAddressFrom(account.address);

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
          headers: {
            "content-type": "application/json",
          }
        },

      );

      setStatus("Sending...");
      const fee = { amount: [{ denom: "uelys", amount: "2000", },], gas: "180000", };

      const result = await client.sendTokens(account.address, addressTo, [{ denom: "uelys", amount: "2000", },], fee, "Test");

      const tx = await client.getTx(result.transactionHash);
      console.log(tx);
      if (tx.code === 0) {
        setStatus("Sent...");
      } else {
        setStatus("Failed...");
      }

      const balanceFrom = await client.getAllBalances(
        account.address
      );
      const balanceTo = await client.getAllBalances(
        addressTo
      );
      if (balanceFrom.length > 0) {
        setBalanceFrom(balanceFrom[0].amount);
      } else {
        setBalanceFrom("0");
      }

      if (balanceTo.length > 0) {
        setBalanceTo(balanceTo[0].amount);
      } else {
        setBalanceTo("0");
      }

      setDecrypt(true);
    } catch (error) {
      setStatus("Failed...");
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    }
  };
  return (
    <Layout pageTitle="Profile">
      <Link href="/">Home</Link>
      <br />
      <h2>{email}'s Profile</h2>
      <p>
        Account created at <strong>{created}</strong>
      </p>
      <div className="col">
        <input
          type="text"
          autoComplete="on"
          value={encrypted}
          name="dmnemonic"
          className="form-control"
          id="dmnemonic"
          placeholder="Encrypted Mnemonic"
          disabled
        />

        <div className="col-sm-3 mb-2">
          <input
            type="text"
            value={addressFrom}
            autoComplete="on"
            name="address"
            onChange={(e) => {
              inputChange(e);
            }}
            className="form-control"
            id="address"
            placeholder="Address"
            disabled
          />
        </div>

        <div className="col-sm-3 mb-2">
          <input
            type="text"
            value={balanceFrom}
            autoComplete="on"
            name="balance"
            onChange={(e) => {
              inputChange(e);
            }}
            className="form-control"
            id="balance"
            placeholder="Balance"
            disabled
          />
        </div>

        <div className="col-sm-3 mb-2">
          <input
            type="password"
            value={password}
            autoComplete="on"
            name="password"
            onChange={(e) => {
              inputChange(e);
            }}
            className="form-control"
            id="password"
            placeholder="Wallet Password"
          />
        </div>

        <div className="col-sm-3 mb-2">
          <button onClick={decrypt}>Decrypt</button>
        </div>
        {<span className="red">{statusDecrypt}</span>}
        {isDecrypt && (<>
          <div className="col-sm-3 mb-2">
            <input
              type="text"
              value={amountTo}
              autoComplete="on"
              name="amountTo"
              onChange={(e) => {
                inputChange(e);
              }}
              className="form-control"
              id="amountTo"
              placeholder="Amount to send"
            />
          </div>

          <div className="col-sm-3 mb-2 m-2">
            <input
              type="text"
              value={addressTo}
              autoComplete="on"
              name="addressTo"
              onChange={(e) => {
                inputChange(e);
              }}
              className="form-control"
              id="addressTo"
              placeholder="Address To Send Elys"
            />
          </div>

          <div className="col-sm-3 mb-2">
            <input
              type="text"
              value={balanceTo}
              autoComplete="on"
              name="balanceTo"
              onChange={(e) => {
                inputChange(e);
              }}
              className="form-control"
              id="balanceTo"
              placeholder="Balance To"
              disabled
            />
          </div>

          <div className="col-sm-3 mb-2">
            <button onClick={transfer}>Transfer</button>

          </div>
          {<span className="red">{status}</span>}
        </>)}
      </div>
    </Layout>
  );
}

const getStore = (name) => {
  if (!name) return;
  return JSON.parse(window.localStorage.getItem(name));
};