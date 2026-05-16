import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RealTime() {
  // 1. STATE DIKOSONGKAN SECARA TOTAL (Tanpa Data Dummy)
  const [hargaSaatIni, setHargaSaatIni] = useState(0);
  const [waktuUpdate, setWaktuUpdate] = useState('Menunggu server...');
  const [dataGrafik, setDataGrafik] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk MA dan Tren (Menunggu data dari BE)
  const [ma7, setMa7] = useState(0);
  const [ma14, setMa14] = useState(0);
  const [statusTren, setStatusTren] = useState('MENUNGGU DATA');

  // 2. FUNGSI OTOMATIS (Berjalan saat halaman dibuka)
  useEffect(() => {
    const ambilDataRealTime = async () => {
      try {
        const response = await fetch('http://localhost:8000/gold-prices/');
        
        if (response.ok) {
          const dataMentah = await response.json();
          
          if (dataMentah.length > 0) {
            const dataTerbaru = dataMentah[0];
            setHargaSaatIni(dataTerbaru.sell_price);
            
            const tanggal = new Date(dataTerbaru.updated_at);
            setWaktuUpdate(tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' }));

            // Mengolah data mentah menjadi format grafik
            const dataUntukGrafik = dataMentah.slice(0, 14).reverse().map((item) => {
              const dateObj = new Date(item.updated_at);
              return {
                tanggal: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
                aktual: item.sell_price,
              };
            });
            
            setDataGrafik(dataUntukGrafik);
          }
        } else {
          setWaktuUpdate('Gagal menarik data dari server');
        }
      } catch (error) {
        console.error("Gagal mengambil data Real-Time:", error);
        setWaktuUpdate('Koneksi terputus. Pastikan server BE menyala.');
      } finally {
        setIsLoading(false);
      }
    };

    ambilDataRealTime();
  }, []);

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center text-sm font-bold text-slate-500 animate-pulse">Menghubungkan ke Server...</div>}
          <h3 className="text-sm font-medium text-slate-500 mb-2">Harga Emas Saat Ini</h3>
          <p className="text-3xl font-bold text-slate-800">
            {hargaSaatIni > 0 ? `Rp ${hargaSaatIni.toLocaleString('id-ID')}` : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Update: {waktuUpdate}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Moving Average 7 Hari</h3>
          <p className="text-3xl font-bold text-yellow-600">Rp {ma7}</p>
          <p className="mt-4 text-xs text-slate-400">Menunggu kalkulasi dari server</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Moving Average 14 Hari</h3>
          <p className="text-3xl font-bold text-slate-600">Rp {ma14}</p>
          <p className="mt-4 text-xs text-slate-400">Menunggu kalkulasi dari server</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Status Tren Pasar</h3>
          <p className="text-xs text-slate-500 mt-1">Analisis otomatis berdasarkan Moving Average</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 text-slate-600 border border-slate-200 text-sm font-bold rounded-lg flex items-center tracking-wide">
          {statusTren}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Visualisasi Harga Emas</h3>
          <p className="text-sm text-slate-500 mt-1">Grafik menampilkan pergerakan harga aktual dari API Back-End</p>
        </div>
        <div className="h-80 w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          {dataGrafik.length === 0 ? (
             <p className="text-sm font-medium text-slate-400">Grafik Kosong - Menunggu Data Historis</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataGrafik} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rp${(value/1000)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Harga Aktual']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#475569' }} />
                
                <Line type="monotone" dataKey="aktual" name="Harga Aktual" stroke="#334155" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <h3 className="text-base font-bold text-slate-800">Ringkasan Analisis Otomatis</h3>
          </div>
          <ul className="list-disc list-outside ml-5 space-y-2 text-sm text-slate-600 leading-relaxed">
            {hargaSaatIni === 0 ? (
              <li className="text-slate-400 italic">Menunggu data terhubung untuk menghasilkan ringkasan otomatis...</li>
            ) : (
              <>
                <li>Harga emas saat ini tercatat sebesar Rp {hargaSaatIni.toLocaleString('id-ID')}.</li>
                <li>Data ditarik secara langsung dari basis data historis secara real-time.</li>
                <li className="text-amber-600 italic">Catatan: Analisis tren dan Moving Average belum tersedia dari server untuk diringkas.</li>
              </>
            )}
          </ul>
        </div>
        
        {/* Metodologi tetap statis karena ini adalah panduan informasi */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-base font-bold text-slate-800">Metodologi Analisis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Bullish</h4>
              <p className="text-xs text-slate-500">MA7 &gt; MA14 dengan tren naik pada kedua MA</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <h4 className="text-sm font-bold text-red-700 mb-1">Bearish</h4>
              <p className="text-xs text-red-600/80">MA7 &lt; MA14 dengan tren turun pada kedua MA</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Sideways</h4>
              <p className="text-xs text-slate-500">Kondisi selain bullish dan bearish, harga bergerak mendatar</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}