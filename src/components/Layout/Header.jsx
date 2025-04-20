import React from 'react';
    import { Link } from 'react-router-dom';
    import { Mic, Settings, LogIn } from 'lucide-react'; // Menggunakan ikon yang relevan

    const Header = () => {
      return (
        <header className="bg-white shadow-md sticky top-0 z-50">
          <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:text-red-700 transition-colors">
              <Mic size={28} />
              <span>Aplikasi Ajaib</span>
            </Link>
            <div className="flex items-center space-x-4">
              {/* Navigasi bisa ditambahkan di sini jika perlu */}
              <Link to="/settings" className="text-gray-600 hover:text-primary transition-colors">
                 <Settings size={20} />
                 <span className="sr-only">Pengaturan</span> {/* Untuk aksesibilitas */}
              </Link>
              <button className="bg-secondary hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-full text-sm transition duration-300 ease-in-out flex items-center space-x-1">
                <LogIn size={16} />
                <span>Masuk</span>
              </button>
            </div>
          </nav>
        </header>
      );
    };

    export default Header;