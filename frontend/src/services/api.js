const BASE_URL = 'http://127.0.0.1:8000';

// Fungsi untuk meminta data Prediksi Custom (Berdasarkan Tanggal)
export const fetchCustomPrediction = async (targetDate) => {
  try {
    const response = await fetch(`${BASE_URL}/predict/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Mengubah data tanggal menjadi format JSON yang dimengerti Back-End
      body: JSON.stringify({ 
        // NOTE: Nama variabel "target_date" ini masih tebakan, kita harus pastikan nanti!
        target_date: targetDate 
      })
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data dari server');
    }

    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Error pada fetchCustomPrediction:", error);
    throw error;
  }
};