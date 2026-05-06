import { clamp } from "./math";

export const PitchUtility = {
    pitchStringFromNumber(pitchNumber: number): string {
        const octave: number = clamp(Math.floor(pitchNumber / 12), 0, 8);
        const pitch: string = (() => {
            let result: string = "";
            switch (pitchNumber % 12) {
                case 0: result = "C-"; break;
                case 1: result = "C#"; break;
                case 2: result = "D-"; break;
                case 3: result = "D#"; break;
                case 4: result = "E-"; break;
                case 5: result = "F-"; break;
                case 6: result = "F#"; break;
                case 7: result = "G-"; break;
                case 8: result = "G#"; break;
                case 9: result = "A-"; break;
                case 10: result = "A#"; break;
                default: result = "B-";
            }
            return result;
        })();
        return `${pitch}${octave}`;
    }
}