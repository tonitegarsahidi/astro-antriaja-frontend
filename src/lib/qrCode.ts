/**
 * Generator QR Code SVG Standar Menggunakan Library qrcode (100% Offline)
 * Menghasilkan visualisasi QR Code standar industri yang dapat dipindai oleh seluruh kamera smartphone.
 */
import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  darkColor?: string;
  lightColor?: string;
  margin?: number;
}

/**
 * Menghasilkan string grafis SVG QR Code standar (scannable) secara synchronous tanpa koneksi internet.
 */
export function generateQRCodeSvg(
  text: string,
  options: QRCodeOptions = {}
): string {
  const safeText = (text || '').trim();
  const size = options.size || 200;
  const dark = options.darkColor || '#0f172a';
  const light = options.lightColor || '#ffffff';
  const margin = options.margin !== undefined ? options.margin : 2;

  if (!safeText) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="${size}" height="${size}"><rect width="33" height="33" fill="${light}" /></svg>`;
  }

  try {
    const code = QRCode.create(safeText, {
      errorCorrectionLevel: 'M',
    });

    const moduleCount = code.modules.size;
    const fullCount = moduleCount + margin * 2;
    let pathData = '';

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (code.modules.get(r, c)) {
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
  } catch (err) {
    console.error('Gagal membuat QR Code:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="${size}" height="${size}"><rect width="33" height="33" fill="${light}" /></svg>`;
  }
}
