/**
 * Memformat prefix layanan dan nomor urut menjadi format standar tiket (Contoh: A-001)
 */
export function formatTicketNumber(prefix: string, sequence: number): string {
  const cleanPrefix = (prefix || '').trim().toUpperCase();
  const safeSeq = sequence > 0 ? sequence : 0;
  const paddedSeq = String(safeSeq).padStart(3, '0');
  return `${cleanPrefix}-${paddedSeq}`;
}

/**
 * Memformat durasi detik ke format stopwatch mm:ss (Contoh: 125 -> "02:05")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) {
    return '00:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMins = String(mins).padStart(2, '0');
  const paddedSecs = String(secs).padStart(2, '0');

  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Memformat perkiraan waktu tunggu pengunjung
 */
export function formatEstimatedTime(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) {
    return 'Segera';
  }
  return `${minutes} menit`;
}

/**
 * Memformat tanggal ke format lokal Bahasa Indonesia
 */
export function formatIndonesianDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return '-';
  }
}
