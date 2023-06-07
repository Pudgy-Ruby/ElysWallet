import Cookies from "cookies";
import clientPromise from "../../lib/mongodb";
const { createHash } = require("node:crypto");
import { Secp256k1HdWallet } from "@cosmjs/launchpad";
import CryptoJS from "crypto-js";

const PREFIX = "elys";
export default async function handler(req, res) {
  if (req.method == "POST") {
    const email = req.body["email"];
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
      .find({ Username: email })
      .toArray();
    if (users.length > 0) {
      res.redirect("/signup?msg=A user already has this email");
      return;
    }

    const password_hash = createHash("sha256").update(password).digest("hex");

    const wallet = await Secp256k1HdWallet.generate(24, { prefix: PREFIX });
    const mnemonic = wallet.mnemonic;
    const encrypted = CryptoJS.AES.encrypt(mnemonic, password_hash).toString();

    const currentDate = new Date().toUTCString();
    const bodyObject = {
      Username: email,
      Password: password_hash,
      Created: currentDate,
      Encrypted: encrypted,
    };
    await db.collection("Profiles").insertOne(bodyObject);
    const cookies = new Cookies(req, res);
    cookies.set("email", email);
    res.redirect("/");
  } else {
    res.redirect("/");
  }
}
