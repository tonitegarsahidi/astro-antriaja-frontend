import { describe, it, expect } from 'vitest';
import {
  formatTicketNumber,
  formatDuration,
  formatEstimatedTime,
  formatIndonesianDate,
} from '../src/lib/formatters';

describe('formatters utility', () => {
  describe('formatTicketNumber', () => {
    it('formats prefix and sequence with 3 zero-padded digits', () => {
      expect(formatTicketNumber('A', 1)).toBe('A-001');
      expect(formatTicketNumber('A', 25)).toBe('A-025');
      expect(formatTicketNumber('B', 100)).toBe('B-100');
    });

    it('handles multi-letter prefix correctly', () => {
      expect(formatTicketNumber('CS', 7)).toBe('CS-007');
      expect(formatTicketNumber('VIP', 12)).toBe('VIP-012');
    });

    it('handles edge cases gracefully (0 or negative sequence defaults to 000)', () => {
      expect(formatTicketNumber('A', 0)).toBe('A-000');
      expect(formatTicketNumber('A', -5)).toBe('A-000');
    });

    it('trims whitespace and uppercases prefix', () => {
      expect(formatTicketNumber(' a ', 3)).toBe('A-003');
      expect(formatTicketNumber('teller', 9)).toBe('TELLER-009');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds into mm:ss format', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(5)).toBe('00:05');
      expect(formatDuration(59)).toBe('00:59');
      expect(formatDuration(60)).toBe('01:00');
      expect(formatDuration(125)).toBe('02:05');
      expect(formatDuration(3600)).toBe('60:00');
    });

    it('handles negative or invalid numbers by returning 00:00', () => {
      expect(formatDuration(-10)).toBe('00:00');
      expect(formatDuration(NaN)).toBe('00:00');
    });
  });

  describe('formatEstimatedTime', () => {
    it('formats estimated minutes into human readable text', () => {
      expect(formatEstimatedTime(5)).toBe('5 menit');
      expect(formatEstimatedTime(15)).toBe('15 menit');
    });

    it('returns "Segera" when minutes is 0 or negative', () => {
      expect(formatEstimatedTime(0)).toBe('Segera');
      expect(formatEstimatedTime(-1)).toBe('Segera');
    });
  });

  describe('formatIndonesianDate', () => {
    it('formats a date object or string into Indonesian localized date string', () => {
      const fixedDate = new Date('2026-09-12T10:00:00Z');
      const formatted = formatIndonesianDate(fixedDate);
      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
      // Should include September and 2026
      expect(formatted).toContain('2026');
      expect(formatted.toLowerCase()).toContain('september');
    });

    it('returns empty string or fallback for invalid date', () => {
      expect(formatIndonesianDate('invalid-date')).toBe('-');
    });
  });
});
