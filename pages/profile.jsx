import Layout from "../components/layout";
import Link from "next/link";
import React, { useState } from "react";
import crypto from "crypto";
import CryptoJS from "crypto-js";
import { useRouter } from 'next/router';

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

    var balanceFrom;
    try {
      setDecryptStatus("Decrypting...");
      const bytes = CryptoJS.AES.decrypt(encrypted, password_hash);

      var decryptedMnemonic = bytes.toString(CryptoJS.enc.Utf8);
      if (decryptedMnemonic.length == 0) {
        setDecryptStatus("Failed...");

      }
      try {
        const requestBody = {
          decryptedMnemonic: decryptedMnemonic,
        };

        const response = await fetch('/api/decrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const res = await response.json();
          setAddressFrom(res.address);
          if (res.balanceFrom.length > 0) {
            setBalanceFrom(res.balanceFrom[0].amount);
          } else {
            setBalanceFrom("0");
          }

        } else {
          // Handle error case
          console.log('API request failed');
        }
      } catch (error) {
        // Handle error case
        console.log('An error occurred', error);
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

      setStatus("Sending...");

      try {
        const requestBody = {
          decryptedMnemonic: decryptedMnemonic,
          addressTo: addressTo,
          amountTo: amountTo,
        };

        const response = await fetch('/api/transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const res = await response.json();
          if (res.balanceFrom.length > 0) {
            setBalanceFrom(res.balanceFrom[0].amount);
          } else {
            setBalanceFrom("0");
          }

          if (res.balanceTo.length > 0) {
            setBalanceTo(res.balanceTo[0].amount);
          } else {
            setBalanceTo("0");
          }
          setStatus("Sent...");
        } else {
          // Handle error case
          console.log('API request failed');
          setStatus("Failed...");
        }
      } catch (error) {
        setStatus("Failed...");
        // Handle error case
        console.log('An error occurred', error);
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