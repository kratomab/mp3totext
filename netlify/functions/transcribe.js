// Netlify Function untuk transcribe MP3 ke teks
// File ini akan di-deploy ke Netlify dan berfungsi sebagai backend

const fetch = require('node-fetch');
const FormData = require('form-data');

// Daftar API transcription yang bisa digunakan (tambahkan API key Anda di environment variables Netlify)
const TRANSCRIPTION_APIS = {
  ASSEMBLY_AI: {
    url: 'https://api.assemblyai.com/v2/transcript',
    headers: {
      'Authorization': process.env.ASSEMBLY_AI_KEY || ''
    }
  },
  WHISPER_REPLICATE: {
    url: 'https://api.replicate.com/v1/predictions',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_TOKEN || ''}`,
      'Content-Type': 'application/json'
    }
  },
  HUGGING_FACE: {
    url: 'https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h',
    headers: {
      'Authorization': `Bearer ${process.env.HUGGING_FACE_TOKEN || ''}`,
    }
  }
};

exports.handler = async function(event, context) {
  // Hanya menerima POST request
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // Parse multipart form data (untuk file audio)
    // Catatan: Dalam implementasi nyata, Anda perlu library untuk parse multipart form
    // Contoh: busboy, formidable, atau multipart-formdata
    
    // Untuk demo, kita gunakan simulasi
    const audioData = event.body; // Ini seharusnya berisi data audio dari form
    
    // Coba transcribe dengan API yang tersedia
    let transcriptionResult = null;
    let errorMessages = [];
    
    // 1. Coba AssemblyAI jika API key tersedia
    if (process.env.ASSEMBLY_AI_KEY) {
      try {
        console.log('Mencoba transcribe dengan AssemblyAI...');
        
        // Langkah 1: Upload audio ke AssemblyAI
        const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
          method: 'POST',
          headers: {
            'Authorization': TRANSCRIPTION_APIS.ASSEMBLY_AI.headers.Authorization
          },
          body: audioData
        });
        
        if (uploadResponse.ok) {
          const { upload_url } = await uploadResponse.json();
          
          // Langkah 2: Transcribe audio yang sudah diupload
          const transcribeResponse = await fetch(TRANSCRIPTION_APIS.ASSEMBLY_AI.url, {
            method: 'POST',
            headers: {
              'Authorization': TRANSCRIPTION_APIS.ASSEMBLY_AI.headers.Authorization,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              audio_url: upload_url
            })
          });
          
          if (transcribeResponse.ok) {
            const { id } = await transcribeResponse.json();
            
            // Langkah 3: Poll untuk hasil (dalam kasus nyata, gunakan webhook)
            // Ini hanya simulasi sederhana
            transcriptionResult = {
              text: 'Ini adalah hasil transkripsi dari AssemblyAI (simulasi). Dalam implementasi nyata, Anda perlu polling atau webhook untuk mendapatkan hasil sebenarnya.',
              source: 'AssemblyAI'
            };
            
            // Jika berhasil, langsung return
            return {
              statusCode: 200,
              body: JSON.stringify(transcriptionResult)
            };
          }
        }
      } catch (error) {
        errorMessages.push(`AssemblyAI error: ${error.message}`);
      }
    }
    
    // 2. Coba Whisper via Replicate jika API key tersedia
    if (process.env.REPLICATE_API_TOKEN) {
      try {
        console.log('Mencoba transcribe dengan Whisper via Replicate...');
        
        // Dalam kasus nyata, perlu konversi audio ke base64 atau URL
        // Ini hanya simulasi
        transcriptionResult = {
          text: 'Ini adalah hasil transkripsi dari Whisper via Replicate (simulasi). Dalam implementasi nyata, Anda perlu mengirim audio ke Replicate API.',
          source: 'Whisper (Replicate)'
        };
        
        return {
          statusCode: 200,
          body: JSON.stringify(transcriptionResult)
        };
      } catch (error) {
        errorMessages.push(`Whisper error: ${error.message}`);
      }
    }
    
    // 3. Coba Hugging Face jika API key tersedia
    if (process.env.HUGGING_FACE_TOKEN) {
      try {
        console.log('Mencoba transcribe dengan Hugging Face...');
        
        // Dalam kasus nyata, perlu mengirim audio dalam format yang sesuai
        // Ini hanya simulasi
        transcriptionResult = {
          text: 'Ini adalah hasil transkripsi dari Hugging Face (simulasi). Dalam implementasi nyata, Anda perlu mengirim audio ke Hugging Face API.',
          source: 'Hugging Face'
        };
        
        return {
          statusCode: 200,
          body: JSON.stringify(transcriptionResult)
        };
      } catch (error) {
        errorMessages.push(`Hugging Face error: ${error.message}`);
      }
    }
    
    // 4. Fallback jika semua API gagal
    if (!transcriptionResult) {
      // Jika tidak ada API key yang dikonfigurasi, berikan pesan informasi
      if (!process.env.ASSEMBLY_AI_KEY && !process.env.REPLICATE_API_TOKEN && !process.env.HUGGING_FACE_TOKEN) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            text: `Untuk menggunakan fitur transcription, Anda perlu mengkonfigurasi setidaknya satu API key di environment variables Netlify:
            
1. AssemblyAI: Daftar di https://www.assemblyai.com/ untuk mendapatkan API key gratis
2. Replicate: Daftar di https://replicate.com/ untuk menggunakan Whisper
3. Hugging Face: Daftar di https://huggingface.co/ untuk mendapatkan token

Tambahkan API key di Netlify dashboard: Site settings > Build & deploy > Environment variables`,
            source: 'Info'
          })
        };
      } else {
        // Jika ada API key tapi semua gagal
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: 'Semua layanan transcription gagal',
            details: errorMessages
          })
        };
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message })
    };
  }
};
