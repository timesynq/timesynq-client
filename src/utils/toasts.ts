import { toast } from "sonner"

export const Toasts = {

    success: (description: string): void => {
        toast("Success", {
            description: description,
            style: {
                color: 'var(--timesynq-green)',
            },
        })
    },

    error: (description: string): void => {
        toast("Error", {
            description: description,
            style: {
                color: 'var(--destructive)',
            },
        })
    }

}