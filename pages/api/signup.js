import Cookies from "cookies";
import clientPromise from "../../lib/mongodb";
const { createHash } = require("node:crypto");
import { Secp256k1HdWallet } from "@cosmjs/launchpad";
import { Buffer } from "buffer";
import { PREFIX } from "../constants/constants";
import CryptoJS from "crypto-js";

export default async function handler(req, res) {
  if (req.method == "POST") {
    const username = req.body["username"];
    const password = req.body["password"];
    const passwordagain = req.body["passwordagain"];
    if (password != passwordagain) {
      res.redirect("/signup?msg=The two passwords don't match");
      return;
    }
    const client = await clientPromise;
    const db = client.db("Users");
    const users = await db
      .collection("Profiles")
      .find({ Username: username })
      .toArray();
    if (users.length > 0) {
      res.redirect("/signup?msg=A user already has this username");
      return;
    }

    const password_hash = createHash("sha256").update(password).digest("hex");

    const wallet = await Secp256k1HdWallet.generate(24, { prefix: PREFIX });
    const mnemonic = wallet.mnemonic;
    const encrypted = CryptoJS.AES.encrypt(mnemonic, password_hash).toString();

    const currentDate = new Date().toUTCString();
    const bodyObject = {
      Username: username,
      Password: password_hash,
      Created: currentDate,
      Encrypted: encrypted,
    };
    await db.collection("Profiles").insertOne(bodyObject);
    const cookies = new Cookies(req, res);
    cookies.set("username", username);
    res.redirect("/");
  } else {
    res.redirect("/");
  }
}
