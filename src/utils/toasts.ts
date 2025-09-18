import { toast } from "sonner"

export const Toasts = {

    success: (description: string): void => {
        toast("Success", {
            description: description,
        })
    },

    error: (description: string): void => {
        toast("Error", {
            description: description,
        })
    }

}