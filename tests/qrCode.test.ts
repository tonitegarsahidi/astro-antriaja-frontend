import { describe, it, expect } from 'vitest';
import { generateQRCodeSvg } from '../src/lib/qrCode';

describe('QR Code SVG generator (zero-dependency)', () => {
  it('generates a valid SVG string for a given URL or text', () => {
    const url = 'http://localhost:4321/ticket?token=mock-token-123';
    const svg = generateQRCodeSvg(url);

    expect(svg).toBeTruthy();
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('</svg>');
  });

  it('customizes size, colors, and margin according to options', () => {
    const text = 'AntriAja-Kiosk';
    const svg = generateQRCodeSvg(text, {
      size: 256,
      darkColor: '#1e3a8a',
      lightColor: '#ffffff',
    });

    expect(svg).toContain('width="256"');
    expect(svg).toContain('height="256"');
    expect(svg).toContain('fill="#1e3a8a"');
  });

  it('handles empty or blank string gracefully by returning empty SVG or default placeholder', () => {
    const svg = generateQRCodeSvg('');
    expect(svg).toBeTruthy();
    expect(svg).toContain('<svg');
  });
});
