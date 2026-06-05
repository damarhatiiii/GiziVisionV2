import UploadZone from '@/components/upload/UploadZone';

export const metadata = {
  title: 'Pindai Makanan | GiziVision',
  description: 'Unggah foto makanan khas Indonesia untuk menganalisis kandungan nutrisi dan kalorinya secara otomatis.',
};

export default function UploadPage() {
  return (
    <div className="flex-1 container mx-auto px-6 max-w-4xl py-14">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="gold-line"></div>
          <span className="section-label">Analisis Nutrisi</span>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-3">Pindai Makanan Anda</h1>
        <p className="text-sm text-text-secondary max-w-lg leading-relaxed">
          Unggah foto makanan khas Indonesia. Sistem akan mendeteksi jenis pangan 
          dan mencocokkannya dengan dataset gizi nasional untuk menghasilkan laporan nutrisi lengkap.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Hint */}
      <div className="mt-8 pt-8 border-t border-border">
        <p className="text-xs text-text-muted mb-3 font-semibold uppercase tracking-widest">Contoh makanan yang dapat dideteksi</p>
        <div className="flex flex-wrap gap-2">
          {['Bakso', 'Nasi Goreng', 'Rendang', 'Gado-Gado', 'Sate Ayam', 'Mie Goreng', 'Soto Ayam', 'Tempe Goreng', 'Pempek'].map((food) => (
            <span
              key={food}
              className="px-3 py-1 text-xs text-text-muted bg-card border border-border rounded-md"
            >
              {food}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
