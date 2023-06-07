import Layout from "../components/layout";
import { getCookie } from "cookies-next";
import Link from "next/link";
import clientPromise from "../lib/mongodb";
import React, { useState } from "react";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { GasPrice, Secp256k1HdWallet } from "@cosmjs/launchpad";
import { PREFIX, RPC_ENDPOINT, elysDemon } from "./constants/constants";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";

export default function ProfilePage({ username, created, encrypted }) {
  const [password, setPassword] = useState("");
  const inputChange = (event) => {
    const { name, value } = event.target;
    setPassword(value);
  };
  const decrypt = async () => {
    const password_hash = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    console.log("!@#", password_hash, encrypted);
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, password_hash);

      var decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedMnemonic.length == 0) {
        // res.redirect("/login?msg=Incorrect username or password");
        console.log("aaa");
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

      const balanceBefore = await client.getAllBalancesUnverified(
        account.address
      );

      console.log(balanceBefore);
      //   if (balanceBefore.length > 0) {
      //     this.setState({ balanceFrom: balanceBefore[0].amount });
      //   } else {
      //     this.setState({ balanceFrom: "0" });
      //   }

      //   this.setState({
      //     _mnemonic: decryptedMnemonic,
      //     address: account.address,
      //     isRecovered: true,
      //   });
    } catch (error) {
      console.log("bbb");
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
      <h2>{username}'s Profile</h2>
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
            value={""}
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
            value={""}
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
      </div>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const req = context.req;
  const res = context.res;
  var username = getCookie("username", { req, res });
  if (username == undefined) {
    return {
      redirect: {
        permanent: false,
        destination: "/",
      },
    };
  }
  const client = await clientPromise;
  const db = client.db("Users");
  const users = await db
    .collection("Profiles")
    .find({ Username: username })
    .toArray();
  const userdoc = users[0];
  const created = userdoc["Created"];
  const encrypted = userdoc["Encrypted"];
  return {
    props: { username: username, created: created, encrypted: encrypted },
  };
}
