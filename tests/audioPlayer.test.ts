// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  numberToWordsIndonesian,
  buildAudioInstructionWords,
  buildIndonesianSpeechText,
  IndonesianAudioEngine,
} from '../src/lib/audioPlayer';
import type { AudioInstruction } from '../src/types/sse.types';

describe('audioPlayer library', () => {
  describe('numberToWordsIndonesian', () => {
    it('converts single digits 1-9 correctly', () => {
      expect(numberToWordsIndonesian(1)).toEqual(['satu']);
      expect(numberToWordsIndonesian(2)).toEqual(['dua']);
      expect(numberToWordsIndonesian(3)).toEqual(['tiga']);
      expect(numberToWordsIndonesian(4)).toEqual(['empat']);
      expect(numberToWordsIndonesian(5)).toEqual(['lima']);
      expect(numberToWordsIndonesian(9)).toEqual(['sembilan']);
    });

    it('converts teen numbers 10-19 correctly', () => {
      expect(numberToWordsIndonesian(10)).toEqual(['sepuluh']);
      expect(numberToWordsIndonesian(11)).toEqual(['sebelas']);
      expect(numberToWordsIndonesian(12)).toEqual(['dua', 'belas']);
      expect(numberToWordsIndonesian(15)).toEqual(['lima', 'belas']);
      expect(numberToWordsIndonesian(19)).toEqual(['sembilan', 'belas']);
    });

    it('converts tens 20-99 correctly', () => {
      expect(numberToWordsIndonesian(20)).toEqual(['dua', 'puluh']);
      expect(numberToWordsIndonesian(21)).toEqual(['dua', 'puluh', 'satu']);
      expect(numberToWordsIndonesian(35)).toEqual(['tiga', 'puluh', 'lima']);
      expect(numberToWordsIndonesian(99)).toEqual(['sembilan', 'puluh', 'sembilan']);
    });

    it('converts hundreds 100-999 correctly', () => {
      expect(numberToWordsIndonesian(100)).toEqual(['seratus']);
      expect(numberToWordsIndonesian(105)).toEqual(['seratus', 'lima']);
      expect(numberToWordsIndonesian(112)).toEqual(['seratus', 'dua', 'belas']);
      expect(numberToWordsIndonesian(200)).toEqual(['dua', 'ratus']);
      expect(numberToWordsIndonesian(250)).toEqual(['dua', 'ratus', 'lima', 'puluh']);
      expect(numberToWordsIndonesian(345)).toEqual([
        'tiga',
        'ratus',
        'empat',
        'puluh',
        'lima',
      ]);
      expect(numberToWordsIndonesian(999)).toEqual([
        'sembilan',
        'ratus',
        'sembilan',
        'puluh',
        'sembilan',
      ]);
    });

    it('handles edge cases (0, out of bounds or negative numbers)', () => {
      expect(numberToWordsIndonesian(0)).toEqual(['nol']);
      expect(numberToWordsIndonesian(-5)).toEqual(['nol']);
    });
  });

  describe('buildAudioInstructionWords & buildIndonesianSpeechText', () => {
    const instruction: AudioInstruction = {
      prefix: 'A',
      number: 14,
      counter_number: 2,
    };

    it('builds sequential audio word tokens for audio concatenation', () => {
      const words = buildAudioInstructionWords(instruction);
      expect(words).toEqual([
        'nomor-antrian',
        'A',
        'empat',
        'belas',
        'menuju-ke-loket',
        'dua',
      ]);
    });

    it('builds clear natural Indonesian text for speech synthesis', () => {
      const speechText = buildIndonesianSpeechText(instruction);
      expect(speechText).toContain('Nomor antrian A');
      expect(speechText).toContain('empat belas');
      expect(speechText).toContain('menuju ke loket dua');
    });
  });

  describe('IndonesianAudioEngine class', () => {
    let engine: IndonesianAudioEngine;

    beforeEach(() => {
      engine = new IndonesianAudioEngine();
    });

    it('starts with locked state and unmuted by default', () => {
      expect(engine.isUnlocked()).toBe(false);
      expect(engine.isMuted()).toBe(false);
      expect(engine.getQueueLength()).toBe(0);
    });

    it('unlocks audio context upon user gesture', async () => {
      await engine.unlock();
      expect(engine.isUnlocked()).toBe(true);
    });

    it('toggles mute setting', () => {
      engine.setMuted(true);
      expect(engine.isMuted()).toBe(true);

      engine.setMuted(false);
      expect(engine.isMuted()).toBe(false);
    });

    it('queues calls and does not play when muted', async () => {
      engine.setMuted(true);
      const instruction: AudioInstruction = {
        prefix: 'B',
        number: 5,
        counter_number: 1,
      };

      const processSpy = vi.spyOn(engine, 'processQueue');
      engine.enqueueCall(instruction);

      expect(engine.getQueueLength()).toBe(0);
      expect(processSpy).not.toHaveBeenCalled();
    });

    it('enqueues calls and processes them in FIFO order without collision', async () => {
      const instruction1: AudioInstruction = {
        prefix: 'A',
        number: 1,
        counter_number: 1,
      };
      const instruction2: AudioInstruction = {
        prefix: 'B',
        number: 2,
        counter_number: 2,
      };

      const playChimeSpy = vi.spyOn(engine, 'playChime').mockResolvedValue();
      const speakSpy = vi.spyOn(engine, 'speakText').mockResolvedValue();

      engine.enqueueCall(instruction1);
      engine.enqueueCall(instruction2);

      // Tunggu hingga queue selesai diproses
      await engine.processQueue();

      expect(playChimeSpy).toHaveBeenCalled();
      expect(speakSpy).toHaveBeenCalledTimes(2);
      expect(engine.getQueueLength()).toBe(0);
    });

    it('clears queue properly', () => {
      // Mock processQueue agar queue tetap ada untuk pengujian clear
      vi.spyOn(engine, 'processQueue').mockImplementation(async () => {});

      engine.enqueueCall({ prefix: 'A', number: 1, counter_number: 1 });
      engine.enqueueCall({ prefix: 'A', number: 2, counter_number: 1 });
      expect(engine.getQueueLength()).toBe(2);

      engine.clearQueue();
      expect(engine.getQueueLength()).toBe(0);
    });

    it('manages audio configuration with defaults and partial updates', () => {
      const initialConfig = engine.getAudioConfig();
      expect(initialConfig).toEqual({
        bellSound: 'ding_dong',
        voiceLang: 'id-ID',
        voiceGender: 'female',
        voicePitch: 1.0,
        voiceRate: 0.9,
      });

      engine.configureAudio({
        bellSound: 'airport',
        voiceLang: 'en-US',
        voiceGender: 'male',
        voicePitch: 1.2,
        voiceRate: 1.05,
      });

      expect(engine.getAudioConfig()).toEqual({
        bellSound: 'airport',
        voiceLang: 'en-US',
        voiceGender: 'male',
        voicePitch: 1.2,
        voiceRate: 1.05,
      });
    });

    it('supports all 7 bell sound types including none', async () => {
      const sounds = [
        'ding_dong',
        'tri_tone',
        'airport',
        'single_ting',
        'soft_pulse',
        'marimba',
        'none',
      ] as const;

      for (const sound of sounds) {
        await expect(engine.playChime(sound)).resolves.not.toThrow();
      }
    });
  });

  describe('buildSpeechText multi-language support', () => {
    const instruction: AudioInstruction = {
      prefix: 'A',
      number: 14,
      counter_number: 2,
    };

    it('builds natural Indonesian announcement when voiceLang is id-ID', async () => {
      const { buildSpeechText } = await import('../src/lib/audioPlayer');
      const text = buildSpeechText(instruction, 'id-ID');
      expect(text).toContain('Nomor antrian A');
      expect(text).toContain('empat belas');
      expect(text).toContain('menuju ke loket dua');
    });

    it('builds natural English announcement when voiceLang is en-US', async () => {
      const { buildSpeechText } = await import('../src/lib/audioPlayer');
      const text = buildSpeechText(instruction, 'en-US');
      expect(text).toContain('Queue number A 14');
      expect(text).toContain('please proceed to counter 2');
    });
  });

  describe('speakText voice selection and gender pitch modulation', () => {
    let mockVoices: SpeechSynthesisVoice[];
    let spokenUtterances: SpeechSynthesisUtterance[];
    const origSpeechSynthesis = globalThis.speechSynthesis;

    beforeEach(() => {
      spokenUtterances = [];
      mockVoices = [
        {
          name: 'Google Bahasa Indonesia',
          lang: 'id-ID',
          default: true,
          localService: false,
          voiceURI: 'Google Bahasa Indonesia',
        } as SpeechSynthesisVoice,
      ];

      class MockUtterance {
        text: string;
        lang: string = 'id-ID';
        pitch: number = 1.0;
        rate: number = 1.0;
        voice: SpeechSynthesisVoice | null = null;
        onend: ((e?: unknown) => void) | null = null;
        onerror: ((e?: unknown) => void) | null = null;
        constructor(text: string) {
          this.text = text;
        }
      }

      // @ts-expect-error mock utterance
      globalThis.SpeechSynthesisUtterance = MockUtterance;

      // @ts-expect-error mock speechSynthesis
      globalThis.speechSynthesis = {
        cancel: vi.fn(),
        getVoices: () => mockVoices,
        speak: (utterance: SpeechSynthesisUtterance) => {
          spokenUtterances.push(utterance);
          setTimeout(() => {
            if (utterance.onend) {
              utterance.onend(new Event('end') as unknown as SpeechSynthesisEvent);
            }
          }, 5);
        },
      };
    });

    afterEach(() => {
      globalThis.speechSynthesis = origSpeechSynthesis;
    });

    it('modulates pitch down to baritone (0.75x) when only female voice is available and male is requested', async () => {
      const engine = new IndonesianAudioEngine();
      engine.configureAudio({
        voiceLang: 'id-ID',
        voiceGender: 'male',
        voicePitch: 1.0,
      });

      await engine.speakText('Nomor antrian A 1');
      expect(spokenUtterances.length).toBe(1);
      expect(spokenUtterances[0].voice?.name).toBe('Google Bahasa Indonesia');
      expect(spokenUtterances[0].pitch).toBe(0.75);
    });

    it('selects native male voice and uses base pitch when a native male voice is present', async () => {
      mockVoices.push({
        name: 'Microsoft Ardi Online (Natural) - Indonesian (Indonesia)',
        lang: 'id-ID',
        default: false,
        localService: false,
        voiceURI: 'Microsoft Ardi',
      } as SpeechSynthesisVoice);

      const engine = new IndonesianAudioEngine();
      engine.configureAudio({
        voiceLang: 'id-ID',
        voiceGender: 'male',
        voicePitch: 1.0,
      });

      await engine.speakText('Nomor antrian A 1');
      expect(spokenUtterances.length).toBe(1);
      expect(spokenUtterances[0].voice?.name).toContain('Ardi');
      expect(spokenUtterances[0].pitch).toBe(1.0);
    });

    it('retains natural pitch when female voice is requested', async () => {
      const engine = new IndonesianAudioEngine();
      engine.configureAudio({
        voiceLang: 'id-ID',
        voiceGender: 'female',
        voicePitch: 1.0,
      });

      await engine.speakText('Nomor antrian A 1');
      expect(spokenUtterances.length).toBe(1);
      expect(spokenUtterances[0].pitch).toBe(1.0);
    });
  });
});
