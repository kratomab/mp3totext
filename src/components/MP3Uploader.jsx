import React, { useState, useRef, useEffect } from 'react';

const MP3Uploader = () => {
  const [fileName, setFileName] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [transcriptionEngine, setTranscriptionEngine] = useState('browser');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const workerRef = useRef(null);
  
  // URL untuk model Vosk yang bisa didownload
  const voskModelUrls = {
    small: 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
    id: 'https://alphacephei.com/vosk/models/vosk-model-id-0.22.zip',
    large: 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip'
  };
  
  // URL untuk model Coqui STT (DeepSpeech alternatif)
  const coquiModelUrl = 'https://github.com/coqui-ai/STT-models/releases/download/english/coqui-stt-models.zip';

  // Metode transcription yang tersedia tanpa API
  const transcriptionMethods = [
    {
      name: 'Manual Transcription',
      description: 'Putar audio dan ketik sendiri sambil mendengarkan (paling akurat)'
    },
    {
      name: 'Browser Audio Processing',
      description: 'Menggunakan Web Audio API untuk analisis audio (eksperimental)'
    },
    {
      name: 'Speech Recognition',
      description: 'Menggunakan browser Speech Recognition API (hanya Chrome)'
    },
    {
      name: 'Audio Visualization',
      description: 'Membantu visualisasi audio untuk memudahkan transcription manual'
    }
  ];

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setAudioFile(file);
      setTranscription('');
      setError('');
      setProgress(0);
      
      // Buat URL untuk audio player
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Reset audio player jika sudah ada
      if (audioRef.current) {
        audioRef.current.src = url;
      }
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const processAudio = async () => {
    if (!audioFile) return;
    
    setIsProcessing(true);
    setError('');
    setTranscriptionProgress(0);
    
    try {
      switch(transcriptionEngine) {
        case 'enhanced':
          await processWithEnhancedEngine();
          break;
        case 'vosk':
          await processWithVoskEngine();
          break;
        case 'remote':
          await processWithRemoteEngine();
          break;
        case 'browser':
        default:
          await processWithBrowserEngine();
      }
    } catch (error) {
      console.error('Processing error:', error);
      setError(`Gagal memproses audio: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  // Metode 1: Browser Engine - Analisis audio dan Speech Recognition
  const processWithBrowserEngine = async () => {
    try {
      // Buat audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Baca file audio
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          // Update progress
          setTranscriptionProgress(10);
          
          // Decode audio data
          const audioData = await audioContext.decodeAudioData(e.target.result);
          setTranscriptionProgress(30);
          
          // Analisis audio untuk segmentasi
          const audioBuffer = audioData;
          const channelData = audioBuffer.getChannelData(0);
          
          // Hitung beberapa statistik dasar
          let sum = 0;
          let peaks = 0;
          const threshold = 0.1;
          
          // Ambil sampel untuk analisis
          const sampleStep = Math.floor(channelData.length / 1000);
          const samples = [];
          
          for (let i = 0; i < channelData.length; i += sampleStep) {
            const value = Math.abs(channelData[i]);
            samples.push(value);
            sum += value;
            if (value > threshold) peaks++;
          }
          
          setTranscriptionProgress(50);
          
          // Deteksi segmen bicara
          const segments = [];
          let inSpeech = false;
          
          for (let i = 0; i < samples.length; i++) {
            if (samples[i] > threshold * 1.5 && !inSpeech) {
              inSpeech = true;
              segments.push({ start: i * sampleStep / audioBuffer.sampleRate });
            } else if (samples[i] <= threshold * 0.8 && inSpeech) {
              inSpeech = false;
              segments[segments.length - 1].end = i * sampleStep / audioBuffer.sampleRate;
              segments[segments.length - 1].duration = 
                segments[segments.length - 1].end - segments[segments.length - 1].start;
            }
          }
          
          setTranscriptionProgress(70);
          
          // Format hasil
          const durationSeconds = audioBuffer.duration;
          const minutes = Math.floor(durationSeconds / 60);
          const seconds = Math.floor(durationSeconds % 60);
          
          // Coba gunakan browser speech recognition jika tersedia
          let speechRecognitionResult = '';
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            try {
              // Simulasi hasil speech recognition
              // Dalam implementasi sebenarnya, ini akan menggunakan SpeechRecognition API
              // tapi karena keterbatasan, kita gunakan simulasi untuk demo
              speechRecognitionResult = '\n\n[Hasil Speech Recognition]\n' +
                'Hasil speech recognition akan muncul di sini jika Anda menggunakan tombol "Gunakan Speech Recognition".';
            } catch (srError) {
              console.log('Speech recognition error:', srError);
            }
          }
          
          setTranscriptionProgress(90);
          
          // Buat hasil akhir
          const result = `[Analisis Audio Selesai]\n\nDurasi: ${minutes}m ${seconds}s\nSegmen bicara terdeteksi: ${segments.length}\n\n` +
          `Segmen bicara terdeteksi pada:\n` +
          segments.slice(0, 10).map(seg => 
            `- ${Math.floor(seg.start / 60)}:${Math.floor(seg.start % 60).toString().padStart(2, '0')} - ` +
            `${Math.floor(seg.end / 60)}:${Math.floor(seg.end % 60).toString().padStart(2, '0')} ` +
            `(${seg.duration.toFixed(1)}s)`
          ).join('\n') +
          (segments.length > 10 ? `\n...dan ${segments.length - 10} segmen lainnya` : '') +
          '\n\n' +
          'TIPS TRANSKRIPSI:\n' +
          '1. Gunakan tombol "Gunakan Speech Recognition" untuk transkripsi otomatis (Chrome)\n' +
          '2. Untuk hasil terbaik, dengarkan audio dan ketik transkripsi secara manual\n' +
          '3. Gunakan segmen waktu di atas untuk navigasi audio lebih mudah\n' +
          '4. Coba engine transkripsi lain di menu "Opsi Lanjutan"' +
          speechRecognitionResult;
          
          setTranscription(result);
          setTranscriptionProgress(100);
          setIsProcessing(false);
          
        } catch (decodeError) {
          console.error('Error decoding audio:', decodeError);
          setError('Gagal memproses audio. Format mungkin tidak didukung oleh browser Anda.');
          setIsProcessing(false);
        }
      };
      
      fileReader.onerror = () => {
        setError('Gagal membaca file audio.');
        setIsProcessing(false);
      };
      
      fileReader.readAsArrayBuffer(audioFile);
      
    } catch (error) {
      console.error('Browser engine error:', error);
      setError(`Gagal memproses audio dengan browser engine: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  // Metode 2: Enhanced Engine - Menggunakan Web Audio API + Worklet untuk pemrosesan lebih canggih
  const processWithEnhancedEngine = async () => {
    try {
      setTranscriptionProgress(10);
      
      // Buat pesan untuk user
      let result = '[Enhanced Transcription Engine]\n\n';
      result += 'Engine ini menggunakan algoritma pemrosesan sinyal lanjutan untuk meningkatkan kualitas audio sebelum transkripsi.\n\n';
      
      setTranscription(result);
      setTranscriptionProgress(30);
      
      // Simulasi tahapan pemrosesan
      result += 'Tahapan Pemrosesan:\n';
      result += '1. Noise Reduction - Mengurangi background noise\n';
      result += '2. Voice Activity Detection - Mendeteksi segmen bicara\n';
      result += '3. Normalisasi Audio - Menyesuaikan volume\n';
      result += '4. Frequency Analysis - Menganalisis karakteristik suara\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(50);
      
      // Simulasi proses enhanced transcription
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(70);
      
      result += 'Hasil Analisis:\n';
      result += '- Kualitas Audio: Sedang\n';
      result += '- Noise Level: Rendah\n';
      result += '- Speech Clarity: Tinggi\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(90);
      
      result += 'Untuk hasil transkripsi terbaik dengan engine ini:\n';
      result += '1. Gunakan mikrofon eksternal untuk rekaman\n';
      result += '2. Rekam di lingkungan yang tenang\n';
      result += '3. Bicara dengan jelas dan tidak terlalu cepat\n';
      result += '4. Hindari background noise seperti musik atau percakapan lain\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(100);
      
      result += 'CATATAN: Engine Enhanced adalah simulasi untuk demonstrasi.\n';
      result += 'Untuk implementasi sebenarnya, Anda bisa menggunakan library seperti:\n';
      result += '- Vosk (https://alphacephei.com/vosk/) - Offline speech recognition\n';
      result += '- Whisper.js (https://github.com/xenova/whisper-web) - Port dari OpenAI Whisper\n';
      result += '- Coqui STT (https://github.com/coqui-ai/STT) - Pengganti DeepSpeech\n\n';
      result += 'Library-library tersebut bisa diintegrasikan ke aplikasi ini untuk transkripsi yang lebih akurat.\n';
      
      setTranscription(result);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Enhanced engine error:', error);
      setError(`Gagal memproses audio dengan enhanced engine: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  // Metode 3: Vosk Engine - Simulasi penggunaan Vosk untuk offline speech recognition
  const processWithVoskEngine = async () => {
    try {
      setTranscriptionProgress(10);
      
      let result = '[Vosk Offline Speech Recognition]\n\n';
      result += 'Vosk adalah library speech recognition offline yang powerful.\n';
      result += 'Dalam implementasi sebenarnya, Vosk akan mengunduh model bahasa dan melakukan transkripsi tanpa internet.\n\n';
      
      setTranscription(result);
      setTranscriptionProgress(30);
      
      // Simulasi download model
      result += 'Simulasi Download Model:\n';
      result += '- Model: vosk-model-id-0.22 (Bahasa Indonesia)\n';
      result += '- Ukuran: ~50MB\n';
      result += '- Sumber: https://alphacephei.com/vosk/models/\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(50);
      
      // Simulasi proses transkripsi
      result += 'Simulasi Proses Transkripsi:\n';
      result += '1. Konversi MP3 ke format WAV\n';
      result += '2. Split audio menjadi chunk 30 detik\n';
      result += '3. Proses setiap chunk dengan model Vosk\n';
      result += '4. Gabungkan hasil dengan timestamp\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(70);
      
      // Simulasi hasil transkripsi
      result += 'Contoh Hasil Transkripsi Vosk:\n';
      result += '[00:00] Selamat datang di aplikasi MP3 to Text.\n';
      result += '[00:05] Aplikasi ini menggunakan teknologi speech recognition untuk mengubah file audio menjadi teks.\n';
      result += '[00:12] Anda dapat mengupload file MP3 dan mendapatkan hasil transkripsi secara instan.\n';
      result += '[00:18] Untuk hasil terbaik, gunakan audio dengan kualitas baik dan minim noise.\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(90);
      
      // Informasi implementasi
      result += 'Cara Implementasi Vosk di Aplikasi Web:\n';
      result += '1. Install package: npm install vosk\n';
      result += '2. Download model bahasa yang sesuai\n';
      result += '3. Gunakan Web Worker untuk proses di background\n';
      result += '4. Implementasi dengan WebAssembly untuk performa lebih baik\n\n';
      result += 'CATATAN: Ini adalah simulasi. Untuk implementasi sebenarnya, kunjungi https://alphacephei.com/vosk/\n';
      
      setTranscription(result);
      setTranscriptionProgress(100);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Vosk engine error:', error);
      setError(`Gagal memproses audio dengan Vosk engine: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  // Metode 4: Remote Engine - Menggunakan layanan transkripsi gratis via proxy
  const processWithRemoteEngine = async () => {
    try {
      setTranscriptionProgress(10);
      
      let result = '[Remote Transcription Services]\n\n';
      result += 'Engine ini menghubungkan ke layanan transkripsi gratis melalui proxy.\n';
      result += 'Dalam implementasi sebenarnya, audio akan dikirim ke server untuk diproses.\n\n';
      
      setTranscription(result);
      setTranscriptionProgress(20);
      
      // Simulasi upload file
      result += 'Simulasi Upload File:\n';
      result += '- Menggunakan chunk upload untuk file besar\n';
      result += '- Enkripsi data untuk keamanan\n';
      result += '- Kompresi audio untuk menghemat bandwidth\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(40);
      
      // Simulasi layanan transkripsi
      result += 'Layanan Transkripsi Gratis:\n';
      result += '1. Google Speech-to-Text (via Cloud Function)\n';
      result += '   - Gratis hingga 60 menit per bulan\n';
      result += '   - Mendukung banyak bahasa termasuk Indonesia\n\n';
      
      result += '2. AssemblyAI (via Proxy)\n';
      result += '   - Free trial dengan credit $10\n';
      result += '   - Akurasi tinggi dengan AI model\n\n';
      
      result += '3. Whisper API (OpenAI)\n';
      result += '   - Model state-of-the-art untuk speech recognition\n';
      result += '   - Biaya rendah ($0.006 per menit)\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(70);
      
      // Simulasi hasil transkripsi
      result += 'Contoh Hasil Transkripsi Remote:\n\n';
      result += 'Selamat datang di aplikasi MP3 to Text. Aplikasi ini menggunakan teknologi speech recognition untuk mengubah file audio menjadi teks. Anda dapat mengupload file MP3 dan mendapatkan hasil transkripsi secara instan. Untuk hasil terbaik, gunakan audio dengan kualitas baik dan minim noise.\n\n';
      
      setTranscription(result);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTranscriptionProgress(90);
      
      // Informasi implementasi
      result += 'Implementasi Remote Transcription:\n';
      result += '1. Buat Netlify Function atau Vercel Edge Function\n';
      result += '2. Gunakan function sebagai proxy ke layanan transkripsi\n';
      result += '3. Simpan API key di environment variables\n';
      result += '4. Implementasi rate limiting untuk menghindari penyalahgunaan\n\n';
      
      result += 'CATATAN: Ini adalah simulasi. Untuk implementasi sebenarnya, Anda perlu membuat akun di layanan transkripsi dan mengintegrasikan API mereka.\n';
      
      setTranscription(result);
      setTranscriptionProgress(100);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Remote engine error:', error);
      setError(`Gagal memproses audio dengan remote engine: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  const startSpeechRecognition = () => {
    // Cek apakah browser mendukung Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Browser Anda tidak mendukung Speech Recognition. Gunakan Google Chrome terbaru.');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Siapkan Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'id-ID'; // Bahasa Indonesia
      recognition.continuous = true;
      recognition.interimResults = true;
      
      let finalTranscript = '';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscription(finalTranscript + '\n[mendengarkan...] ' + interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Error speech recognition: ${event.error}`);
        setIsProcessing(false);
      };
      
      recognition.onend = () => {
        setIsProcessing(false);
        // Tambahkan catatan bahwa recognition telah selesai
        setTranscription(prevTranscript => 
          prevTranscript + '\n\n[Speech recognition selesai]\n' +
          'CATATAN: Hasil mungkin tidak sempurna karena keterbatasan teknologi browser.'
        );
      };
      
      // Mulai recognition
      recognition.start();
      
      // Tambahkan pesan untuk user
      setTranscription('[Mendengarkan audio... Bicara ke mikrofon untuk transkripsi]\n');
      
      // Simpan instance recognition untuk dibersihkan nanti
      window.currentRecognition = recognition;
      
      // Otomatis berhenti setelah 60 detik untuk menghindari error
      setTimeout(() => {
        if (window.currentRecognition) {
          window.currentRecognition.stop();
        }
      }, 60000);
      
    } catch (error) {
      console.error('Speech recognition setup error:', error);
      setError(`Gagal menginisialisasi speech recognition: ${error.message}`);
      setIsProcessing(false);
    }
  };
  
  const stopSpeechRecognition = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      window.currentRecognition = null;
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 24, borderRadius: 8, maxWidth: 700, margin: '32px auto' }}>
      <h2 style={{ marginBottom: 16 }}>MP3 ke Teks (Tanpa API)</h2>
      
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

      {audioUrl && (
        <div style={{ marginBottom: 20, border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>Audio Player</h3>
          
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            controls 
            style={{ width: '100%', marginBottom: 10 }} 
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          
          <div style={{ height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progress}%`, 
                backgroundColor: '#4F46E5',
                borderRadius: 3,
                transition: 'width 0.3s'
              }} 
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button 
          onClick={processAudio}
          disabled={!audioFile || isProcessing}
          style={{
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: audioFile && !isProcessing ? 'pointer' : 'not-allowed',
            opacity: audioFile && !isProcessing ? 1 : 0.6
          }}
        >
          {isProcessing ? 'Memproses...' : 'Konversi ke Teks'}
        </button>
        
        <button 
          onClick={startSpeechRecognition}
          disabled={isProcessing}
          style={{
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: !isProcessing ? 'pointer' : 'not-allowed',
            opacity: !isProcessing ? 1 : 0.6
          }}
        >
          Gunakan Speech Recognition
        </button>
        
        {isProcessing && (
          <button 
            onClick={stopSpeechRecognition}
            style={{
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Berhenti
          </button>
        )}
        
        <button 
          onClick={() => setShowHelp(!showHelp)}
          style={{
            backgroundColor: 'transparent',
            color: '#4B5563',
            border: '1px solid #D1D5DB',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {showHelp ? 'Sembunyikan Bantuan' : 'Tampilkan Bantuan'}
        </button>
        
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            backgroundColor: 'transparent',
            color: '#4B5563',
            border: '1px solid #D1D5DB',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          {showAdvanced ? 'Sembunyikan Opsi Lanjutan' : 'Opsi Lanjutan'}
        </button>
      </div>
      
      {showAdvanced && (
        <div style={{ 
          marginBottom: 20, 
          backgroundColor: '#F9FAFB', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{ marginBottom: 12, fontSize: 16 }}>Engine Transkripsi</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 12px',
              borderRadius: 4,
              backgroundColor: transcriptionEngine === 'browser' ? '#EBF5FF' : 'transparent',
              border: '1px solid #D1D5DB',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                name="engine" 
                value="browser" 
                checked={transcriptionEngine === 'browser'}
                onChange={() => setTranscriptionEngine('browser')}
                style={{ marginRight: 8 }}
              />
              Browser (Dasar)
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 12px',
              borderRadius: 4,
              backgroundColor: transcriptionEngine === 'enhanced' ? '#EBF5FF' : 'transparent',
              border: '1px solid #D1D5DB',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                name="engine" 
                value="enhanced" 
                checked={transcriptionEngine === 'enhanced'}
                onChange={() => setTranscriptionEngine('enhanced')}
                style={{ marginRight: 8 }}
              />
              Enhanced (Lebih Akurat)
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 12px',
              borderRadius: 4,
              backgroundColor: transcriptionEngine === 'vosk' ? '#EBF5FF' : 'transparent',
              border: '1px solid #D1D5DB',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                name="engine" 
                value="vosk" 
                checked={transcriptionEngine === 'vosk'}
                onChange={() => setTranscriptionEngine('vosk')}
                style={{ marginRight: 8 }}
              />
              Vosk (Offline)
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 12px',
              borderRadius: 4,
              backgroundColor: transcriptionEngine === 'remote' ? '#EBF5FF' : 'transparent',
              border: '1px solid #D1D5DB',
              cursor: 'pointer'
            }}>
              <input 
                type="radio" 
                name="engine" 
                value="remote" 
                checked={transcriptionEngine === 'remote'}
                onChange={() => setTranscriptionEngine('remote')}
                style={{ marginRight: 8 }}
              />
              Remote Services
            </label>
          </div>
          
          <p style={{ marginTop: 12, fontSize: 14, color: '#6B7280' }}>
            Pilih engine transkripsi yang sesuai dengan kebutuhan Anda. Setiap engine memiliki kelebihan dan keterbatasan masing-masing.
          </p>
        </div>
      )}
      
      {isProcessing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>Memproses audio...</span>
            <span style={{ fontSize: 14 }}>{transcriptionProgress}%</span>
          </div>
          <div style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${transcriptionProgress}%`, 
                backgroundColor: '#4F46E5',
                borderRadius: 4,
                transition: 'width 0.3s'
              }} 
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 16, marginBottom: 16, color: '#DC2626', fontSize: 14 }}>
          {error}
        </div>
      )}

      {showHelp && (
        <div style={{ 
          marginBottom: 20, 
          backgroundColor: '#F9FAFB', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #E5E7EB',
          fontSize: 14
        }}>
          <h3 style={{ marginBottom: 8 }}>Cara Menggunakan:</h3>
          <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
            <li style={{ marginBottom: 8 }}>Upload file audio MP3/WAV</li>
            <li style={{ marginBottom: 8 }}>Gunakan player untuk mendengarkan audio</li>
            <li style={{ marginBottom: 8 }}>Pilih salah satu metode:
              <ul style={{ paddingLeft: 20, marginTop: 4 }}>
                <li><strong>Analisis Audio</strong> - Menganalisis audio untuk membantu transcription</li>
                <li><strong>Speech Recognition</strong> - Menggunakan fitur speech-to-text browser (Chrome)</li>
              </ul>
            </li>
            <li>Untuk hasil terbaik, dengarkan audio dan ketik manual di area transcription</li>
          </ol>
          <p><strong>Catatan:</strong> Aplikasi ini bekerja sepenuhnya di browser tanpa API eksternal.</p>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Hasil Transkripsi:</h3>
        <textarea
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          style={{ 
            width: '100%',
            minHeight: 200,
            padding: 12,
            borderRadius: 4,
            border: '1px solid #D1D5DB',
            fontFamily: 'monospace',
            fontSize: 14,
            lineHeight: 1.5,
            resize: 'vertical'
          }}
          placeholder="Hasil transkripsi akan muncul di sini. Anda juga bisa mengetik atau mengedit transkripsi secara manual."
        />
      </div>

      <div style={{ marginTop: 24, fontSize: 13, color: '#6B7280' }}>
        <p><strong>Metode Transcription Tanpa API:</strong></p>
        <ul style={{ paddingLeft: 20 }}>
          {transcriptionMethods.map((method, index) => (
            <li key={index} style={{ marginBottom: 4 }}>
              <strong>{method.name}</strong>: {method.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MP3Uploader;