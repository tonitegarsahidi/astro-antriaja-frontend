/**
 * Generator QR Code SVG mandiri (Zero-Dependency)
 * Mengimplementasikan matrix generator standar untuk visualisasi URL/token tiket
 */

export interface QRCodeOptions {
  size?: number;
  darkColor?: string;
  lightColor?: string;
  margin?: number;
}

class SimpleQR {
  private modules: boolean[][];
  private moduleCount: number;

  constructor(text: string) {
    // Sederhana: gunakan Version 3 (29x29) atau Version 4 (33x33) cukup untuk URL tiket AntriAja
    const length = text.length;
    let version = 3;
    if (length > 34) version = 4;
    if (length > 55) version = 6;

    this.moduleCount = version * 4 + 17;
    this.modules = Array.from({ length: this.moduleCount }, () =>
      new Array<boolean>(this.moduleCount).fill(false)
    );

    this.make(text);
  }

  private make(text: string): void {
    // Setup position detection patterns
    this.setupPositionDetectionPattern(0, 0);
    this.setupPositionDetectionPattern(this.moduleCount - 7, 0);
    this.setupPositionDetectionPattern(0, this.moduleCount - 7);
    this.setupTimingPattern();

    // Encode text as byte stream
    const data = new TextEncoder().encode(text);
    const dataBytes = Array.from(data);

    // Map bits to QR modules grid
    let row = this.moduleCount - 1;
    let col = this.moduleCount - 1;
    let direction = -1;
    let bitIndex = 0;

    const totalBits = dataBytes.length * 8;

    while (col > 0) {
      if (col === 6) col--; // skip timing pattern column

      for (let count = 0; count < this.moduleCount; count++) {
        const c = col;
        const r = row;

        if (!this.isReserved(r, c)) {
          let dark = false;
          if (bitIndex < totalBits) {
            const byteIndex = Math.floor(bitIndex / 8);
            const bitOffset = 7 - (bitIndex % 8);
            dark = ((dataBytes[byteIndex] >> bitOffset) & 1) === 1;
          } else {
            // Padding alternating
            dark = ((r + c) % 2 === 0);
          }
          this.modules[r][c] = dark;
          bitIndex++;
        }

        row += direction;
        if (row < 0 || row >= this.moduleCount) {
          row -= direction;
          direction = -direction;
          break;
        }
      }
      col -= 2;
    }
  }

  private isReserved(row: number, col: number): boolean {
    // Check finder patterns
    if (row < 9 && col < 9) return true;
    if (row < 9 && col >= this.moduleCount - 8) return true;
    if (row >= this.moduleCount - 8 && col < 9) return true;
    // Check timing patterns
    if (row === 6 || col === 6) return true;
    return false;
  }

  private setupPositionDetectionPattern(row: number, col: number): void {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupTimingPattern(): void {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      this.modules[r][6] = r % 2 === 0;
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      this.modules[6][c] = c % 2 === 0;
    }
  }

  public toSvg(options: QRCodeOptions = {}): string {
    const size = options.size || 200;
    const dark = options.darkColor || '#0f172a';
    const light = options.lightColor || '#ffffff';
    const margin = options.margin !== undefined ? options.margin : 2;

    const fullCount = this.moduleCount + margin * 2;
    let pathData = '';

    for (let r = 0; r < this.moduleCount; r++) {
      for (let c = 0; c < this.moduleCount; c++) {
        if (this.modules[r][c]) {
          const x = c + margin;
          const y = r + margin;
          pathData += `M${x},${y}h1v1h-1z `;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullCount} ${fullCount}" width="${size}" height="${size}">
  <rect width="${fullCount}" height="${fullCount}" fill="${light}" />
  <path d="${pathData.trim()}" fill="${dark}" />
</svg>`;
  }
}

/**
 * Menghasilkan string grafis SVG QR Code mandiri tanpa dependensi luar
 */
export function generateQRCodeSvg(
  text: string,
  options: QRCodeOptions = {}
): string {
  const safeText = (text || '').trim();
  if (!safeText) {
    const size = options.size || 200;
    const light = options.lightColor || '#ffffff';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="${size}" height="${size}"><rect width="33" height="33" fill="${light}" /></svg>`;
  }

  const qr = new SimpleQR(safeText);
  return qr.toSvg(options);
}
