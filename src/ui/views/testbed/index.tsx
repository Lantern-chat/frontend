import Adapter from "webrtc-adapter";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

var ctx = new AudioContext();

import KeyboardTest from "ui/assets/keyboardtest.wav";

// https://github.com/ericschmidt/noise-reduction/blob/master/src/audio.js

class Meter {
    ctx: AudioContext;
    node: AnalyserNode;

    avg_level: number = 0;
    avg_deviation: number = 0;
    counter: number = 0;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.node = ctx.createAnalyser();
        this.node.fftSize = 2048;
    }

    measure() {
        let freqData = new Uint8Array(this.node.frequencyBinCount);
        this.node.getByteFrequencyData(freqData);

        var total = 0;
        for(var i = 0; i < freqData.length; i++) {
            total += freqData[i];
        }
        var level = total / freqData.length;

        // Find the time-average of the level and deviation
        this.avg_level = (this.avg_level * this.counter + level) / (this.counter + 1);
        var deviation = Math.abs(level - this.avg_level);
        this.avg_deviation = (this.avg_deviation * this.counter + deviation) / (this.counter + 1);
        this.counter++;

        return { level: this.avg_level, deviation: this.avg_deviation };
    }

    reset() {
        this.avg_level = 0;
        this.avg_deviation = 0;
        this.counter = 0;
    }
}

class NoiseGate {
    noise_floor: number = 0.1;
    threshold: number = 1;
    target: number = 20;
    interval: number = 10;

    _timer: null | number = null;

    meter: Meter;

    input: AnalyserNode;
    output: GainNode;

    constructor(ctx: AudioContext) {
        this.meter = new Meter(ctx);
        this.input = this.meter.node;
        this.output = ctx.createGain();
        this.input.connect(this.output);
    }

    adjust_noise_gate() {
        let { level, deviation } = this.meter.measure();

        let threshold = level - 2 * deviation;

        if(level < threshold || threshold <= 0) {
            this.output.gain.value = this.noise_floor;
        } else {
            this.output.gain.value = this.target / level;
        }
    }

    start() {
        this.stop();

        this._timer = setInterval(() => {
            this.adjust_noise_gate();
        }, this.interval) as any;
    }

    stop() {
        if(this._timer !== null) {
            clearInterval(this._timer);
        }
    }
}

function sigmoid(x: number): number {
    return 1 / (1 + Math.pow(2, -x));
}

function poly(x: number): number {
    return x <= 0 ? 0 : Math.min(1, x * x);
}

function lerp(t: number, a: number, b: number): number {
    return (1 - t) * a + t * b;
}

/*
function generateNoiseFloorCurve( floor ) {
    // "floor" is 0...1

    var curve = new Float32Array(65536);
    var mappedFloor = floor * 32768;

    for (var i=0; i<32768; i++) {
        var value = (i<mappedFloor) ? 0 : 1;

        curve[32768-i] = -value;
        curve[32768+i] = value;
    }
    curve[0] = curve[1]; // fixing up the end.

    return curve;
}
 */

function genNoiseFloorCurve(floor: number): Float32Array {
    let curve = new Float32Array(65536), mappedFloor = floor * 32768;

    for(var i = 0; i < 32768; i++) {
        let x = i / 32768;
        //var value = x < (floor / 2) ? 0 : lerp(0.3, sigmoid(40 * (x - 1.5 * floor)), poly(20 * (x - floor)));
        var value = x < (floor / 2) ? 0 : sigmoid(20 * (x - 2 * floor));

        curve[32768 - i] = 0;
        curve[32768 + i] = value;
    }
    curve[0] = curve[1]; // fixing up the end.

    return curve;
}

function genRectifierCurve(): Float32Array {
    var curve = new Float32Array(65536);
    for(var i = -32768; i < 32768; i++) {
        curve[i + 32768] = ((i > 0) ? i : -i) / 32768;
    }
    return curve;
}


function createNoiseGate(input: AudioNode): AudioNode {
    var follower = ctx.createBiquadFilter();
    let rectifier = ctx.createWaveShaper();
    var gate = ctx.createWaveShaper();
    var outputGain = ctx.createGain();

    // smooths out the noise level
    follower.type = "lowpass";
    //ngFollower.Q.value = 0.1;
    follower.frequency.value = 10.0;

    // takes the absolute value of the incoming signal
    rectifier.curve = genRectifierCurve();

    // compute the response function to a noise level (a sigmoid to cutoff at the noise floor)
    gate.curve = genNoiseFloorCurve(0.05);

    outputGain.gain.value = 0.0;

    input.connect(outputGain);

    input.connect(rectifier);
    rectifier.connect(follower);
    follower.connect(gate);
    gate.connect(outputGain.gain);

    return outputGain;
}

function createHumRemoval(input: AudioNode): AudioNode {
    let sixty_hz = ctx.createBiquadFilter();
    sixty_hz.type = "notch";
    sixty_hz.gain.value = 0;
    sixty_hz.Q.value = 7;
    sixty_hz.frequency.value = 60;

    let fifty_hz = ctx.createBiquadFilter();
    fifty_hz.type = "notch";
    fifty_hz.gain.value = 0;
    fifty_hz.Q.value = 7;
    fifty_hz.frequency.value = 50;

    input.connect(sixty_hz);
    sixty_hz.connect(fifty_hz);

    return fifty_hz;
}

export const Testbed = () => {
    let canvas = useRef<HTMLCanvasElement>(null);

    let [mic, setMic] = useState<null | MediaStream>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: false,
                noiseSuppression: true,
                autoGainControl: true,
            }
        }).then(s => setMic(s)).catch(e => console.log(e));
    }, []);

    useLayoutEffect(() => {
        if(mic !== null && canvas.current) {
            let src = ctx.createMediaStreamSource(mic);
            //let src = ctx.createMediaElementSource(audio.current);

            let hum_removal = createHumRemoval(src);

            // https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
            let comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -10;
            comp.knee.value = 40;
            comp.ratio.value = 12;
            comp.attack.value = 0;
            comp.release.value = 0.25;

            let declick = ctx.createBiquadFilter();
            declick.frequency.value = 12000;
            declick.Q.value = 0.4;
            declick.type = "lowpass";
            declick.gain.value = 0.0;

            let analyzer = ctx.createAnalyser();
            analyzer.fftSize = 1024;

            hum_removal.connect(comp);
            createNoiseGate(comp).connect(analyzer);
            //comp.connect(createNoiseGate2(declick));
            declick.connect(analyzer);
            analyzer.connect(ctx.destination);

            let data = new Float32Array(analyzer.frequencyBinCount);

            let render_visualization = () => {
                let c = canvas.current!;
                let canvas_ctx = c.getContext("2d")!;

                canvas_ctx.fillStyle = "rgb(255, 255, 255)";
                canvas_ctx.clearRect(0, 0, c.width, c.height);

                analyzer.getFloatFrequencyData(data);

                for(let i = 0; i < data.length; i++) {
                    let h = (Math.log2(-data[i]) - 1) * 20
                    let x = i; //Math.log2(i);
                    canvas_ctx.fillRect(x, h, 1, 200 - h);
                }

                requestAnimationFrame(render_visualization);
            }

            requestAnimationFrame(render_visualization);
        }

    }, [mic]);

    return (
        <div>
            <canvas ref={canvas} width="512" height="200" />
        </div>
    );
};
export default Testbed;