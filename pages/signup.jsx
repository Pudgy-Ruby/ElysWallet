import Layout from '../components/layout'
import { getCookie } from 'cookies-next';
import Link from 'next/link'
import React, { useState } from "react";
import CryptoJS from "crypto-js";
import crypto from "crypto";
import { Secp256k1HdWallet } from "@cosmjs/launchpad";
const PREFIX = "elys";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordagain, setPasswordAgain] = useState("");
    const [msg, setMsg] = useState("");

    const signup = async () => {
        if (password != passwordagain) {
            setMsg("The two passwords don't match");
            return;
        } else {
            setMsg("");
        }

        const password_hash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
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

        const profilesJSON = getStore("users");

        if (profilesJSON) {
            // Convert the JSON string back to an array of profiles
            for (const profile of profilesJSON) {
                if (profile.Username === email) {
                    setMsg("A user already has this email")
                    return;
                }
            }
            profilesJSON.push(bodyObject);
            setStore("users", profilesJSON);
        } else {
            // Update the state with the retrieved profiles
            setStore("users", [bodyObject]);
        }
        setMsg("Success");
    }
    const inputChange = (event) => {
        const { name, value } = event.target;
        setMsg("");
        if (name == "email") {
            setEmail(value);
        } else if (name == "password") {
            setPassword(value);
        } else if (name == "passwordagain") {
            setPasswordAgain(value)
        }
    };
    return (
        <Layout pageTitle="Signup">
            <Link href="/">Home</Link><br />
            {msg ?
                <h3 className="red">{msg}</h3>
                :
                <></>
            }
            <h2>Sign up</h2>
            <input onChange={(e) => {
                inputChange(e);
            }} minLength="3" name="email" id="email" type="text" placeholder='email' required ></input><br />
            <input onChange={(e) => {
                inputChange(e);
            }} minLength="5" name="password" id="password" type="password" placeholder='password' required></input><br />
            <input onChange={(e) => {
                inputChange(e);
            }} minLength="5" name="passwordagain" id="passwordagain" type="password" placeholder='password again' required></input><br />
            <input onChange={(e) => {
                inputChange(e);
            }} type="submit" value="Signup" onClick={signup} />
        </Layout>
    );
}

export async function getServerSideProps(context) {
    const req = context.req
    const res = context.res
    var email = getCookie('email', { req, res });
    if (email != undefined) {
        return {
            redirect: {
                permanent: false,
                destination: "/"
            }
        }
    }
    return { props: { email: false } };
};
const getStore = (name) => {
    if (!name) return;
    return JSON.parse(window.localStorage.getItem(name));
};

const setStore = (name, content) => {
    if (!name) return;
    if (typeof content !== "string") {
        content = JSON.stringify(content);
    }
    return window.localStorage.setItem(name, content);
};