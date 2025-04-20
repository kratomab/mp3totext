import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import axios from 'axios';

// Konfigurasi API
const API_OPTIONS = {
  PRIMARY: {
    url: process.env.REACT_APP_PRIMARY_API_URL || 'https://api.example.com/transcribe',
    name: 'API Utama'
  },
  BACKUP: {
    url: process.env.REACT_APP_BACKUP_API_URL || 'https://api.assemblyai.com/v2/transcript',
    name: 'AssemblyAI',
    headers: {
      'Authorization': process.env.REACT_APP_ASSEMBLYAI_KEY
    }
  },
  GOOGLE_CLOUD: {
    url: 'https://speech.googleapis.com/v1/speech:recognize',
    name: 'Google Cloud Speech-to-Text',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_GOOGLE_CLOUD_KEY}`
    }
  },
  WHISPER: {
    url: 'https://api.openai.com/v1/whisper',
    name: 'Whisper OpenAI',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
    }
  },
  HUGGING_FACE: {
    url: process.env.REACT_APP_HF_API_URL || 'https://api-inference.huggingface.co/models/facebook/wav2vec2-large-960h-lv60-self',
    name: 'Hugging Face',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_HF_KEY}`
    }
  },
  VOSK: {
    url: process.env.REACT_APP_VOSK_API_URL || 'https://alphacephei.com/vosk/models',
    name: 'Vosk',
    headers: {
      'Content-Type': 'audio/wav'
    }
  },
  DEEP_SPEECH: {
    url: process.env.REACT_APP_DEEPSPEECH_API_URL || 'https://github.com/mozilla/DeepSpeech',
    name: 'Mozilla DeepSpeech',
    headers: {
      'Content-Type': 'audio/wav'
    }
  },
  WHISPER_CPP: {
    url: process.env.REACT_APP_WHISPER_CPP_URL || 'https://whisper.ggerganov.com',
    name: 'Whisper.cpp',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  },
  COQUI: {
    url: process.env.REACT_APP_COQUI_API_URL || 'https://coqui.ai',
    name: 'Coqui STT',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_COQUI_KEY}`
    }
  },
  NETLIFY_EDGE: {
    url: process.env.REACT_APP_NETLIFY_EDGE_URL || '/.netlify/functions/transcribe',
    name: 'Netlify Edge Function',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
};

export default function MP3Uploader() {
  const [mp3File, setMp3File] = useState(null);
  const [txtResult, setTxtResult] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (e) => {
    setMp3File(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!mp3File) return;
    
    setIsConverting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', mp3File);
      
      // Coba API utama dulu
      let response;
      try {
        response = await axios.post(API_OPTIONS.PRIMARY.url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } catch (primaryError) {
        // Jika gagal, coba API cadangan
        console.log('Gagal menggunakan API utama, mencoba API cadangan...');
        try {
          response = await axios.post(API_OPTIONS.BACKUP.url, { audio_url: URL.createObjectURL(mp3File) }, {
            headers: {
              ...API_OPTIONS.BACKUP.headers,
              'Content-Type': 'application/json'
            }
          });
        } catch (backupError) {
          // Jika gagal, coba Google Cloud
          console.log('Gagal menggunakan API cadangan, mencoba Google Cloud...');
          try {
            response = await axios.post(API_OPTIONS.GOOGLE_CLOUD.url, { audio: { uri: URL.createObjectURL(mp3File) } }, {
              headers: {
                ...API_OPTIONS.GOOGLE_CLOUD.headers,
                'Content-Type': 'application/json'
              }
            });
          } catch (googleError) {
            // Jika gagal, coba Whisper
            console.log('Gagal menggunakan Google Cloud, mencoba Whisper...');
            try {
              response = await axios.post(API_OPTIONS.WHISPER.url, { audio_url: URL.createObjectURL(mp3File) }, {
                headers: {
                  ...API_OPTIONS.WHISPER.headers,
                  'Content-Type': 'application/json'
                }
              });
            } catch (whisperError) {
              // Jika gagal, coba Hugging Face
              console.log('Gagal menggunakan Whisper, mencoba Hugging Face...');
              try {
                const audioBlob = await new Promise(resolve => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.readAsArrayBuffer(mp3File);
                });
                response = await axios.post(API_OPTIONS.HUGGING_FACE.url, audioBlob, {
                  headers: {
                    ...API_OPTIONS.HUGGING_FACE.headers,
                    'Content-Type': 'audio/wav'
                  }
                });
              } catch (hfError) {
                // Jika gagal, coba Vosk
                console.log('Gagal menggunakan Hugging Face, mencoba Vosk...');
                try {
                  const audioBlob = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsArrayBuffer(mp3File);
                  });
                  response = await axios.post(API_OPTIONS.VOSK.url, audioBlob, {
                    headers: {
                      ...API_OPTIONS.VOSK.headers
                    }
                  });
                } catch (voskError) {
                  // Jika gagal, coba DeepSpeech
                  console.log('Gagal menggunakan Vosk, mencoba DeepSpeech...');
                  const audioBlob = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsArrayBuffer(mp3File);
                  });
                  response = await axios.post(API_OPTIONS.DEEP_SPEECH.url, audioBlob, {
                    headers: {
                      ...API_OPTIONS.DEEP_SPEECH.headers
                    }
                  });
                }
              }
            }
          }
        }
      }
      
      setTxtResult(response.data.transcript || response.data.text);
      setIsConverting(false);
    } catch (error) {
      setTxtResult('Error: Gagal mengkonversi file. Silakan coba lagi.');
      setIsConverting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg mb-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2 flex items-center">
          <UploadCloud className="mr-2" /> Upload MP3 Kamu
        </h2>
        <input 
          type="file" 
          accept=".mp3" 
          onChange={handleFileChange}
          className="mb-4"
        />
        {mp3File && (
          <p className="text-sm text-gray-600">
            File dipilih: <span className="font-medium">{mp3File.name}</span>
          </p>
        )}
      </div>

      <button 
        onClick={handleConvert}
        disabled={!mp3File || isConverting}
        className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConverting ? 'Mengkonversi...' : 'Konversi ke Teks'}
      </button>

      {txtResult && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <FileText className="mr-2" /> Hasil Konversi
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
            {txtResult}
          </div>
        </div>
      )}
    </div>
  );
}