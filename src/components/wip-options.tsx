import { WIP_CONSTANTS } from "@/api/wips/wip";
import { Counter } from "./counter";
import { useEffect } from "react";
import { TrackerHubClient } from "@/api/tracker/tracker-hub-client";
import { TrackerHubResult } from "@/api/tracker/tracker-hub-models";
import { UNEXPECTED_ERROR_MESSAGE } from "@/api/api-error";
import { Toasts } from "@/utils/toasts";
import { bpmAtom, channelCountAtom } from "@/atoms/tracker_atoms";
import { useAtom } from "jotai";

export interface WipOptionsProps {
    client: TrackerHubClient
}

export const WipOptions = ({ client }: WipOptionsProps) => {
    
    const [bpm, setBpm] = useAtom<number>(bpmAtom);
    const handleBpmCounterUpdate = async (newBpm: number): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateBpm(newBpm);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    const [channelCount, setChannelCount] = useAtom<number>(channelCountAtom);
    const handleChannelCounterUpdate = async (newChannelCount: number): Promise<void> => {
        const result: TrackerHubResult<void> = await client.updateChannelCount(newChannelCount);
        if (!result.isSuccessful){
            Toasts.error(result.errorMessage ?? UNEXPECTED_ERROR_MESSAGE);
        }
    }

    useEffect(() => {

        const bpmUpdatedCallback = (newBpm: number) => {
            setBpm(newBpm);
        }
        const unsubscribeBpmUpdated: () => boolean = client.subscribeBpmUpdated(bpmUpdatedCallback);

        const channelCountUpdatedCallback = (newChannelCount: number) => {
            setChannelCount(newChannelCount);
        }
        const unsubscribeChannelCountUpdated: () => boolean = client.subscribeChannelCountUpdated(channelCountUpdatedCallback);

        return () => {
            unsubscribeBpmUpdated();
            unsubscribeChannelCountUpdated();
        }
    }, []);

    return(
        <>                     
            <Counter 
                label="BPM"
                value={bpm}
                min={WIP_CONSTANTS.MIN_BPM}
                max={WIP_CONSTANTS.MAX_BPM}
                onChange={handleBpmCounterUpdate}
            />
            <Counter 
                label="Channels"
                value={channelCount}
                min={WIP_CONSTANTS.MIN_CHANNELS}
                max={WIP_CONSTANTS.MAX_CHANNELS}
                onChange={handleChannelCounterUpdate}
            />
        </>
    );
}