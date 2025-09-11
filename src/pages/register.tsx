import { useState } from "react";
import { routes } from "../api/routes";
import { register } from "../api/userapi";
import { NavBar } from "@/components/nav-bar";


export default function Register () {

    const [email, setEmail] = useState('');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');

    const formSubmit = async (event: any) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('email', email);
        formData.append('username', user);
        formData.append('password', password);
        let response = await register(formData);
        if(response?.status === 200){
            window.location.href = routes.login;
        }
        else{

            setEmail("");
            setUser("");
            setPassword("");
        }
        console.log(response);
    }

    return (
        <>
            <NavBar></NavBar>
            <form onSubmit={formSubmit}>
                <label htmlFor="email"><b>Username</b></label>
                <input type="username" placeholder="Enter Email Address" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label htmlFor="user"><b>Username</b></label>
                <input type="username" placeholder="Enter Username" name="user" value={user} onChange={(e) => setUser(e.target.value)} required />

                <label htmlFor="password"><b>Password</b></label>
                <input type="password" placeholder="Enter Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit" value="Submit">Register</button>

            </form>
        </>
    );
}