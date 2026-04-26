import { Message, RoomMember, RoomMemberInfo, TrackerConnection } from '@/api/tracker/tracker-hub-models';
import { Wip, WIP_CONSTANTS } from '@/api/wips/wip';
import { generateRandomChatColor } from '@/utils/chat-color';
import { atom } from 'jotai'

export const membersAtom = atom<Map<string, RoomMemberInfo>>(new Map<string, RoomMemberInfo>());
export const setMemberAtom = atom(
    null,
    (
        get,
        set,
        { member, firstJoinServerMessage } : { member: RoomMember, firstJoinServerMessage: Message}
    ) => {
        let membersCopy = get(membersAtom);
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
        roomMemberInfo.connectionIds.add(member.connectionId);
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
        let membersCopy = get(membersAtom);
        let roomMemberInfo: RoomMemberInfo | undefined = membersCopy.get(trackerConnection.userId);
        if (!roomMemberInfo)
            return;
        roomMemberInfo.connectionIds.delete(trackerConnection.connectionId);
        if(roomMemberInfo.connectionIds.size === 0){
            set(messagesAtom, ([...get(messagesAtom), finalLeaveServerMessageFactory(roomMemberInfo.userName)]));
            membersCopy.delete(trackerConnection.userId);
        }
        set(membersAtom, new Map<string, RoomMemberInfo>(membersCopy));
    }
)

export const wipMetadataAtom = atom<Wip | null>(null);
export const messagesAtom = atom<Message[]>([]);
export const bpmAtom = atom<number>(WIP_CONSTANTS.DEFAULT_BPM);
export const channelCountAtom = atom<number>(WIP_CONSTANTS.DEFAULT_CHANNELS);
