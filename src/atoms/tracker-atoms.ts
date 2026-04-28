import { Message, RoomMember, RoomMemberInfo, SequencerLine, TrackerConnection } from '@/api/tracker/tracker-hub-models';
import { Wip, WIP_CONSTANTS } from '@/api/wips/wip';
import { generateRandomChatColor } from '@/utils/chat-color';
import { atom } from 'jotai'

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
export const currentFrameAtom = atom<number>(0);

export const sequencerLengthAtom = atom<number>(1);
export const sequencerLinesAtom = atom<SequencerLine[]>((
    new Array(WIP_CONSTANTS.MAX_SEQUENCER_LENGTH)
        .fill(null)
        .map((_, i) => ({
            line: i,
            frame: 0,
            isChannelOn: new Array(WIP_CONSTANTS.MAX_CHANNELS).fill(true)
        }))
    )
)
export const setIndividualSequencerLinesAtom = atom(
    null,
    (
        _,
        set,
        { lines } : { lines: SequencerLine[] }
    ) => {
        const defaultCopy = new Array(WIP_CONSTANTS.MAX_SEQUENCER_LENGTH)
            .fill(null)
            .map((_, i) => ({
                line: i,
                frame: 0,
                isChannelOn: new Array(WIP_CONSTANTS.MAX_CHANNELS).fill(true)
            }));
        lines.forEach((line) => {
            defaultCopy[line.line] = line;
        })
        set(sequencerLinesAtom, defaultCopy);
    }
)