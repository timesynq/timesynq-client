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