import React, { useState } from 'react';

const MP3Uploader = () => {
  const [fileName, setFileName] = useState('');

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
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