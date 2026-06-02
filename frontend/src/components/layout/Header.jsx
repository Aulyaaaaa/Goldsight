export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-100">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Gold<span className="text-yellow-600">Sight</span></h1>
        </div>
        
        <nav className="flex gap-6 mt-1">
          <button 
            onClick={() => setActiveTab('realtime')}
            className={`text-sm font-semibold pb-1 transition-colors border-b-2 ${activeTab === 'realtime' ? 'text-yellow-600 border-yellow-500' : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'}`}
          >
            Analisis Real-Time
          </button>
          
          <button 
            onClick={() => setActiveTab('prediction')}
            className={`text-sm font-semibold pb-1 transition-colors border-b-2 ${activeTab === 'prediction' ? 'text-yellow-600 border-yellow-500' : 'text-slate-500 border-transparent hover:text-slate-800 hover:border-slate-300'}`}
          >
            Prediksi
          </button>
        </nav>
        
      </div>
    </header>
  );
}