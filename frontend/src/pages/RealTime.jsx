import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RealTime() {
  // State Utama
  const [allData, setAllData] = useState({
    historis: [],
    validasi: []
  }); // Menyimpan seluruh data mentah dari database
  const [selectedWeight, setSelectedWeight] = useState(1); // Default awal menampilkan 1 gram
  const [hargaSaatIni, setHargaSaatIni] = useState(0);
  const [waktuUpdate, setWaktuUpdate] = useState('Menunggu server...');
  const [dataGrafik, setDataGrafik] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk MA dan Tren
  const [ma7, setMa7] = useState(0);
  const [ma14, setMa14] = useState(0);
  const [statusTren, setStatusTren] = useState('MENUNGGU DATA');

  // ============================================================
  // EFFECT 1: Mengambil Data Mentah dari API Back-End
  // ============================================================
  useEffect(() => {
    const ambilDataRealTime = async () => {
      try {
        const responseGold = await fetch('https://goldsight-production.up.railway.app/gold-prices/');
        const responsePrediction = await fetch(`https://goldsight-production.up.railway.app/predictions/validation?weight=${selectedWeight}`);
        if (responseGold.ok && responsePrediction.ok) {
          const dataMentah = await responseGold.json();
          const dataPrediksi = await responsePrediction.json();
          setAllData({
            historis: dataMentah,
            validasi: dataPrediksi
          }); // Simpan semua data tanpa difilter dulu
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
  }, [selectedWeight]);

  // ============================================================
  // EFFECT 2: Memproses & Menghitung Data Berdasarkan Gram Pilihan
  // ============================================================
  useEffect(() => {
    if (allData.historis.length === 0) return;

    // 1. Filter data berdasarkan berat gram yang dipilih pengguna
    const dataTerfilter = allData.historis.filter(item => Number(item.weight) === Number(selectedWeight));

    // Urutkan berdasarkan tanggal terbaru (descending) untuk mencari harga saat ini
    dataTerfilter.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    if (dataTerfilter.length > 0) {
      // 2. Set Harga Saat Ini dan Waktu Terkini
      const dataTerbaru = dataTerfilter[0];
      setHargaSaatIni(Number(dataTerbaru.sell_price));

      const tanggal = new Date(dataTerbaru.updated_at);
      setWaktuUpdate(tanggal.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      }));

      // 3. Hitung Rata-rata Harga (Moving Average) 7 Hari dan 14 Hari
      const hitungRataRata = (dataArray, rentangHari) => {
        const dataSlice = dataArray.slice(0, rentangHari);
        if (dataSlice.length === 0) return 0;
        const total = dataSlice.reduce((sum, item) => sum + Number(item.sell_price), 0);
        return Math.round(total / dataSlice.length);
      };

      const nilaiMa7 = hitungRataRata(dataTerfilter, 7);
      const nilaiMa14 = hitungRataRata(dataTerfilter, 14);
      setMa7(nilaiMa7);
      setMa14(nilaiMa14);

      // 4. Tentukan Status Tren Pasar berdasarkan MA
      if (nilaiMa7 > nilaiMa14) {
        setStatusTren('BULLISH (NAIK) 📈');
      } else if (nilaiMa7 < nilaiMa14) {
        setStatusTren('BEARISH (TURUN) 📉');
      } else {
        setStatusTren('SIDEWAYS (STABIL) ➡️');
      }

      // 5. Olah Data Historis untuk Komponen Grafik (Maksimal 14 baris terbaru)
      const dataUntukGrafik = (allData.validasi || []).map((item) => ({
        tanggal: item.tanggal,
        aktual: Number(item.aktual),
        prediksi: Number(item.prediksi)
      }));

      setDataGrafik(dataUntukGrafik);

    } else {
      // Jika ukuran gram tertentu tidak ada datanya
      setHargaSaatIni(0);
      setMa7(0);
      setMa14(0);
      setStatusTren('DATA TIDAK TERSEDIA');
      setDataGrafik([]);
    }
  }, [allData, selectedWeight]);

  return (
    <div className="space-y-6">

      {/* TOOLBAR DROPDOWN FILTER GRAM */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Filter Analisis Real-Time</h2>
          <p className="text-xs text-slate-500 mt-0.5">Sesuaikan visualisasi grafik dan nilai kalkulasi berdasarkan ukuran gram emas</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-600">Pilih Ukuran Emas:</label>
          <select
            value={selectedWeight}
            onChange={(e) => setSelectedWeight(Number(e.target.value))}
            className="bg-white border border-slate-300 text-slate-700 py-1.5 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold cursor-pointer"
          >
            <option value={0.5}>0.5 Gram</option>
            <option value={1}>1 Gram</option>
            <option value={2}>2 Gram</option>
            <option value={3}>3 Gram</option>
            <option value={5}>5 Gram</option>
          </select>
        </div>
      </div>

      {/* GRID KARTU INFORMASI UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KARTU HARGA REAL-TIME */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center text-sm font-bold text-slate-500 animate-pulse">Menghubungkan ke Server...</div>}
          <h3 className="text-sm font-medium text-slate-500 mb-2">Harga Emas Saat Ini ({selectedWeight} Gram)</h3>
          <p className="text-3xl font-bold text-slate-800">
            {hargaSaatIni > 0 ? `Rp ${hargaSaatIni.toLocaleString('id-ID')}` : 'Rp 0'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">Update: {waktuUpdate}</span>
          </div>
        </div>

        {/* KARTU RATA-RATA HARGA 7 HARI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Rata-rata Harga dalam 7 Hari</h3>
          <p className="text-3xl font-bold text-amber-600">
            {ma7 > 0 ? `Rp ${ma7.toLocaleString('id-ID')}` : 'Rp 0'}
          </p>
          <p className="mt-4 text-xs text-slate-400">Rata-rata pergerakan jangka pendek</p>
        </div>

        {/* KARTU RATA-RATA HARGA 14 HARI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Rata-rata Harga dalam 14 Hari</h3>
          <p className="text-3xl font-bold text-slate-600">
            {ma14 > 0 ? `Rp ${ma14.toLocaleString('id-ID')}` : 'Rp 0'}
          </p>
          <p className="mt-4 text-xs text-slate-400">Rata-rata pergerakan jangka menengah</p>
        </div>
      </div>

      {/* STATUS TREN PASAR */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Status Tren Pasar</h3>
          <p className="text-xs text-slate-500 mt-1">Analisis otomatis berdasarkan Moving Average</p>
        </div>
        <div className={`px-4 py-2 border text-sm font-bold rounded-lg flex items-center tracking-wide ${statusTren.includes('BULLISH') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          statusTren.includes('BEARISH') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
          {statusTren}
        </div>
      </div>

      {/* GRAFIK VISUALISASI */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Visualisasi Harga Emas ({selectedWeight} Gram)</h3>
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
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `Rp${(value / 1000).toLocaleString('id-ID')}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }} formatter={(value, name) => [`Rp ${Number(value).toLocaleString('id-ID')}`, name]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#475569' }} />

                {/* Garis Harga Aktual: Abu-abu Tua */}
                <Line
                  type="monotone"
                  dataKey="aktual"
                  name="Harga Aktual"
                  stroke="#1F2937"
                  strokeWidth={4}
                  dot={{ fill: '#1F2937', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8 }}
                  connectNulls={true}
                />

                {/* Garis Harga Prediksi: Kuning Emas Putus-putus */}
                <Line
                  type="monotone"
                  dataKey="prediksi"
                  name="Harga Prediksi"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: '#F59E0B', r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* RINGKASAN OTOMATIS */}
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
                <li>Harga emas ukuran <strong>{selectedWeight} Gram</strong> saat ini tercatat sebesar <strong>Rp {hargaSaatIni.toLocaleString('id-ID')}</strong>.</li>
                <li>Rata-rata pergerakan harga jangka pendek (7 Hari) berada pada nilai Rp {ma7.toLocaleString('id-ID')}.</li>
                <li>Berdasarkan persilangan Moving Average, kondisi pasar saat ini berada dalam status <strong className="text-amber-600">{statusTren}</strong>.</li>
              </>
            )}
          </ul>
        </div>

        {/* METODOLOGI */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h3 className="text-base font-bold text-slate-800">Metodologi Analisis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-800 mb-1">Bullish</h4>
              <p className="text-xs text-emerald-600/80">Kondisi di mana MA7 &gt; MA14. Menandakan tren harga cenderung naik.</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <h4 className="text-sm font-bold text-red-700 mb-1">Bearish</h4>
              <p className="text-xs text-red-600/80">Kondisi di mana MA7 &lt; MA14. Menandakan tren harga cenderung turun.</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Sideways</h4>
              <p className="text-xs text-slate-500">Kondisi ketika nilai MA7 dan MA14 bernilai sama/mendatar.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}