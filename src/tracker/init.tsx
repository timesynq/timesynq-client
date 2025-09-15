import * as Tone from "tone";

export default function SynthTest () {
    
    //create a synth and connect it to the main output (your speakers)
    const synth = new Tone.Synth().toDestination();

    const cbutton = () => synth.triggerAttackRelease("C4", "8n");

    return (
        <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded" onClick={cbutton}>Push Me!!!!!</button>
    );

}
