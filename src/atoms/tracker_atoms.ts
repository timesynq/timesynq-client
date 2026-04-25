import { WIP_CONSTANTS } from '@/api/wips/wip';
import { atom } from 'jotai'

export const bpmAtom = atom<number>(WIP_CONSTANTS.DEFAULT_BPM);
export const channelCountAtom = atom<number>(WIP_CONSTANTS.DEFAULT_CHANNELS);