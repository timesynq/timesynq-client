import { ChannelMetadata, Frame, FrameMetadata, Line, Message, RoomMember, RoomMemberInfo, SequencerLine, TrackerConnection } from '@/api/tracker/tracker-hub-models';
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

const frameMetadatasAtom = atom<Map<number, FrameMetadata>>(new Map<number, FrameMetadata>());
export const initFrameMetadatasAtom = atom(
    null,
    (
        get,
        set,
        { frames } : { frames: Frame[] }
    ) => {
        const newMap = new Map<number, FrameMetadata>(get(frameMetadatasAtom));
        frames.forEach((frame) => {
            newMap.set(frame.frameNumber, {
                frameNumber: frame.frameNumber,
                length: frame.length,
                linesPerBeat: frame.linesPerBeat,
            });
        }); 
        set(frameMetadatasAtom, newMap);
    }
)
const getFrameMetadataOrDefault = (map: Map<number, FrameMetadata>, frameNumber: number): FrameMetadata => {
    return map.get(frameNumber) ?? {
        frameNumber: frameNumber,
        length: WIP_CONSTANTS.DEFAULT_LINES,
        linesPerBeat: WIP_CONSTANTS.DEFAULT_LINES_PER_BEAT,
    };
}
export const frameMetadataAtomFamily = atomFamily((frameNumber: number) => 
    atom((get) => getFrameMetadataOrDefault(get(frameMetadatasAtom), frameNumber))
)
export const setIndividualFrameMetadataAtom = atom(
    null,
    (
        get, 
        set,
        { index, updater } : { index: number, updater: (frameMetadata: FrameMetadata) => FrameMetadata }
    ) => {
        const currentFrameMetadatas: Map<number, FrameMetadata> = get(frameMetadatasAtom);
        const updatedFrameMetadatas: Map<number, FrameMetadata> = new Map<number, FrameMetadata>(currentFrameMetadatas);
        updatedFrameMetadatas.set(index, updater(getFrameMetadataOrDefault(currentFrameMetadatas, index)));

        set(frameMetadatasAtom, updatedFrameMetadatas);
    }
)

const channelMetadatasAtom = atom<Map<string, ChannelMetadata>>(new Map<string, ChannelMetadata>());
const channelKey = (frameNumber: number, channelNumber: number): string => `${frameNumber}:${channelNumber}`;
export const initChannelMetadatasAtom = atom(
    null,
    (
        get, 
        set,
        { frames } : { frames: Frame[] }
    ) => {
        const newMap = new Map<string, ChannelMetadata>(get(channelMetadatasAtom));
        frames.forEach((frame) => {
            frame.channels.forEach((channel) => {
                newMap.set(
                    channelKey(frame.frameNumber, channel.channelNumber),
                    {
                        channelNumber: channel.channelNumber,
                        isSend: channel.isSend,
                        isOn: channel.isOn,
                        isSolo: channel.isSolo
                    }
                )
            })
        })
        set(channelMetadatasAtom, newMap);
    }
)
const defaultChannelMetadataCache = new Map<string, ChannelMetadata>();
const getChannelMetadataOrDefault = (map: Map<string, ChannelMetadata>, frameNumber: number, channelNumber: number): ChannelMetadata => {
    const key: string = channelKey(frameNumber, channelNumber);

    if (map.has(key)) 
        return map.get(key)!;

    if (!defaultChannelMetadataCache.has(key)) {
        defaultChannelMetadataCache.set(key, {
            channelNumber: channelNumber,
            isSend: false,
            isOn: true,
            isSolo: false,
        });
    }

    return defaultChannelMetadataCache.get(key)!;
};
export const channelMetadataAtomFamily = atomFamily(({ frameNumber, channelNumber } : { frameNumber: number, channelNumber: number }) => 
    atom((get) => getChannelMetadataOrDefault(get(channelMetadatasAtom), frameNumber, channelNumber))
)
export const setIndividualChannelMetadataAtom = atom(
    null,
    (
        get, 
        set,
        { frameNumber, channelNumber, updater } : { frameNumber: number, channelNumber: number, updater: (channelMetadata: ChannelMetadata) => ChannelMetadata }
    ) => {
        const currentChannelMetadatas: Map<string, ChannelMetadata> = get(channelMetadatasAtom);
        const updatedChannelMetadatas: Map<string, ChannelMetadata> = new Map<string, ChannelMetadata>(currentChannelMetadatas);
        updatedChannelMetadatas.set(channelKey(frameNumber, channelNumber), updater(getChannelMetadataOrDefault(currentChannelMetadatas, frameNumber, channelNumber)));

        set(channelMetadatasAtom, updatedChannelMetadatas);
    }
)

const linesAtom = atom<Map<string, Line>>(new Map<string, Line>());
const lineKey = (frameNumber: number, channelNumber: number, lineNumber: number): string => 
    `${channelKey(frameNumber, channelNumber)}:${lineNumber}`;
export const initLinesAtom = atom(
    null,
    (
        get,
        set,
        { frames } : { frames: Frame[] }
    ) => {
        const newMap = new Map<string, Line>(get(linesAtom));
        frames.forEach((frame) => {
            frame.channels.forEach((channel) => {
                channel.lines.forEach((line) => {
                    newMap.set(
                        lineKey(frame.frameNumber, channel.channelNumber, line.lineNumber),
                        line
                    )
                })
            })
        })
        set(linesAtom, newMap);
    }
)
const defaultLineCache = new Map<string, Line>();
const getLineOrDefault = (map: Map<string, Line>, frameNumber: number, channelNumber: number, lineNumber: number): Line => {
    const key: string = lineKey(frameNumber, channelNumber, lineNumber);

    if (map.has(key)) 
        return map.get(key)!;

    if (!defaultLineCache.has(key)) {
        defaultLineCache.set(key, {
            lineNumber: lineNumber,
            pitches: null,
            instruments: null,
            fxSymbols: null,
            fxValues: null
        });
    }

    return defaultLineCache.get(key)!;
}
export const lineAtomFamily = atomFamily(({ frameNumber, channelNumber, lineNumber } : { frameNumber: number, channelNumber: number, lineNumber: number }) =>
    atom((get) => getLineOrDefault(get(linesAtom), frameNumber, channelNumber, lineNumber))
)
export const setIndividualLineAtom = atom(
    null,
    (
        get,
        set,
        { frameNumber, channelNumber, lineNumber, updater } : { frameNumber: number, channelNumber: number, lineNumber: number, updater: (line: Line) => Line } 
    ) => {
        const currentLines: Map<string, Line> = get(linesAtom);
        const updatedLines: Map<string, Line> = new Map<string, Line>(currentLines);
        updatedLines.set(lineKey(frameNumber, channelNumber, lineNumber), updater(getLineOrDefault(currentLines, frameNumber, channelNumber, lineNumber)));

        set(linesAtom, updatedLines);
    }
)