import React from 'react';
    import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
    import HomePage from './pages/HomePage';
    import Header from './components/Layout/Header';
    import Footer from './components/Layout/Footer';

    function App() {
      return (
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Rute lain akan ditambahkan di sini sesuai permintaan */}
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      );
    }

    export default App;