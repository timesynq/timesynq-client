import { create } from 'zustand'; 

export enum SelectionType {
    Pitch,
    Instrument,
    FXSymbol,
    FXValue,
}

export type Selection = {
    frame: number;
    channel: number;
    line: number;
    group: number;
    type: SelectionType;
    charPos: number | null;
}

// this should validate by reading wip information, possibly via jotai atoms? remember to make these return Selection | null and swap select() in useSelection to accept Selection | null
export const SelectionFactory = {
    selectPitch: (
        frame: number,
        channel: number,
        line: number,
        group: number
    ): Selection => {
        return {
            frame: frame,
            channel: channel,
            line: line,
            group: group,
            type: SelectionType.Pitch,
            charPos: null
        }
    },

    selectInstrumentDigit: (
        frame: number,
        channel: number,
        line: number,
        group: number,
        charPos: number,
    ): Selection => {
        return {
            frame: frame,
            channel: channel,
            line: line,
            group: group,
            type: SelectionType.Instrument,
            charPos: charPos
        }
    },

    selectFXSymbolDigit: (
        frame: number,
        channel: number,
        line: number,
        group: number,
        charPos: number,
    ): Selection => {
        return {
            frame: frame,
            channel: channel,
            line: line,
            group: group,
            type: SelectionType.FXSymbol,
            charPos: charPos
        }
    },

    selectFXValueDigit: (
        frame: number,
        channel: number,
        line: number,
        group: number,
        charPos: number,
    ): Selection => {
        return {
            frame: frame,
            channel: channel,
            line: line,
            group: group,
            type: SelectionType.FXValue,
            charPos: charPos
        }
    }
}

interface SelectionState {
    selection: Selection | null;
    select: (newSelection: Selection) => void;
    unselect: () => void;
}

export const useSelection = create<SelectionState>((set, get) => ({
    selection: null,
    select: (newSelection: Selection): void => set({ selection: newSelection }),
    unselect: (): void => set({ selection: null}),
}))