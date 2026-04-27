import { Wip } from "@/api/wips/wip";
import { wipMetadataAtom } from "@/atoms/tracker-atoms";
import { useAtomValue } from "jotai";
import { WipMetadataOptionsDialog } from "./wip-metadata-options-dialog";
import { WipShareDialog } from "./wip-share-dialog";

export interface OwnerOnlyWipOptionsProps {
    userId: string;
    wipId: string | undefined;
}

export const OwnerOnlyWipOptions = ({ userId, wipId }: OwnerOnlyWipOptionsProps) => {
    
    const wipMetadata = useAtomValue<Wip | null>(wipMetadataAtom); 
    const isOwner: boolean = userId === wipMetadata?.ownerId;

    return(
        <span className={`${isOwner ? "" : "invisible"}`}>
            {wipMetadata && <WipMetadataOptionsDialog wip={wipMetadata} />}
            <WipShareDialog wipId={wipId}/>
        </span>
    );
}