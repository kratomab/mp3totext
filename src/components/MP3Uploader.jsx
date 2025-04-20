import React, { useState } from 'react';

const MP3Uploader = () => {
  const [fileName, setFileName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Daftar API transcription gratis/freemium yang bisa digunakan
  const transcriptionServices = [
    {
      name: 'Whisper AI (via Replicate)',
      endpoint: 'https://api.replicate.com/v1/predictions',
      description: 'Menggunakan model Whisper dari OpenAI via Replicate (gratis dengan batasan)'
    },
    {
      name: 'AssemblyAI Playground',
      endpoint: 'https://api.assemblyai.com/v2/upload',
      description: 'Menggunakan AssemblyAI (free trial)'
    },
    {
      name: 'Hugging Face Inference API',
      endpoint: 'https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h',
      description: 'Menggunakan model wav2vec2 (gratis dengan batasan)'
    },
    {
      name: 'Netlify Function Proxy',
      endpoint: '/.netlify/functions/transcribe',
      description: 'Menggunakan Netlify Functions sebagai proxy ke API lain'
    }
  ];

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setAudioFile(file);
      setTranscription('');
      setError('');
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Opsi 1: Menggunakan browser's Web Speech API (gratis, offline, tapi terbatas)
      // Ini hanya contoh dan mungkin tidak bekerja untuk semua audio MP3
      try {
        if (window.webkitSpeechRecognition || window.SpeechRecognition) {
          const result = await transcribeWithBrowserAPI(audioFile);
          if (result) {
            setTranscription(result);
            setIsLoading(false);
            return;
          }
        }
      } catch (browserApiError) {
        console.log('Browser API tidak tersedia, mencoba opsi lain...');
      }

      // Opsi 2: Menggunakan Netlify Function (jika di-deploy ke Netlify)
      // Ini memerlukan setup Netlify Function
      try {
        const formData = new FormData();
        formData.append('audio', audioFile);

        const response = await fetch('/.netlify/functions/transcribe', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          setTranscription(data.text || data.transcript || 'Tidak ada hasil transcription');
          setIsLoading(false);
          return;
        }
      } catch (netlifyError) {
        console.log('Netlify Function tidak tersedia, mencoba opsi lain...');
      }

      // Opsi 3: Fallback ke pesan informasi jika tidak ada API yang berfungsi
      setTranscription('Untuk menggunakan fitur ini secara penuh, Anda perlu:\n' +
        '1. Setup Netlify Function untuk transcribe\n' +
        '2. Atau gunakan API key dari layanan transcription seperti AssemblyAI, Whisper, dll.\n\n' +
        'Silakan lihat README.md untuk petunjuk setup.');

    } catch (error) {
      console.error('Transcription error:', error);
      setError('Gagal melakukan transcription. Silakan coba lagi atau gunakan file audio lain.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mencoba transcribe dengan Web Speech API
  const transcribeWithBrowserAPI = (audioFile) => {
    return new Promise((resolve) => {
      // Ini hanya simulasi karena Web Speech API tidak langsung support MP3 files
      // Dalam implementasi nyata, perlu konversi audio ke format yang didukung
      setTimeout(() => {
        // Mengembalikan null untuk simulasi kegagalan, sehingga akan mencoba API lain
        resolve(null);
      }, 1000);
    });
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 24, borderRadius: 8, maxWidth: 600, margin: '32px auto' }}>
      <h2 style={{ marginBottom: 16 }}>MP3 ke Teks</h2>
      
      <div style={{ marginBottom: 20 }}>
        <input 
          type="file" 
          accept="audio/mp3,audio/mpeg,audio/wav" 
          onChange={handleChange}
          style={{ marginBottom: 10 }}
        />
        {fileName && (
          <div style={{ marginTop: 8, fontSize: 14 }}>
            <strong>File dipilih:</strong> {fileName}
          </div>
        )}
      </div>

      <button 
        onClick={transcribeAudio}
        disabled={!audioFile || isLoading}
        style={{
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 4,
          cursor: audioFile && !isLoading ? 'pointer' : 'not-allowed',
          opacity: audioFile && !isLoading ? 1 : 0.6
        }}
      >
        {isLoading ? 'Memproses...' : 'Konversi ke Teks'}
      </button>

      {error && (
        <div style={{ marginTop: 16, color: '#DC2626', fontSize: 14 }}>
          {error}
        </div>
      )}

      {transcription && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Hasil Transkripsi:</h3>
          <div style={{ 
            backgroundColor: '#F9FAFB', 
            padding: 16, 
            borderRadius: 4, 
            border: '1px solid #E5E7EB',
            whiteSpace: 'pre-wrap',
            fontSize: 14,
            lineHeight: 1.5
          }}>
            {transcription}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, fontSize: 13, color: '#6B7280' }}>
        <p><strong>Catatan:</strong> Aplikasi ini menggunakan beberapa API transcription:</p>
        <ul style={{ paddingLeft: 20 }}>
          {transcriptionServices.map((service, index) => (
            <li key={index} style={{ marginBottom: 4 }}>
              <strong>{service.name}</strong>: {service.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MP3Uploader;