export default class NoiseGate {
    /**
     * A Noise gate allows audio signals to pass only when the registered volume
     * is above a specified threshold.
     * @param  {BaseAudioContext} context the audio context
     * @param  {Number} options.channels the number of input and output
     *                                   channels, a maximum of two
     * @param  {Number} options.attack milliseconds for gate to fully close
     * @param  {Number} options.attack milliseconds for gate to fully open
     * @param  {Number} options.bufferSize the size of an onaudioprocess window
     * @param  {Number} options.threshold gain level beneath which sound is muted
     * @param  {Number} options.alpha weight for envelope follower affecting
     *                                the tradeoff between delay and smoothness
     */
    constructor(context, options) {
        if(!(context instanceof BaseAudioContext))
            throw context + ' is not a valid audio context.';
        if(options == null) options = {};
        this.context_ = context;
        let channels = options.channels || 1;
        let bufferSize = options.bufferSize || 0;
        this.threshold = options.threshold || 0;
        this.attack = options.attack || 0;
        this.release = options.release || 0;
        // Alpha controls a tradeoff between the smoothness of the
        // envelope and its delay, with a higher value giving more smoothness at
        // the expense of delay and vice versa. It should be set experimentally to
        // control this tradeoff. 0.90 has proven an effective default in offline
        // observations.
        this.alpha_ = options.alpha || 0.90;
        if(channels > 2)
            throw 'The maximum supported channels is two.';

        this.node_ = this.context_.createScriptProcessor(
            bufferSize, channels, channels);
        this.node_.onaudioprocess = this.onaudioprocess_.bind(this);
        // The noise gate is connected to and from by dummy input and output nodes.
        this.input = new GainNode(this.context_);
        this.output = new GainNode(this.context_);
        this.input.connect(this.node_).connect(this.output);
        // The last envelope level of a given buffer is initialized as 0
        // for between-block memory.
        this.lastLevel = 0;
        // The last weight (between 0 and 1) assigned, where 1 means the gate
        // is open and 0 means it is closed and the sample in the output buffer is
        // muted.
        this.lastWeight = 1;
    }

    /**
     * Gradually mutes input which registers beneath specified threshold.
     * @param  {AudioProcessingEvent} event input and output buffers
     */
    onaudioprocess_(event) {
        let envelope = this.detectLevel(event.inputBuffer);

        for(let i = 0; i < event.inputBuffer.numberOfChannels; i++) {
            let input = event.inputBuffer.getChannelData(i);
            let output = event.outputBuffer.getChannelData(i);
            let weights = this.computeGain(envelope);

            for(let j = 0; j < input.length; j++) {
                output[j] = weights[j] * input[j];
            }
        }
    }

    /**
     * Detect level using the difference equation for the Root Mean Squared
     * value of the input signal.
     * @param  {AudioBuffer} inputBuffer input audio buffer
     * @return {Float32Array} envelope the registered level of the input
     */
    detectLevel(inputBuffer) {
        let channel = new Float32Array(event.inputBuffer.getChannelData(0).length);
        // Stereo input is downmixed to mono input via averaging.
        if(channel.numberOfChannels == 2) {
            for(let i = 0; i < inputBuffer.getChannelData(0).length; i++) {
                channel[i] = (inputBuffer.getChannelData(0)[i] +
                    inputBuffer.getChannelData(1)[i]) / 2;
            }
        } else {
            channel = inputBuffer.getChannelData(0);
        }
        // Set the value at each index of the envelope to be a positive value
        // that combines the current and previous value according to alpha.
        // See http://www.aes.org/e-lib/browse.cfm?elib=16354 for details.
        let envelope = new Float32Array(channel.length);
        envelope[0] = this.alpha_ * this.lastLevel +
            (1 - this.alpha_) * Math.pow(channel[0], 2);

        for(let j = 1; j < channel.length; j++) {
            envelope[j] = this.alpha_ * envelope[j - 1] +
                (1 - this.alpha_) * Math.pow(channel[j], 2);
        }
        this.lastLevel = envelope[envelope.length - 1];
        // Scale the envelope levels back to the original magnitude.
        for(let k = 0; k < envelope.length; k++) {
            envelope[k] = Math.sqrt(envelope[k]) * (1 / 0.7);
        }
        return envelope;
    }

    /**
     * Computes an array of weights which determines what samples are silenced.
     * @param  {Float32Array} envelope the level of the input
     * @return {Float32Array} weights numbers in the range 0 to 1 set in
     *                                accordance with the threshold, the envelope,
     *                                and attack and release
     */
    computeGain(envelope) {
        let weights = new Float32Array(envelope.length);
        // When attack or release are 0, the weight changes between 0 and 1
        // in one step.
        let attackSteps = 1;
        let releaseSteps = 1;
        let attackLossPerStep = 1;
        let releaseGainPerStep = 1;
        // When attack or release are > 0, the associated weight changes between 0
        // and 1 in the number of steps corresponding to the millisecond attack
        // or release time parameters.
        if(this.attack > 0) {
            attackSteps = Math.ceil(this.context_.sampleRate * this.attack);
            attackLossPerStep = 1 / attackSteps;
        }
        if(this.release > 0) {
            releaseSteps = Math.ceil(this.context_.sampleRate * this.release);
            releaseGainPerStep = 1 / releaseSteps;
        }
        // Compute an array of weights which will be multiplied with the channel.
        // Based on the detected level and indexes which persist between subsequent
        // calls to onaudioprocess, the noise gate at iteration i is in one of
        // four states: open, closed, attacking (between open and closed), or
        // releasing (between closed and open).
        for(let i = 0; i < envelope.length; i++) {
            if(envelope[i] < this.threshold) {
                const weight = this.lastWeight - attackLossPerStep;
                weights[i] = weight > 0 ? weight : 0;
            }
            else {
                const weight = this.lastWeight + releaseGainPerStep;
                weights[i] = weight < 1 ? weight : 1;
            }
            this.lastWeight = weights[i];
        }
        return weights;
    }
}