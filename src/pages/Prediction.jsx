import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const dataPrediksi = [
  { tanggal: '24 Apr', aktual: 2018 },
  { tanggal: '26 Apr', aktual: 2025 },
  { tanggal: '28 Apr', aktual: 2005 },
  { tanggal: '30 Apr', aktual: 2002 },
  { tanggal: '1 Mei', aktual: 2024.84 },
  { tanggal: '2 Mei', prediksi: 2028 },
  { tanggal: '4 Mei', prediksi: 2030 },
  { tanggal: '6 Mei', prediksi: 2035 },
  { tanggal: '8 Mei', prediksi: 2043.81 },
];

export default function Prediction() {
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
          <p className="text-xs text-slate-500 mb-4">Pilih tanggal untuk memprediksi harga emas (1-14 hari ke depan)</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Target Prediksi</label>
              <input type="date" defaultValue="2026-05-08" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500" />
            </div>
            <div className="bg-yellow-50 border border-yellow-100 px-4 py-2 rounded-lg text-center">
              <span className="block text-[10px] text-yellow-700 font-medium">Jumlah Hari</span>
              <span className="block text-sm font-bold text-yellow-600">7 hari</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Harga Hari Ini</h3>
          <p className="text-3xl font-bold text-slate-800">$2024.84</p>
          <p className="mt-4 text-xs text-slate-400">Jumat, 1 Mei 2026</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
          <h3 className="text-sm font-medium text-slate-500 mb-2 pl-2">Harga Prediksi</h3>
          <div className="pl-2">
            <p className="text-3xl font-bold text-yellow-600">$2043.81</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2 py-1 rounded">
                +18.97 USD (+0.94%)
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">Jumat, 8 Mei 2026</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Visualisasi Prediksi</h3>
          <p className="text-sm text-slate-500 mt-1">Grafik menampilkan data aktual dan proyeksi prediksi hingga tanggal yang dipilih</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataPrediksi} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#475569' }} />
              <Line type="monotone" dataKey="aktual" name="Harga Aktual" stroke="#334155" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="prediksi" name="Harga Prediksi" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-800">Rekomendasi Investasi</h3>
            </div>
            <p className="text-xs text-slate-500">Berdasarkan analisis tren dan hasil prediksi harga</p>
          </div>
          <div className="text-right">
            <div className="inline-block px-6 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-lg font-black rounded-lg tracking-widest">
              HOLD
            </div>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Confidence: Sedang</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 border-l-4 border-yellow-400 bg-slate-50 rounded-r-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center">
              <span className="text-yellow-500 mr-2">📌</span> Alasan
            </h4>
            <p className="text-sm text-slate-600">Perubahan harga minimal (0.94%) dalam kondisi tren sideways.</p>
          </div>
          
          <div className="p-4 border-l-4 border-slate-300 bg-slate-50 rounded-r-lg">
            <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center">
              <span className="text-slate-400 mr-2">💡</span> Penjelasan Detail
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">Model memprediksi pergerakan harga yang relatif stabil dari $2024.84 ke $2043.81. Tidak ada sinyal kuat untuk membeli atau menjual. Investor disarankan untuk mempertahankan posisi saat ini dan terus memantau perkembangan pasar.</p>
          </div>
        </div>
      </div>

    </div>
  );
}