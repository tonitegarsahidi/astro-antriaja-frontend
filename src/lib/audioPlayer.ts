/**
 * Audio Engine Pemanggil Antrian TV Display AntriAja
 * Mendukung pembentukan kata bahasa Indonesia, sintesis nada lonceng (Web Audio API),
 * SpeechSynthesis API fallback yang mulus dan tanpa dependensi luar,
 * serta antrian FIFO serial anti-tabrakan suara.
 */
import type { AudioInstruction } from '../types/sse.types';
import type { BellSoundType, VoiceLanguage, VoiceGender } from '../types/display.types';

export interface AudioConfig {
  bellSound: BellSoundType;
  voiceLang: VoiceLanguage;
  voiceGender: VoiceGender;
  voicePitch: number;
  voiceRate: number;
}

const ONES = [
  'nol',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
];

/**
 * Mengonversi angka bulat (1-999) ke susunan kata bahasa Indonesia
 */
export function numberToWordsIndonesian(num: number): string[] {
  if (num <= 0 || isNaN(num)) {
    return ['nol'];
  }

  if (num < 12) {
    return [ONES[num]];
  }

  if (num < 20) {
    const digit = num - 10;
    return [ONES[digit], 'belas'];
  }

  if (num < 100) {
    const tens = Math.floor(num / 10);
    const rem = num % 10;
    const words = [ONES[tens], 'puluh'];
    if (rem > 0) {
      words.push(ONES[rem]);
    }
    return words;
  }

  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const rem = num % 100;
    const words: string[] = [];
    if (hundreds === 1) {
      words.push('seratus');
    } else {
      words.push(ONES[hundreds], 'ratus');
    }

    if (rem > 0) {
      words.push(...numberToWordsIndonesian(rem));
    }
    return words;
  }

  return [num.toString()];
}

/**
 * Menyusun token audio untuk kebutuhan audio concatenation
 */
export function buildAudioInstructionWords(instruction: AudioInstruction): string[] {
  const words: string[] = ['nomor-antrian'];

  if (instruction.prefix) {
    words.push(instruction.prefix.toUpperCase());
  }

  const numberWords = numberToWordsIndonesian(instruction.number);
  words.push(...numberWords);

  words.push('menuju-ke-loket');

  const counterWords = numberToWordsIndonesian(instruction.counter_number);
  words.push(...counterWords);

  return words;
}

/**
 * Menyusun kalimat alami untuk Web Speech API sesuai bahasa yang dipilih
 */
export function buildSpeechText(
  instruction: AudioInstruction,
  lang: VoiceLanguage = 'id-ID'
): string {
  if (lang === 'en-US') {
    const prefix = instruction.prefix ? `${instruction.prefix.toUpperCase()} ` : '';
    return `Queue number ${prefix}${instruction.number}, please proceed to counter ${instruction.counter_number}`;
  }

  const prefix = instruction.prefix ? instruction.prefix.toUpperCase() : '';
  const numberWords = numberToWordsIndonesian(instruction.number).join(' ');
  const counterWords = numberToWordsIndonesian(instruction.counter_number).join(' ');

  return `Nomor antrian ${prefix} ${numberWords}, menuju ke loket ${counterWords}`;
}

/**
 * Kompatibilitas mundur untuk pemanggilan Bahasa Indonesia
 */
export function buildIndonesianSpeechText(instruction: AudioInstruction): string {
  return buildSpeechText(instruction, 'id-ID');
}

export class IndonesianAudioEngine {
  private audioCtx: AudioContext | null = null;
  private unlocked: boolean = false;
  private muted: boolean = false;
  private queue: AudioInstruction[] = [];
  private currentPromise: Promise<void> | null = null;
  private audioConfig: AudioConfig = {
    bellSound: 'ding_dong',
    voiceLang: 'id-ID',
    voiceGender: 'female',
    voicePitch: 1.0,
    voiceRate: 0.9,
  };

  constructor() {
    this.unlocked = false;
    this.muted = false;
    this.queue = [];
  }

  public isUnlocked(): boolean {
    return this.unlocked;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.muted) {
      this.clearQueue();
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public clearQueue(): void {
    this.queue = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public configureAudio(config: Partial<AudioConfig>): void {
    this.audioConfig = {
      ...this.audioConfig,
      ...config,
    };
  }

  public getAudioConfig(): AudioConfig {
    return { ...this.audioConfig };
  }

  /**
   * Meng-unlock AudioContext dan Speech API via interaksi pertama pengguna
   */
  public async unlock(): Promise<void> {
    this.unlocked = true;
    if (typeof window !== 'undefined') {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtxClass && !this.audioCtx) {
          this.audioCtx = new AudioCtxClass();
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          await this.audioCtx.resume();
        }
      } catch (err) {
        console.warn('AudioContext init warning:', err);
      }
    }
  }

