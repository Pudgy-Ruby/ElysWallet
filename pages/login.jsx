import Layout from '../components/layout'
import Link from 'next/link'
import crypto from "crypto";
import React, { useState } from "react";
import { useRouter } from 'next/router';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const login = async () => {
        const profilesJSON = getStore("users");

        if (!profilesJSON) {

            setMsg("Login Failed! Invalid Email and Password");
            return;
        }

        let user;
        let isExist = false;

        const password_hash = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
        for (const profile of profilesJSON) {

            if (profile.Username === email && profile.Password === password_hash) {
                user = profile;
                isExist = true;
                break;
            }
        }

        if (isExist) {
            const data = { email: email, created: user.Created, encrypted: user.Encrypted };
            router.push({ pathname: "/profile", query: data });
        } else {
            setMsg("Login Failed! Invalid Email and Password");
        }
    }
    const inputChange = (event) => {
        const { name, value } = event.target;

        if (name == "email") {
            setEmail(value);
        } else if (name == "password") {
            setPassword(value);
        }
    };
    return (
        <Layout pageTitle="Login">
            <Link href="/">Home</Link><br />
            {msg ?
                <h3 className="red">{msg}</h3>
                :
                <></>
            }
            <h2>Log in</h2>

            <input onChange={(e) => {
                inputChange(e);
            }} minLength="3" name="email" id="email" type="text" placeholder='email' required></input><br />
            <input onChange={(e) => {
                inputChange(e);
            }} minLength="5" name="password" id="password" type="password" placeholder='password' required></input><br />
            <input type="submit" value="Login" onClick={login} />
        </Layout>
    );
}
const getStore = (name) => {
    if (!name) return;
    return JSON.parse(window.localStorage.getItem(name));
};
