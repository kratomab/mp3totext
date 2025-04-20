import React from 'react';
    import { UploadCloud, FileText, Edit3, Zap, Share2, BrainCircuit, Mic2 } from 'lucide-react'; // Added BrainCircuit for AI, Mic2 for Real-time
    import MP3Uploader from '../components/MP3Uploader';

    const HomePage = () => {
      return (
        <div className="animate-fade-in text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            Ubah <span className="text-primary">MP3 jadi Teks</span><br /> dalam Sekejap Mata! 🚀
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Capek ngetik transkrip? Upload aja rekaman kuliah, rapat, atau podcast kamu ke <b className="text-secondary">Aplikasi Ajaib</b>. Voila! Teks akurat langsung jadi! ✨
          </p>

          <MP3Uploader />

          {/* Updated Feature Cards */}
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Kenapa Pilih Aplikasi Ajaib? 🤔</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <FeatureCard
              icon={<Zap size={40} className="text-primary" />}
              title="Konversi Kilat ⚡"
              description="Gak pake lama! MP3 langsung jadi teks dalam hitungan detik. Super cepet!"
            />
            <FeatureCard
              icon={<FileText size={40} className="text-green-500" />} // Changed color for variety
              title="Akurasi Tinggi 🎯"
              description="AI canggih kami paham berbagai aksen & kualitas audio. Hasilnya 99% akurat!"
            />
             <FeatureCard
              icon={<BrainCircuit size={40} className="text-purple-500" />} // Icon for AI Summarizer
              title="AI Summarizer ✨"
              description="Langsung dapet intisari dari transkrip panjang. Hemat waktu bacanya!"
            />
            <FeatureCard
              icon={<Edit3 size={40} className="text-accent" />}
              title="Edit Gampang ✏️"
              description="Perbaiki typo atau tambah catatan? Bisa banget! Edit langsung di aplikasi."
            />
            <FeatureCard
              icon={<Share2 size={40} className="text-blue-500" />}
              title="Ekspor & Share 📤"
              description="Simpan ke TXT, DOC, PDF, atau langsung share ke WA, Email, & sosmed favoritmu!"
            />
             <FeatureCard
              icon={<Mic2 size={40} className="text-orange-500" />} // Icon for Real-time (Optional)
              title="Real-time Transcribe (Soon!) 🎙️"
              description="Lagi rekaman? Langsung ubah jadi teks secara live! (Fitur segera hadir)"
            />
          </div>

           {/* Visual Section */}
           <div className="mb-12 bg-gradient-to-r from-primary via-secondary to-accent p-1 rounded-lg shadow-xl max-w-3xl mx-auto">
             <img
               src="https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80" // More dynamic image
               alt="Ilustrasi Aplikasi Ajaib"
               className="rounded-lg w-full"
             />
           </div>
           <p className="text-md text-gray-600 mb-10">
             Cocok buat mahasiswa, podcaster, profesional, dan siapa aja yang mau hidup lebih simpel! 😉
           </p>

          <button className="bg-secondary hover:bg-teal-600 text-white font-bold py-4 px-10 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl animate-bounce-slow">
            Cobain Gratis Sekarang! 🎉
          </button>
        </div>
      );
    };

    // Komponen kecil untuk kartu fitur (minor style adjustments)
    const FeatureCard = ({ icon, title, description }) => (
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center">
        <div className="mb-4 p-3 bg-gray-100 rounded-full">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    );

    export default HomePage;