  /**
   * Menghasilkan nada lonceng Web Audio API (6 variasi suara + hening/none)
   */
  public async playChime(sound?: BellSoundType): Promise<void> {
    const selectedSound = sound || this.audioConfig.bellSound || 'ding_dong';
    if (selectedSound === 'none') {
      return;
    }
    if (typeof window === 'undefined') return;

    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }

      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      const playTone = (
        freq: number,
        startOffset: number,
        duration: number,
        peakGain: number,
        type: OscillatorType = 'sine'
      ) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(peakGain, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };

      let waitDurationMs = 850;

      switch (selectedSound) {
        case 'tri_tone':
          // C5 -> E5 -> G5
          playTone(523.25, 0.0, 0.35, 0.3);
          playTone(659.25, 0.22, 0.35, 0.32);
          playTone(783.99, 0.44, 0.55, 0.35);
          waitDurationMs = 950;
          break;

        case 'airport':
          // F5 -> D5 -> C5 -> A4
          playTone(698.46, 0.0, 0.35, 0.28);
          playTone(587.33, 0.22, 0.35, 0.3);
          playTone(523.25, 0.44, 0.35, 0.32);
          playTone(440.00, 0.66, 0.65, 0.35);
          waitDurationMs = 1200;
          break;

        case 'single_ting':
          // A5 with long smooth decay
          playTone(880.00, 0.0, 0.9, 0.4);
          waitDurationMs = 750;
          break;

        case 'soft_pulse':
          // G4 -> C5 soft sine
          playTone(392.00, 0.0, 0.4, 0.25);
          playTone(523.25, 0.28, 0.55, 0.28);
          waitDurationMs = 750;
          break;

        case 'marimba':
          // E5 -> B4 -> G#4 with warm harmonic tones
          playTone(659.25, 0.0, 0.35, 0.35, 'triangle');
          playTone(493.88, 0.2, 0.35, 0.35, 'triangle');
          playTone(415.30, 0.4, 0.55, 0.35, 'triangle');
          waitDurationMs = 850;
          break;

        case 'ding_dong':
        default:
          // C5 -> E5
          playTone(523.25, 0.0, 0.5, 0.3);
          playTone(659.25, 0.3, 0.6, 0.35);
          waitDurationMs = 850;
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, waitDurationMs));
    } catch {
      // Fallback diam tanpa melempar error
    }
  }

  /**
   * Mengucapkan kalimat via Web Speech API dengan bahasa, pitch, rate, dan preferensi gender
   */
  public speakText(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = this.audioConfig.voiceLang || 'id-ID';
        utterance.lang = lang;
        utterance.rate = this.audioConfig.voiceRate || 0.9;
        utterance.pitch = this.audioConfig.voicePitch || 1.0;

        // Cari suara yang cocok dengan preferensi bahasa & gender
        const voices = window.speechSynthesis.getVoices();
        const targetLang = lang.toLowerCase();
        const langPrefix = targetLang.split('-')[0];
        const matchingVoices = voices.filter(
          (v) =>
            v.lang.toLowerCase().startsWith(targetLang) ||
            v.lang.toLowerCase().startsWith(langPrefix)
        );

        if (matchingVoices.length > 0) {
          const isFemale = this.audioConfig.voiceGender !== 'male';
          const genderVoice = matchingVoices.find((v) => {
            const name = v.name.toLowerCase();
            if (isFemale) {
              return (
                name.includes('female') ||
                name.includes('wanita') ||
                name.includes('perempuan') ||
                name.includes('zira') ||
                name.includes('gadis')
              );
            } else {
              return (
                name.includes('male') ||
                name.includes('pria') ||
                name.includes('laki') ||
                name.includes('david') ||
                name.includes('wira')
              );
            }
          });
          utterance.voice = genderVoice || matchingVoices[0];
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);

        // Safety timeout jika browser tidak menembakkan onend
        setTimeout(() => resolve(), 7000);
      } catch {
        resolve();
      }
    });
  }

  /**
   * Menambahkan panggilan nomor ke antrian serial FIFO
   */
  public enqueueCall(instruction: AudioInstruction): void {
    if (this.muted) {
      return;
    }
    this.queue.push(instruction);
    this.processQueue().catch((err) => {
      console.error('Error processing audio queue:', err);
    });
  }

  /**
   * Memproses antrian suara secara serial satu per satu
   */
  public async processQueue(): Promise<void> {
    if (this.currentPromise) {
      return this.currentPromise;
    }

    this.currentPromise = (async () => {
      try {
        while (this.queue.length > 0) {
          if (this.muted) {
            this.clearQueue();
            break;
          }

          const current = this.queue.shift();
          if (!current) continue;

          // 1. Bunyikan nada lonceng
          await this.playChime(this.audioConfig.bellSound);

          // 2. Ucapkan kalimat pemanggilan antrian
          const speechText = buildSpeechText(current, this.audioConfig.voiceLang);
          await this.speakText(speechText);

          // 3. Berikan jeda hening sejenak sebelum panggilan berikutnya
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } finally {
        this.currentPromise = null;
      }
    })();

    return this.currentPromise;
  }
}

// Singleton global untuk digunakan di halaman display
export const globalAudioEngine = new IndonesianAudioEngine();
