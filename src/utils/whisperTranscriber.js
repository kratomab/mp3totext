// Utilitas untuk transkripsi audio menggunakan Whisper model via Transformers.js
import { pipeline } from '@xenova/transformers';

// Kelas untuk mengelola transkripsi audio menggunakan model Whisper
export class WhisperTranscriber {
  static task = 'automatic-speech-recognition';
  static model = 'Xenova/whisper-small'; // Model yang lebih kecil dan cepat
  static instance = null;

  // Mendapatkan instance transcriber (singleton pattern)
  static async getInstance(progressCallback = null) {
    if (this.instance === null) {
      // Tampilkan status loading jika callback disediakan
      if (progressCallback) {
        progressCallback({ status: 'loading', message: 'Memuat model Whisper...' });
      }

      // Inisialisasi pipeline transcription
      this.instance = await pipeline(this.task, this.model, {
        progress_callback: progressCallback
      });
    }

    return this.instance;
  }

  // Transkripsi audio dari file
  static async transcribeAudio(audioFile, progressCallback = null) {
    try {
      // Dapatkan instance transcriber
      const transcriber = await this.getInstance(progressCallback);

      // Update status jika callback disediakan
      if (progressCallback) {
        progressCallback({ status: 'processing', message: 'Memproses audio...' });
      }

      // Transcribe audio
      const result = await transcriber(audioFile, {
        chunk_length_s: 30, // Proses dalam potongan 30 detik untuk file besar
        stride_length_s: 5, // Overlap 5 detik untuk hasil lebih baik
        language: 'id', // Bahasa Indonesia
        return_timestamps: true, // Kembalikan timestamp untuk setiap segmen
        max_new_tokens: 128, // Batasi token untuk performa lebih baik
      });

      // Update status jika callback disediakan
      if (progressCallback) {
        progressCallback({ status: 'complete', message: 'Transkripsi selesai!' });
      }

      return result;
    } catch (error) {
      console.error('Whisper transcription error:', error);
      
      // Update status jika callback disediakan
      if (progressCallback) {
        progressCallback({ 
          status: 'error', 
          message: `Error saat transkripsi: ${error.message}` 
        });
      }
      
      throw error;
    }
  }
}

// Fungsi untuk mengubah detik menjadi format timestamp
export function formatTimestamp(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Fungsi untuk mengubah hasil transkripsi dengan timestamp menjadi format teks
export function formatTranscriptionWithTimestamps(transcription) {
  if (!transcription || !transcription.chunks) {
    return transcription?.text || '';
  }

  return transcription.chunks.map(chunk => {
    const start = formatTimestamp(chunk.timestamp[0]);
    const end = formatTimestamp(chunk.timestamp[1]);
    return `[${start} - ${end}] ${chunk.text}`;
  }).join('\n');
}
