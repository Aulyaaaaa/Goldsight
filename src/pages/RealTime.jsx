import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const dataGrafik = [
  { tanggal: '1 Mar', aktual: 1970, ma7: 1975, ma14: 1980 },
  { tanggal: '10 Mar', aktual: 1985, ma7: 1980, ma14: 1978 },
  { tanggal: '20 Mar', aktual: 2010, ma7: 1995, ma14: 1985 },
  { tanggal: '1 Apr', aktual: 2045, ma7: 2020, ma14: 2000 },
  { tanggal: '10 Apr', aktual: 2030, ma7: 2035, ma14: 2015 },
  { tanggal: '20 Apr', aktual: 2015, ma7: 2025, ma14: 2020 },
  { tanggal: '1 Mei', aktual: 2005, ma7: 2018, ma14: 2029 }, 
];

export default function RealTime() {
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Harga Emas Saat Ini</h3>
          <p className="text-3xl font-bold text-slate-800">$2005.42</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-sm font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              $12.74 (0.63%)
            </span>
            <span className="text-xs text-slate-400">Per troy ounce</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Moving Average 7 Hari</h3>
          <p className="text-3xl font-bold text-yellow-600">$2018.18</p>
          <p className="mt-4 text-xs text-slate-400">Rata-rata harga 7 hari terakhir</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Moving Average 14 Hari</h3>
          <p className="text-3xl font-bold text-slate-600">$2029.10</p>
          <p className="mt-4 text-xs text-slate-400">Rata-rata harga 14 hari terakhir</p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Status Tren Pasar</h3>
          <p className="text-xs text-slate-500 mt-1">Analisis otomatis berdasarkan Moving Average</p>
        </div>
        <div className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-lg flex items-center tracking-wide">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
          BEARISH
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <h3 className="text-base font-bold text-slate-800">Visualisasi Harga Emas</h3>
          <p className="text-sm text-slate-500 mt-1">Grafik menampilkan harga aktual, Moving Average 7 hari, dan Moving Average 14 hari</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataGrafik} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px', color: '#475569' }} />
              
              <Line type="monotone" dataKey="aktual" name="Harga Aktual" stroke="#334155" strokeWidth={2} dot={{ r: 4, fill: '#334155', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="ma7" name="MA 7 Hari" stroke="#ca8a04" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="ma14" name="MA 14 Hari" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <h3 className="text-base font-bold text-slate-800">Ringkasan Analisis Otomatis</h3>
          </div>
          <ul className="list-disc list-outside ml-5 space-y-2 text-sm text-slate-600 leading-relaxed">
            <li>Harga emas hari ini mengalami penurunan sebesar $12.74 (0.63%) menjadi $2005.42 per troy ounce.</li>
            <li>Harga saat ini berada di bawah Moving Average 7 hari ($2018.18) dan 14 hari ($2029.10), menunjukkan tekanan jual.</li>
            <li>Analisis tren menunjukkan kondisi <span className="font-semibold text-red-600">BEARISH</span> dengan MA jangka pendek berada di bawah MA jangka menengah.</li>
            <li>Ini mengindikasikan potensi tekanan jual berlanjut dalam jangka pendek.</li>
          </ul>
        </div>

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