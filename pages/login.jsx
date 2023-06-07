import Layout from '../components/layout'
import { getCookie } from 'cookies-next';
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function LoginPage({ email }) {
    const router = useRouter()
    const { msg } = router.query
    return (
        <Layout pageTitle="Login">
            <Link href="/">Home</Link><br />
            {msg ?
                <h3 className="red">{msg}</h3>
                :
                <></>
            }
            <h2>Log in</h2>
            <form action='/api/login' method='POST'>
                <input minLength="3" name="email" id="email" type="text" placeholder='email' required></input><br />
                <input minLength="5" name="password" id="password" type="password" placeholder='password' required></input><br />
                <input type="submit" value="Login" />
            </form>
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