🎧 AudioAura

Real-time browser-based noise suppression  no installs, no backend, works with any earbuds.

AudioAura uses the Web Audio API to build a live audio processing chain directly in your browser. Speak into your mic and it filters out background noise before routing clean audio to your output device.


🚀 Live Demo


Open index.html in Chrome or Edge (Firefox has limited AudioContext support)




✨ Features


🎙️ Real-time microphone capture
🔇 Adjustable noise gate with EMA smoothing (no word clipping)
🎚️ High-pass + low-pass filter chain (removes rumble and hiss)
🗣️ Presence boost at 2500 Hz (makes voice cut through)
📉 Dynamics compressor (evens out volume spikes)
🔊 Works with any earbuds or headphones — zero drivers needed



🧠 How It Works

Microphone
    ↓
High-pass filter  (cuts below 150 Hz — fan hum, AC rumble)
    ↓
Low-pass filter   (cuts above 7000 Hz — hiss, interference)
    ↓
Presence boost    (peaking EQ at 2500 Hz — voice clarity)
    ↓
Noise gate        (EMA-smoothed RMS threshold — silence background)
    ↓
Compressor        (evening out loud/quiet swings)
    ↓
Gain              (final volume boost)
    ↓
Audio Output


🛠️ Tech Stack

TechnologyPurposeWeb Audio APIReal-time DSP in the browserScriptProcessorNodeCustom noise gate with EMA smoothingBiquadFilterNodeHigh-pass, low-pass, peaking EQDynamicsCompressorNodeVolume normalizationgetUserMediaMicrophone access
