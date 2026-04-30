import { Channel, Frame, Message, RoomMember, RoomMemberInfo, SequencerLine, TrackerConnection } from '@/api/tracker/tracker-hub-models';
import { Wip, WIP_CONSTANTS } from '@/api/wips/wip';
import { generateRandomChatColor } from '@/utils/chat-color';
import { atom } from 'jotai'
import { splitAtom } from 'jotai/utils';
import { atomFamily } from 'jotai-family';

export const membersAtom = atom<Map<string, RoomMemberInfo>>(new Map<string, RoomMemberInfo>());
export const setMemberAtom = atom(
    null,
    (
        get,
        set,
        { member, firstJoinServerMessage } : { member: RoomMember, firstJoinServerMessage: Message }
    ) => {
        let membersCopy = new Map<string, RoomMemberInfo>(get(membersAtom));
        let roomMemberInfo: RoomMemberInfo | undefined = membersCopy.get(member.userId);
        if (!roomMemberInfo){
            const newSet = new Set<string>();
            const color: string = generateRandomChatColor();
            roomMemberInfo = {
                userName: member.userName,
                connectionIds: newSet,
                chatColor: color,
            }
            membersCopy.set(member.userId, roomMemberInfo);
            set(messagesAtom, ([...get(messagesAtom), firstJoinServerMessage]));
        }

        const newConnectionIds = new Set(roomMemberInfo.connectionIds);
        newConnectionIds.add(member.connectionId);
        const updatedMemberInfo: RoomMemberInfo = {
            ...roomMemberInfo,
            connectionIds: newConnectionIds,
        }
        membersCopy.set(member.userId, updatedMemberInfo);

        set(membersAtom, new Map<string, RoomMemberInfo>(membersCopy));
    }
)
export const setRemoveMemberAtom = atom(
    null,
    (
        get,
        set,
        { trackerConnection, finalLeaveServerMessageFactory } : { trackerConnection: TrackerConnection, finalLeaveServerMessageFactory: (userName: string) => Message }
    ) => {
        let membersCopy = new Map<string, RoomMemberInfo>(get(membersAtom));
        let roomMemberInfo: RoomMemberInfo | undefined = membersCopy.get(trackerConnection.userId);
        if (!roomMemberInfo)
            return;
        const newConnectionIds = new Set(roomMemberInfo.connectionIds);
        newConnectionIds.delete(trackerConnection.connectionId);
        if(newConnectionIds.size === 0){
            set(messagesAtom, ([...get(messagesAtom), finalLeaveServerMessageFactory(roomMemberInfo.userName)]));
            membersCopy.delete(trackerConnection.userId);
        }
        else {
            const updatedMemberInfo: RoomMemberInfo = {
                ...roomMemberInfo,
                connectionIds: newConnectionIds,
            }
            membersCopy.set(trackerConnection.userId, updatedMemberInfo);
        }
        set(membersAtom, new Map<string, RoomMemberInfo>(membersCopy));
    }
)

export const setMembersAtom = atom(
    null,
    (
        get,
        set,
        { existingMembers } : { existingMembers: Map<string, RoomMemberInfo> }
    ) => {
        let membersCopy = new Map<string, RoomMemberInfo>(get(membersAtom));
        existingMembers.forEach((value, key) => {
            const memberInfo: RoomMemberInfo | undefined = membersCopy.get(key);
            if (memberInfo){
                const mergedConnectionIds = new Set(memberInfo.connectionIds);
                value.connectionIds.forEach(connectionId => mergedConnectionIds.add(connectionId));
                membersCopy.set(key, {
                    ...memberInfo,
                    connectionIds: mergedConnectionIds,
                });
            }
            else {
                membersCopy.set(key, {
                    ...value,
                    connectionIds: new Set(value.connectionIds),
                });
            }
        })
        set(membersAtom, new Map<string, RoomMemberInfo>(membersCopy));
    }
)

export const wipMetadataAtom = atom<Wip | null>(null);
export const messagesAtom = atom<Message[]>([]);
export const bpmAtom = atom<number>(WIP_CONSTANTS.DEFAULT_BPM);
export const channelCountAtom = atom<number>(WIP_CONSTANTS.DEFAULT_CHANNELS);

export const sequencerLengthAtom = atom<number>(1);
export const sequencerLinesAtom = atom<SequencerLine[]>((
    new Array(WIP_CONSTANTS.MAX_SEQUENCER_LENGTH)
        .fill(null)
        .map((_, i) => ({
            lineNumber: i,
            frameNumber: 0,
            isChannelOn: new Array(WIP_CONSTANTS.MAX_CHANNELS).fill(true)
        }))
    )
)
export const initSequencerLinesAtom = atom(
    null,
    (
        _,
        set,
        { lines } : { lines: SequencerLine[] }
    ) => {
        const defaultCopy = new Array(WIP_CONSTANTS.MAX_SEQUENCER_LENGTH)
            .fill(null)
            .map((_, i) => ({
                lineNumber: i,
                frameNumber: 0,
                isChannelOn: new Array(WIP_CONSTANTS.MAX_CHANNELS).fill(true)
            }));
        lines.forEach((line) => {
            defaultCopy[line.lineNumber] = line;
        })
        set(sequencerLinesAtom, defaultCopy);
    }
)
export const individualSequencerLinesAtom = splitAtom(sequencerLinesAtom);
export const setIndividualSequencerLineAtom = atom(
    null,
    (
        get, 
        set,
        { index, updater } : { index: number, updater: (line: SequencerLine) => SequencerLine }
    ) => {
        const currentLines: SequencerLine[] = get(sequencerLinesAtom);
        const updatedLines: SequencerLine[] = [...currentLines];
        updatedLines[index] = updater(currentLines[index]);

        set(sequencerLinesAtom, updatedLines);
    }
)

