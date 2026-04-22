import { createContext, useContext, useRef } from "react";
import { createStore, StoreApi, useStore } from "zustand";

type SelectionProviderProps = {
    children: React.ReactNode
}

const SelectionContext = createContext<StoreApi<SelectionState> | null>(null);

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

export interface SelectionState {
    selection: Selection | null;
    select: (newSelection: Selection) => void;
    unselect: () => void;
    isFocused: boolean;
    setIsFocused: (newFocus: boolean) => void;
} 

const createSelectionStore = (): StoreApi<SelectionState> => 
    createStore<SelectionState>((set) => ({
        selection: null,
        select: (newSelection: Selection): void => set({ selection: newSelection }),
        unselect: (): void => set({ selection: null}),
        isFocused: false,
        setIsFocused: (newFocus: boolean): void => set({ isFocused: newFocus }),
    }))


export const SelectionProvider = ({
    children,
}: SelectionProviderProps) => {
    const storeRef = useRef<StoreApi<SelectionState>>(null);
    if (!storeRef.current)
        storeRef.current = createSelectionStore();

    return(
        <SelectionContext.Provider value={storeRef.current}>
            {children}
        </SelectionContext.Provider>
    );
}

export const useSelection = <T,>(selector: (state: SelectionState) => T): T => {
    const context = useContext(SelectionContext);
    if (context === undefined || context === null)
        throw new Error("useSelection must be used within a SelectionProvider");
    return useStore(context, selector);
}