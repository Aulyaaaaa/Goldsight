export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-yellow-50 p-1.5 rounded-md border border-yellow-100">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Gold<span className="text-yellow-600">Sight</span></h3>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Sistem prediksi dan analisis harga emas berbasis machine learning untuk mendukung keputusan investasi yang objektif dan data-driven.
          </p>
        </div>

      </div>

      <div className="border-t border-slate-100 bg-slate-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center gap-3 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 GoldSight - Data-Driven Investment Decision Support System
          </p>
        </div>
      </div>
    </footer>
  );
}