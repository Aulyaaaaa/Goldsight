import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Prediction() {
  const [tanggalInput, setTanggalInput] = useState('2026-05-08');
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. STATE DIKOSONGKAN SECARA TOTAL (Tanpa Data Dummy)
  const [hargaHariIni, setHargaHariIni] = useState(0);
  const [hargaPrediksi, setHargaPrediksi] = useState(0);
  const [selisihHarga, setSelisihHarga] = useState('-');
  const [statusRekomendasi, setStatusRekomendasi] = useState('MENUNGGU');
  const [alasanRekomendasi, setAlasanRekomendasi] = useState('Silakan pilih tanggal dan klik "Analisis Sekarang" untuk melihat prediksi.');
  
  // Grafik dikosongkan secara total
  const [dataGrafik, setDataGrafik] = useState([]);

  // 2. FUNGSI PANGGIL API
  const handlePrediksi = async () => {
    setIsLoading(true);
    try {
      const formattedDate = tanggalInput
      .split("-")
      .reverse()
      .join("-")

      const response = await fetch('http://localhost:8000/predict/custom/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          target_date: formattedDate,
          weight: 1.0
        }),
      });

      if (response.ok) {
        const dataBE = await response.json();
        
        // Data asli dari Back-End masuk ke sini
        setHargaHariIni(dataBE.last_price);
        setHargaPrediksi(dataBE.predicted_price);
        setStatusRekomendasi(dataBE.recommendation);
        
        const tanda = dataBE.predicted_delta > 0 ? '+' : '';
        setSelisihHarga(`${tanda}${dataBE.predicted_delta} Rupiah (${tanda}${dataBE.delta_pct}%)`);
        setAlasanRekomendasi(`Mesin memprediksi perubahan harga sebesar ${dataBE.delta_pct}% menuju target.`);
        
        const chartWithToday = [
        {
        tanggal: "Hari Ini",
        aktual: dataBE.last_price,
        prediksi: dataBE.last_price
        },
        ...dataBE.chart_data.map(item => ({
        tanggal: item.tanggal,
        aktual: null,
        prediksi: item.prediksi
        }))
        ]

        setDataGrafik(chartWithToday)

      } else {
        alert("Server terhubung, tapi gagal memproses data.");
      }
    } catch (error) {
      console.error("Koneksi gagal:", error);
      alert("Gagal koneksi. Pastikan Back-End teman Anda sudah menyala di localhost:8000");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Prediksi Harga Emas</h2>
        <p className="text-slate-500 mt-1">Forecasting & Rekomendasi Investasi Berbasis Linear Regression</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <h3 className="text-sm font-bold text-slate-800">Pilih Tanggal Prediksi</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">Pilih tanggal untuk memprediksi harga emas (1-14 hari ke depan)</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Tanggal Target Prediksi</label>
              <input 
                type="date" 
                value={tanggalInput}
                onChange={(e) => setTanggalInput(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" 
              />
            </div>

            <button 
              onClick={handlePrediksi}
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isLoading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Memproses...
                </>
              ) : 'Analisis Sekarang'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Harga Hari Ini</h3>
          <p className="text-3xl font-bold text-slate-800">
            {hargaHariIni > 0 ? `Rp.${hargaHariIni.toLocaleString('id-ID')}` : 'Rp.0'}
          </p>
          <p className="mt-4 text-xs text-slate-400">Menunggu respons dari server</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
          <h3 className="text-sm font-medium text-slate-500 mb-2 pl-2">Harga Prediksi</h3>
          <div className="pl-2">
            <p className="text-3xl font-bold text-yellow-600">
              {hargaPrediksi > 0 ? `Rp.${hargaPrediksi.toLocaleString('id-ID')}` : 'Rp.0'}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
                {selisihHarga}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Target: {tanggalInput}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Visualisasi Prediksi</h3>
          <p className="text-sm text-slate-500 mt-1">Grafik menampilkan data prediksi hingga tanggal yang dipilih</p>
        </div>
        <div className="h-80 w-full flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
          {dataGrafik.length === 0 ? (
            <p className="text-sm font-medium text-slate-400">Grafik Kosong - Menunggu Data Prediksi</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataGrafik} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                
                {/* YAxis diformat menjadi Rupiah */}
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rp${(value/1000).toLocaleString('id-ID')}k`} />
                
                {/* Tooltip diformat menjadi Rupiah */}
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value, name) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#475569' }} />
              
                {/* Garis Prediksi: Kuning Emas & Putus-putus */}
                <Line type="monotone" dataKey="prediksi" name="Harga Prediksi" stroke="#F59E0B" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} connectNulls={true} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Rekomendasi Investasi</h3>
            <p className="text-xs text-slate-500">Berdasarkan hasil analisis dari prediksi di atas.</p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-6 py-2 border text-lg font-black rounded-lg tracking-widest ${
              statusRekomendasi === 'BUY' ? 'bg-green-50 text-green-700 border-green-200' : 
              statusRekomendasi === 'SELL' ? 'bg-red-50 text-red-700 border-red-200' : 
              'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {statusRekomendasi}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center">
              <span className="text-slate-400 mr-2">📌</span> Status
            </h4>
            <p className="text-sm text-slate-600">{alasanRekomendasi}</p>
          </div>
        </div>
      </div>

    </div>
  );
}