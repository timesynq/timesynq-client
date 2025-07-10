import { useRef, useEffect, useState } from 'react';

import { routes } from '../api/routes.ts';
import { login } from '../api/userapi.ts';

export default function Login() {

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');

    const formSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('username', user);
        formData.append('password', password);
        let response = await login(formData);
        if(response?.status === 200){
            window.location.href = routes.home;
        }
        else{
            //clear fields
            setUser("");
            setPassword("");
        }
    }

    return (

        <div>
            <h1>Login</h1>
            <form onSubmit={formSubmit}>

                        <label htmlFor="email"><b>Username</b></label>
                        <input type="username" placeholder="Enter Username" name="user" value={user} onChange={(e) => setUser(e.target.value)} required />

                        <label htmlFor="password"><b>Password</b></label>
                        <input type="password" placeholder="Enter Password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <a id="goto-forgot-password" href="./forgot-password.html">Forgot Password?</a>
                <button type="submit" value="Submit">Login</button>

            </form>
        </div>
    );
}