export const currentSequencerLineAtom = atom<number>(0);
export const isSequencerLineSelectedAtom = atomFamily((sequencerLineNumber: number) => 
    atom((get) => get(currentSequencerLineAtom) === sequencerLineNumber)
);
export const currentFrameNumberAtom = atom((get) => {
    return get(sequencerLinesAtom)[get(currentSequencerLineAtom)]?.frameNumber ?? 0
})

export const octaveAtom = atom<number>(4);

export const framesAtom = atom<Map<number, Frame>>(new Map<number, Frame>());
export const initFramesAtom = atom(
    null,
    (
        get,
        set,
        { frames } : { frames: Frame[] }
    ) => {
        const newMap = new Map<number, Frame>(get(framesAtom));
        frames.forEach((frame) => {
            newMap.set(frame.frameNumber, frame);
        }); 
        set(framesAtom, newMap);
    }
)
const getFrameOrDefault = (map: Map<number, Frame>, frameNumber: number): Frame => {
    return map.get(frameNumber) ?? {
        frameNumber: frameNumber,
        length: WIP_CONSTANTS.DEFAULT_LINES,
        linesPerBeat: WIP_CONSTANTS.DEFAULT_LINES_PER_BEAT,
        channels: []
    };
}
export const frameAtomFamily = atomFamily((frameNumber: number) => 
    atom((get) => getFrameOrDefault(get(framesAtom), frameNumber))
)
export const setIndividualFrameAtom = atom(
    null,
    (
        get, 
        set,
        { index, updater } : { index: number, updater: (frame: Frame) => Frame }
    ) => {
        const currentFrames: Map<number, Frame> = get(framesAtom);
        const updatedFrames: Map<number, Frame> = new Map<number, Frame>(currentFrames);
        updatedFrames.set(index, updater(getFrameOrDefault(currentFrames, index)));

        set(framesAtom, updatedFrames);
    }
)

export const currentChannelsAtom = atom<Map<number, Channel>, [Map<number, Channel>], void>(
    (get) => {
        const newMap = new Map<number, Channel>();
        const frameNumber: number = get(currentFrameNumberAtom);
        const frame: Frame = get(frameAtomFamily(frameNumber));
        frame.channels.forEach((channel: Channel) => {
            newMap.set(channel.channelNumber, channel);
        });
        return newMap;
    },
    (get, set, newChannelsMap) => {
        const frameNumber = get(currentFrameNumberAtom);
        const updatedChannels: Channel[] = Array.from(newChannelsMap.values());
        set(setIndividualFrameAtom, { index: frameNumber, updater: (frame) => ({...frame, updatedChannels})})
    }
)
const getChannelOrDefaultMap = (map: Map<number, Channel>, channelNumber: number): Channel => {
    return map.get(channelNumber) ?? {
        channelNumber: channelNumber,
        isSend: false,
        isOn: true,
        isSolo: false,
        lines: []
    }
}
const getChannelOrDefaultArr = (arr: Channel[], channelNumber: number): Channel => {
    let channelExists: boolean = false;
    let channelIndex: number = -1;
    arr.forEach((channel, index) => {
        if (!channelExists && channel.channelNumber === channelNumber){
            channelExists = true;
            channelIndex = index;
        }
    })

    return channelExists ? arr[channelIndex] : {
        channelNumber: channelNumber,
        isSend: false,
        isOn: true,
        isSolo: false,
        lines: []
    }
}
export const channelAtomFamily = atomFamily((channelNumber: number) => 
    atom((get) => getChannelOrDefaultMap(get(currentChannelsAtom), channelNumber))
)
export const setIndividualChannelAtom = atom(
    null,
    (
        _,
        set,
        { frameNumber, channelNumber, updater } : { frameNumber: number, channelNumber: number, updater: (channel: Channel) => Channel }
    ) => {
        set(setIndividualFrameAtom, { index: frameNumber, updater: (frame) => {
            const updatedChannel: Channel = updater(getChannelOrDefaultArr(frame.channels, channelNumber));
            const updatedChannels: Channel[] = Array.from(frame.channels);
            let placed: boolean = false;
            updatedChannels.forEach((channel, index) => {
                if (channel.channelNumber === channelNumber){
                    updatedChannels[index] = updatedChannel;
                    placed = true;
                }
            })
            if (!placed){
                updatedChannels.push(updatedChannel);
            }
            return {
                ...frame,
                channels: updatedChannels
            }
        }})
    }
)
