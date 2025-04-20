import React from 'react';
    import { Github, Linkedin, Twitter } from 'lucide-react'; // Contoh ikon sosial media

    const Footer = () => {
      const currentYear = new Date().getFullYear();
      return (
        <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm mb-2">&copy; {currentYear} Aplikasi Ajaib. Semua Hak Cipta Dilindungi.</p>
            <div className="flex justify-center space-x-4">
              <a href="#" className="hover:text-white transition-colors"><Github size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter size={20} /></a>
            </div>
             <p className="text-xs mt-2 text-gray-500">Dibuat dengan ❤️ oleh Tim Ajaib</p>
          </div>
        </footer>
      );
    };

    export default Footer;