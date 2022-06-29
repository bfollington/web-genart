/// <reference types="react" />
import * as Tone from 'tone';
import './App.css';
export declare type FrequencyWindowProps = {
    input: Tone.Volume;
    width: number;
    height: number;
    fftAnalysisSampleRate?: number;
    detail?: number;
};
export declare function FrequencyWindow({ input, width, height, fftAnalysisSampleRate, detail, }: FrequencyWindowProps): JSX.Element;
export declare function AudioNodeMonitor({ input, width, height, detail, }: FrequencyWindowProps): JSX.Element;
