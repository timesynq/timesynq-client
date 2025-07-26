import { variables } from "./variables";
//import { routes } from "./routes";

export const login = async (formData: FormData) => {
    try {
        const data = Object.fromEntries(formData);
        const response = await fetch(variables.API_LOGIN, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response;
    } 
    catch (e) {
        console.log(e);
    }

}

export const register = async (formData: FormData) => {
    try {
        const data = Object.fromEntries(formData);
        delete data["confirm-password"];
        const response = await fetch(variables.API_REGISTER, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (response.status === 200) return response;
        else return response.json();
    }

    catch (e) {
        console.log(e);
    }

}

export const signOut = async () => {
    try {
        await fetch(variables.API_SIGN_OUT, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            },
        });
    }
    catch(e){
        console.log(e);
    }

}

export const loggedIn = async () => {
    
    try {
        const response = await fetch(variables.API_USERS_ME, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
        if(response.status === 200) {
            return response.json();
        }

    } 
    catch (e) {
        console.log(e);
    }
    
}