import React, { useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

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
    
    // Simulasi konversi MP3 ke TXT
    setTimeout(() => {
      setTxtResult(`Ini adalah contoh hasil konversi dari ${mp3File.name}\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.`);
      setIsConverting(false);
    }, 2000);
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