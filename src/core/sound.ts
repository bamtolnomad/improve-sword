import type { EnhancementOutcome } from "./types";

let audioContext: AudioContext | undefined;

function getAudioContext(): AudioContext | undefined {
  if (typeof window === "undefined") return undefined;

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) return undefined;
  audioContext ??= new AudioContextCtor();
  void audioContext.resume();
  return audioContext;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gainValue: number,
  delay = 0,
) {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const start = context.currentTime + delay;
  const end = start + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.02);
}

export function playForgeStrike() {
  tone(116, 0.08, "sawtooth", 0.07);
  tone(640, 0.06, "triangle", 0.04, 0.018);
}

export function playShopPurchase() {
  tone(740, 0.05, "triangle", 0.034);
  tone(988, 0.07, "triangle", 0.03, 0.045);
  tone(1480, 0.08, "sine", 0.018, 0.1);
}

export function playOutcomeSound(outcome: EnhancementOutcome) {
  switch (outcome) {
    case "great_success":
      tone(523, 0.08, "triangle", 0.04);
      tone(784, 0.1, "triangle", 0.038, 0.05);
      tone(1175, 0.16, "triangle", 0.032, 0.12);
      break;
    case "success":
      tone(523, 0.08, "triangle", 0.035);
      tone(784, 0.11, "triangle", 0.032, 0.06);
      break;
    case "protected":
      tone(392, 0.1, "sine", 0.035);
      tone(988, 0.16, "sine", 0.026, 0.05);
      break;
    case "destroyed":
      tone(96, 0.18, "sawtooth", 0.06);
      tone(58, 0.22, "square", 0.035, 0.04);
      break;
    case "great_failure":
      tone(124, 0.16, "sawtooth", 0.07);
      tone(72, 0.2, "square", 0.045, 0.035);
      tone(42, 0.26, "sawtooth", 0.032, 0.12);
      break;
    case "down":
      tone(260, 0.12, "triangle", 0.035);
      tone(180, 0.12, "triangle", 0.03, 0.06);
      break;
    case "keep":
      tone(220, 0.07, "sine", 0.025);
      break;
  }
}
