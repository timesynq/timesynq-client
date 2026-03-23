import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { ChangeWipNameRequest, MAX_WIP_NAME_LENGTH, Wip, WipService } from "@/api/wips/wip";
import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import LoadingIndicator from "@/assets/svg/loading-indicator.svg?react";
import CheckIcon from "@/assets/svg/check-icon.svg?react";
import { Separator } from "./ui/separator";
import { Toasts } from "@/utils/toasts";
import { Result } from "@/api/result";

export interface WipOptionsDialogProps {
    wip: Wip
    trigger?: React.ReactNode
}

export const WipOptionsDialog = ({wip, trigger}: WipOptionsDialogProps) => {

    const isMobile = useIsMobile();
    const [nameChangeInput, setNameChangeInput] = useState<string>(wip.name);
    const [isNameChangeLoading, setIsNameChangeLoading] = useState<boolean>(false);

    const handleRename = async () => {
        if (!nameChangeInput.trim())
            return;
        
        if (nameChangeInput.length < 1 || nameChangeInput.length > MAX_WIP_NAME_LENGTH){
            Toasts.error(`Name must be between 1 and ${MAX_WIP_NAME_LENGTH} characters.`);
            return;
        }

        setIsNameChangeLoading(true);
        
        const changeWipNameRequest: ChangeWipNameRequest = {
            newName: nameChangeInput
        }
        const changeWipNameResult: Result<void> = await WipService.changeWipName(wip.id, changeWipNameRequest);
        if(changeWipNameResult.isSuccessful){
            Toasts.success("Rename successful.");
        }
        else{
            Toasts.error(changeWipNameResult.message);
        }

        setIsNameChangeLoading(false);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                { trigger ??
                    <Button variant="link" className="text-foreground cursor-pointer text-lg">Options</Button>
                }
            </DialogTrigger>
            <DialogContent className={`${isMobile ? 'w-full' : 'min-w-[750px]'} h-[780px] flex flex-col`}>
                <DialogHeader className="text-2xl items-start">
                    <DialogTitle>
                        Wip Options
                    </DialogTitle>
                </DialogHeader>
                <div className="my-2 flex flex-row items-center justify-start w-full space-x-2">
                    <Label htmlFor="name" className="w-20">Name</Label>
                    <Input id="name" name="name" value={nameChangeInput} onChange={(e) => setNameChangeInput(e.target.value)} />
                    <Button variant="positive" size="icon" className="min-w-[36px] cursor-pointer" onClick={handleRename}>
                        {isNameChangeLoading ? <LoadingIndicator /> : <CheckIcon className="mr-0.5"/>}
                    </Button>
                </div>
                <Separator />
            </DialogContent>
        </Dialog>
    );
} 