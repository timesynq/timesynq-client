import { toast } from "sonner"

export namespace Toasts {

    export const Error = (description: string): void => {
        toast("Error", {
            description: description,
        })
    }

}