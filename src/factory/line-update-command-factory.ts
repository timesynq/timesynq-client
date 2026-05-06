import { LineUpdateCommand, UpdateFXSymbolCommand, UpdateFXValueCommand, UpdateInstrumentCommand, UpdatePitchCommand } from "@/api/tracker/tracker-hub-commands";
import { Line } from "@/api/tracker/tracker-hub-models";
import { CellSelectionType, Selection } from "@/atoms/tracker-atoms";

export const LineUpdateCommandFactory = {

    create: (selection: Selection, keyboardEvent: KeyboardEvent, octave: number, line: Line): LineUpdateCommand | null => {

        let existingValue: number = 0;
        const arr = selection.type === CellSelectionType.Instrument ? 
            line.instruments : 
            selection.type === CellSelectionType.FXSymbol ? 
            line.fxSymbols : line.fxValues;
        if (arr !== null) {
            existingValue = arr[selection.group] ?? 0;
        }

        const isDelete = keyboardEvent.key === "Backspace" || keyboardEvent.key === "Delete"
        const validDigitKeys = "0123456789abcdef";
        const validPitchKeys = "zsxdcvgbhnjm";

        if (selection.type === CellSelectionType.Pitch) {
            // todo: add arrow keys
            const index = validPitchKeys.indexOf(keyboardEvent.key);
            if (index === -1 && !isDelete)
                return null;
            const newPitch: number | null = isDelete ? null : index + (octave * 12);
            const newPitchCommand: UpdatePitchCommand = {
                type: "pitch",
                frame: selection.frameNumber,
                channel: selection.channelNumber,
                line: selection.lineNumber,
                noteGroup: selection.group,
                newPitch: newPitch,
            }
            return newPitchCommand;
        }

        const index = validDigitKeys.indexOf(keyboardEvent.key);
        if (index === -1 && !isDelete || selection.charPos === null)
            return null;
        const newValue: number | null = isDelete ? null : 
            selection.charPos === 0 ? ((index * 16) + (existingValue % 16)) : ((16 * Math.floor(existingValue / 16)) + (index));

        if (selection.type === CellSelectionType.Instrument){
            const newInstrumentCommand: UpdateInstrumentCommand = {
                type: "instrument",
                frame: selection.frameNumber,
                channel: selection.channelNumber,
                line: selection.lineNumber,
                noteGroup: selection.group,
                newInstrument: newValue,
            }
            return newInstrumentCommand;
        }
        else if (selection.type === CellSelectionType.FXSymbol){
            const newFXSymbolCommand: UpdateFXSymbolCommand = {
                type: "fxSymbol",
                frame: selection.frameNumber,
                channel: selection.channelNumber,
                line: selection.lineNumber,
                fxGroup: selection.group,
                newFXSymbol: newValue,
            }
            return newFXSymbolCommand;
        }

        const newFXValueCommand: UpdateFXValueCommand = {
            type: "fxValue",
            frame: selection.frameNumber,
            channel: selection.channelNumber,
            line: selection.lineNumber,
            fxGroup: selection.group,
            newFXValue: newValue,
        }
        return newFXValueCommand;
    }

}