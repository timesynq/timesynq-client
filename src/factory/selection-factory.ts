import { CellSelectionType, Selection } from "@/atoms/tracker-atoms"

// this should validate by reading wip information, possibly via jotai atoms? remember to make these return Selection | null and swap select() in useSelection to accept Selection | null
export const SelectionFactory = {
    selectPitch: (
        frameNumber: number,
        channelNumber: number,
        lineNumber: number,
        group: number
    ): Selection => {
        return {
            frameNumber: frameNumber,
            channelNumber: channelNumber,
            lineNumber: lineNumber,
            group: group,
            type: CellSelectionType.Pitch,
            charPos: null
        }
    },

    selectInstrumentDigit: (
        frameNumber: number,
        channelNumber: number,
        lineNumber: number,
        group: number,
        charPos: number,
    ): Selection => {
        return {
            frameNumber: frameNumber,
            channelNumber: channelNumber,
            lineNumber: lineNumber,
            group: group,
            type: CellSelectionType.Instrument,
            charPos: charPos
        }
    },

    selectFXSymbolDigit: (
        frameNumber: number,
        channelNumber: number,
        lineNumber: number,
        group: number,
        charPos: number,
    ): Selection => {
        return {
            frameNumber: frameNumber,
            channelNumber: channelNumber,
            lineNumber: lineNumber,
            group: group,
            type: CellSelectionType.FXSymbol,
            charPos: charPos
        }
    },

    selectFXValueDigit: (
        frameNumber: number,
        channelNumber: number,
        lineNumber: number,
        group: number,
        charPos: number,
    ): Selection => {
        return {
            frameNumber: frameNumber,
            channelNumber: channelNumber,
            lineNumber: lineNumber,
            group: group,
            type: CellSelectionType.FXValue,
            charPos: charPos
        }
    }
}
