import { Message, RoomMemberInfo } from '@/api/tracker/tracker-hub-models';
import { Wip, WIP_CONSTANTS } from '@/api/wips/wip';
import { atom } from 'jotai'

export const membersAtom = atom<Map<string, RoomMemberInfo>>(new Map<string, RoomMemberInfo>());

export const wipMetadataAtom = atom<Wip | null>(null);
export const messagesAtom = atom<Message[]>([]);
export const bpmAtom = atom<number>(WIP_CONSTANTS.DEFAULT_BPM);
export const channelCountAtom = atom<number>(WIP_CONSTANTS.DEFAULT_CHANNELS);
