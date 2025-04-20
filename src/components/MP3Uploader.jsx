import React, { useState, useRef } from 'react';

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
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

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
    
    try {
      // Metode 1: Analisis audio menggunakan Web Audio API
      // Ini adalah contoh sederhana yang mengekstrak beberapa fitur audio
      // dan memberikan hasil "dummy" karena transcription sebenarnya memerlukan model ML
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Baca file audio
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          // Decode audio data
          const audioData = await audioContext.decodeAudioData(e.target.result);
          
          // Analisis sederhana (hanya contoh)
          const audioBuffer = audioData;
          const channelData = audioBuffer.getChannelData(0); // Ambil channel pertama
          
          // Hitung beberapa statistik dasar
          let sum = 0;
          let peaks = 0;
          const threshold = 0.1;
          
          // Ambil sampel untuk analisis (tidak semua data untuk performa)
          const sampleStep = Math.floor(channelData.length / 1000);
          const samples = [];
          
          for (let i = 0; i < channelData.length; i += sampleStep) {
            const value = Math.abs(channelData[i]);
            samples.push(value);
            sum += value;
            if (value > threshold) peaks++;
          }
          
          const average = sum / samples.length;
          
          // Simulasi deteksi segmen audio (bicara vs diam)
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
          
          // Buat hasil "dummy" berdasarkan analisis
          // Dalam kasus nyata, ini akan menggunakan model ML untuk transcription
          const durationSeconds = audioBuffer.duration;
          const minutes = Math.floor(durationSeconds / 60);
          const seconds = Math.floor(durationSeconds % 60);
          
          const result = `[Analisis Audio Selesai]

Durasi: ${minutes}m ${seconds}s
Segmen bicara terdeteksi: ${segments.length}
Rata-rata amplitudo: ${average.toFixed(4)}

` +
          `Hasil analisis menunjukkan file audio ini ${peaks > 100 ? 'memiliki banyak' : 'memiliki sedikit'} variasi suara.

` +
          `Segmen bicara terdeteksi pada:
` +
          segments.slice(0, 10).map(seg => 
            `- ${Math.floor(seg.start / 60)}:${Math.floor(seg.start % 60).toString().padStart(2, '0')} - ` +
            `${Math.floor(seg.end / 60)}:${Math.floor(seg.end % 60).toString().padStart(2, '0')} ` +
            `(${seg.duration.toFixed(1)}s)`
          ).join('\n') +
          (segments.length > 10 ? `\n...dan ${segments.length - 10} segmen lainnya` : '') +
          '\n\n' +
          'CATATAN: Ini adalah hasil analisis otomatis tanpa API eksternal. ' +
          'Untuk hasil terbaik, gunakan fitur "Transcribe Manual" dengan mendengarkan dan mengetik.\n\n' +
          'Anda juga dapat menggunakan Speech Recognition di browser Chrome dengan mengklik tombol "Gunakan Speech Recognition".'
          
          setTranscription(result);
          
        } catch (decodeError) {
          console.error('Error decoding audio:', decodeError);
          setError('Gagal memproses audio. Format mungkin tidak didukung oleh browser Anda.');
        }
      };
      
      fileReader.onerror = () => {
        setError('Gagal membaca file audio.');
      };
      
      fileReader.readAsArrayBuffer(audioFile);
      
    } catch (error) {
      console.error('Processing error:', error);
      setError(`Gagal memproses audio: ${error.message}`);
    } finally {
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
          {isProcessing ? 'Memproses...' : 'Analisis Audio'}
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
      </div>

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