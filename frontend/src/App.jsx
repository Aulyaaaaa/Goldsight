import { useState } from 'react';
import Header from './components/layout/Header';
import RealTime from './pages/RealTime';
import Prediction from './pages/Prediction';
import Footer from './components/layout/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('realtime');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {activeTab === 'realtime' ? <RealTime /> : <Prediction />}
      </main>
      <Footer />
    </div>
  );
}