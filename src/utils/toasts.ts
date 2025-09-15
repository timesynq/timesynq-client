import { toast } from "sonner"

export namespace Toasts {

    export const Error = (title: string, description: string): void => {
        toast(title, {
            description: description,
        })
    }
    
}