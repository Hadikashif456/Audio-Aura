let audioContext = null;
let micStream = null;
let sourceNode = null;
let filterNode = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const noiseSlider = document.getElementById('noiseLevel');
const noiseLevelDisplay = document.getElementById('noiseLevelDisplay');

// Update display when slider moves
noiseSlider.addEventListener('input', () => {
    const val = Math.round(noiseSlider.value * 100);
    noiseLevelDisplay.textContent = val + '%';

    // If already running, update the filter live
    if (filterNode) {
        applyNoiseFilter(filterNode, noiseSlider.value);
    }
});

startBtn.addEventListener('click', async () => {
    try {
        status.textContent = 'Requesting microphone...';

        // Step 1: Get microphone
        // micStream = await navigator.mediaDevices.getUserMedia({
        //   audio: {
        //     echoCancellation: false,
        //     noiseSuppression: false,
        //     autoGainControl: false
        //   }
    micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1
        }
    });

// Step 2: Create audio context
audioContext = new AudioContext();

// Step 3: Connect mic to audio graph
sourceNode = audioContext.createMediaStreamSource(micStream);

// Step 4: Create filter chain (this is our noise suppression for now)
filterNode = buildFilterChain(audioContext);

// Step 5: Connect everything
// Mic → Filters → Earbuds
sourceNode.connect(filterNode.input);
filterNode.output.connect(audioContext.destination);

// Apply initial slider value
applyNoiseFilter(filterNode, noiseSlider.value);

status.textContent = '🟢 Listening — speak into your mic';
startBtn.disabled = true;
stopBtn.disabled = false;

  } catch (err) {
    status.textContent = '❌ Error: ' + err.message;
}
});

stopBtn.addEventListener('click', () => {
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
        audioContext.close();
    }
    sourceNode = null;
    filterNode = null;
    audioContext = null;
    micStream = null;

    status.textContent = 'Stopped. Press Start to begin again.';
    startBtn.disabled = false;
    stopBtn.disabled = true;
});


// Builds a chain of audio filters that clean up the sound
function buildFilterChain(ctx) {

    // High pass filter — removes low rumble (AC hum, table vibration)
    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 100;

    // Low pass filter — removes high hiss (fan noise, electronic hiss)
    const lowPass = ctx.createBiquadFilter();
    lowPass.type = 'lowpass';
    lowPass.frequency.value = 8000;

    // Presence boost — makes voice cut through clearly (2kHz-5kHz range)
    const presenceBoost = ctx.createBiquadFilter();
    presenceBoost.type = 'peaking';
    presenceBoost.frequency.value = 3000;
    presenceBoost.gain.value = 4;
    presenceBoost.Q.value = 1;

    // Dynamics compressor — evens out volume so quiet voice = still audible
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -30;
    compressor.knee.value = 10;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.1;

    // Gain node — master volume control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 1.2;

    // Chain them together
    highPass.connect(lowPass);
    lowPass.connect(presenceBoost);
    presenceBoost.connect(compressor);
    compressor.connect(gainNode);

    // Return input and output points of the chain
    return {
        input: highPass,
        output: gainNode,
        highPass,
        lowPass,
        presenceBoost,
        compressor,
        gainNode
    };
}

// Adjusts filter aggressiveness based on slider (0 to 1)
function applyNoiseFilter(filterNode, level) {
    const lvl = parseFloat(level);

    // More suppression = tighter frequency range
    filterNode.highPass.frequency.value = 80 + (lvl * 120);   // 80Hz to 200Hz
    filterNode.lowPass.frequency.value = 8000 - (lvl * 3000); // 8000Hz to 5000Hz
    filterNode.presenceBoost.gain.value = 2 + (lvl * 6);      // 2dB to 8dB boost
    filterNode.compressor.ratio.value = 3 + (lvl * 9);        // 3:1 to 12:1 ratio
}