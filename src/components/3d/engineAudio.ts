/**
 * Land Cruiser start-up sound for the "Lights on" button.
 *
 * Plays public/audio/landcruiser-engine.mp3 once (starter -> engine catching -> exhaust /
 * idle). While it plays, getLoudness() reports how loud the recording is at this exact
 * moment (0..1), so the car's front and rear lights can swell with the exhaust note.
 *
 * To use a different recording, replace that mp3 — the loudness curve is measured from
 * whatever file is there, nothing else needs to change.
 */

const AUDIO_URL = `${import.meta.env.BASE_URL}audio/landcruiser-engine.mp3`;

const PLAY_LEVEL = 0.85; // master volume of the recording
const END_FADE = 1.2; // seconds of fade-out at the very end of the clip
const STOP_FADE = 0.45; // fade when the lights are switched off
const REST_LOUDNESS = 0.35; // light drive once the clip has finished (engine "idling")
const ENV_HOP = 0.05; // seconds per loudness sample

export interface EngineSound {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  /** 0..1 loudness of the recording right now (REST_LOUDNESS when nothing is playing) */
  getLoudness: () => number;
}

type AudioCtor = typeof AudioContext;

interface Loaded {
  buffer: AudioBuffer;
  envelope: Float32Array; // normalised 0..1, one value per ENV_HOP
}

/** RMS loudness over time, smoothed (fast attack, slower release) and normalised. */
function measureEnvelope(buffer: AudioBuffer): Float32Array {
  const ch = buffer.numberOfChannels;
  const data = Array.from({ length: ch }, (_, i) => buffer.getChannelData(i));
  const hop = Math.max(1, Math.floor(buffer.sampleRate * ENV_HOP));
  const n = Math.ceil(buffer.length / hop);
  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = i * hop;
    const b = Math.min(buffer.length, a + hop * 2); // 2-hop window = a little smoothing
    let sum = 0;
    for (let c = 0; c < ch; c++) {
      const d = data[c];
      for (let k = a; k < b; k++) sum += d[k] * d[k];
    }
    raw[i] = Math.sqrt(sum / Math.max(1, (b - a) * ch));
  }

  const sm = new Float32Array(n);
  let prev = raw[0] ?? 0;
  for (let i = 0; i < n; i++) {
    const k = raw[i] > prev ? 0.6 : 0.22;
    prev += (raw[i] - prev) * k;
    sm[i] = prev;
  }

  const sorted = Array.from(sm).sort((x, y) => x - y);
  const lo = sorted[Math.floor(n * 0.08)] ?? 0;
  const hi = sorted[Math.floor(n * 0.97)] ?? 1;
  const span = Math.max(1e-6, hi - lo);
  for (let i = 0; i < n; i++) sm[i] = Math.min(1, Math.max(0, (sm[i] - lo) / span));
  return sm;
}

export function createEngineSound(): EngineSound {
  let ctx: AudioContext | null = null;
  let gain: GainNode | null = null;
  let source: AudioBufferSourceNode | null = null;
  let startedAt = 0; // ctx time the clip started
  let playing = false;
  let token = 0;
  let disposed = false;

  // Fetch + decode as soon as the page is up, so the click plays instantly.
  const loaded: Promise<Loaded | null> = (async () => {
    try {
      const res = await fetch(AUDIO_URL);
      if (!res.ok) return null;
      const data = await res.arrayBuffer();
      const Offline: typeof OfflineAudioContext =
        window.OfflineAudioContext ||
        (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
          .webkitOfflineAudioContext;
      const buffer = await new Offline(2, 1, 44100).decodeAudioData(data);
      return { buffer, envelope: measureEnvelope(buffer) };
    } catch (err) {
      console.warn('Engine sound could not be loaded', err);
      return null;
    }
  })();
  let clip: Loaded | null = null;
  void loaded.then((l) => (clip = l));

  const ensureContext = () => {
    if (ctx) return ctx;
    const Ctor: AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: AudioCtor }).webkitAudioContext;
    ctx = new Ctor();
    gain = ctx.createGain();
    gain.connect(ctx.destination);
    return ctx;
  };

  const silence = (fade: number) => {
    playing = false;
    if (!ctx || !gain || !source) return;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + fade);
    try {
      source.stop(now + fade + 0.05);
    } catch {
      /* already stopped */
    }
    source = null;
  };

  const start = () => {
    if (disposed) return;
    try {
      const c = ensureContext();
      void c.resume(); // inside the click, so the browser allows sound
      silence(0.03);
      const my = ++token;
      void loaded.then((l) => {
        if (!l || my !== token || disposed || !ctx || !gain) return;
        const src = ctx.createBufferSource();
        src.buffer = l.buffer;
        src.connect(gain);
        const t0 = ctx.currentTime + 0.02;
        const dur = l.buffer.duration;
        gain.gain.cancelScheduledValues(ctx.currentTime);
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(PLAY_LEVEL, t0 + 0.03);
        gain.gain.setValueAtTime(PLAY_LEVEL, t0 + Math.max(0.1, dur - END_FADE));
        gain.gain.linearRampToValueAtTime(0, t0 + dur);
        src.start(t0);
        src.onended = () => {
          if (source === src) {
            source = null;
            playing = false;
          }
        };
        source = src;
        startedAt = t0;
        playing = true;
      });
    } catch (err) {
      console.warn('Engine audio unavailable', err);
    }
  };

  const stop = () => {
    token++;
    silence(STOP_FADE);
  };

  const getLoudness = () => {
    if (!playing || !ctx || !clip) return REST_LOUDNESS;
    const t = (ctx.currentTime - startedAt) / ENV_HOP;
    if (t < 0) return clip.envelope[0] ?? REST_LOUDNESS;
    const i = Math.floor(t);
    const env = clip.envelope;
    if (i >= env.length - 1) return REST_LOUDNESS;
    const f = t - i;
    return env[i] + (env[i + 1] - env[i]) * f;
  };

  const dispose = () => {
    disposed = true;
    token++;
    silence(0.05);
    const c = ctx;
    ctx = null;
    gain = null;
    if (c && c.state !== 'closed') window.setTimeout(() => void c.close(), 200);
  };

  return { start, stop, dispose, getLoudness };
}
