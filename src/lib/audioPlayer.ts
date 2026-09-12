/**
 * Audio Engine Pemanggil Antrian TV Display AntriAja
 * Mendukung pembentukan kata bahasa Indonesia, sintesis nada lonceng (Web Audio API),
 * SpeechSynthesis API fallback yang mulus dan tanpa dependensi luar,
 * serta antrian FIFO serial anti-tabrakan suara.
 */
import type { AudioInstruction } from '../types/sse.types';

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
 * Menyusun kalimat alami bahasa Indonesia untuk Web Speech API
 */
export function buildIndonesianSpeechText(instruction: AudioInstruction): string {
  const prefix = instruction.prefix ? instruction.prefix.toUpperCase() : '';
  const numberWords = numberToWordsIndonesian(instruction.number).join(' ');
  const counterWords = numberToWordsIndonesian(instruction.counter_number).join(' ');

  return `Nomor antrian ${prefix} ${numberWords}, menuju ke loket ${counterWords}`;
}

export class IndonesianAudioEngine {
  private audioCtx: AudioContext | null = null;
  private unlocked: boolean = false;
  private muted: boolean = false;
  private queue: AudioInstruction[] = [];
  private currentPromise: Promise<void> | null = null;

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
   * Menghasilkan nada lonceng 2-tone harmonis (ding-dong: 523.25Hz -> 659.25Hz)
   */
  public async playChime(): Promise<void> {
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

      const now = this.audioCtx.currentTime;

      // Tone 1: C5 (523.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Tone 2: E5 (659.25 Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.3);
      gain2.gain.setValueAtTime(0.35, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 0.9);

      // Beri jeda 850ms agar nada lonceng selesai sebelum suara manusia
      await new Promise((resolve) => setTimeout(resolve, 850));
    } catch {
      // Fallback diam tanpa melempar error
    }
  }

  /**
   * Mengucapkan kalimat via Web Speech API (suara Bahasa Indonesia)
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
        utterance.lang = 'id-ID';
        utterance.rate = 0.9; // Sedikit lebih santai dan jelas
        utterance.pitch = 1.0;

        // Cari suara Bahasa Indonesia jika ada di sistem
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.startsWith('id'));
        if (idVoice) {
          utterance.voice = idVoice;
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

          // 1. Bunyikan nada lonceng ding-dong
          await this.playChime();

          // 2. Ucapkan kalimat pemanggilan antrian
          const speechText = buildIndonesianSpeechText(current);
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
