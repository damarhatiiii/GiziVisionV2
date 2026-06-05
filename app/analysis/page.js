'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getHistory } from '@/services/history.service';
import Link from 'next/link';
import {
  ArrowLeft, AlertCircle, RotateCcw,
  BarChart3, Clock, CheckCircle, AlertTriangle, Info
} from 'lucide-react';

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { router.push('/upload'); return; }
    const history = getHistory();
    const found = history.find(item => item.id === id);
    if (found) setScan(found);
    setLoading(false);
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-text-muted">Memuat hasil analisis...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-14 h-14 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-5">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Data Tidak Ditemukan</h2>
        <p className="text-sm text-text-muted mb-6 max-w-sm">
          Hasil scan tidak tersedia atau telah dihapus dari riwayat lokal.
        </p>
        <Link href="/upload" className="btn-primary">
          Kembali ke Upload
        </Link>
      </div>
    );
  }

  const { nutrition, confidence, foodName, timestamp } = scan;
  const calories = Number(nutrition?.calories) || 0;
  const proteins = Number(nutrition?.proteins) || 0;
  const fat = Number(nutrition?.fat) || 0;
  const carbs = Number(nutrition?.carbohydrate) || 0;
  const totalMacros = carbs + proteins + fat;
  const carbPct  = totalMacros > 0 ? Math.round((carbs   / totalMacros) * 100) : 0;
  const protPct  = totalMacros > 0 ? Math.round((proteins / totalMacros) * 100) : 0;
  const fatPct   = totalMacros > 0 ? Math.round((fat      / totalMacros) * 100) : 0;

  // Recommendations
  const getRecs = () => {
    const recs = [];
    if (calories > 450) recs.push({ type: 'warning', text: 'Kepadatan kalori tinggi. Tambah porsi serat dan sayuran, kurangi porsi karbohidrat.' });
    else if (calories > 0 && calories <= 250) recs.push({ type: 'success', text: 'Kalori tergolong rendah. Cocok untuk menu diet sehat atau dikombinasikan dengan protein tambahan.' });
    if (fat > 20) recs.push({ type: 'warning', text: 'Lemak cukup tinggi. Batasi lauk gorengan dan perbanyak konsumsi air putih.' });
    if (proteins > 15) recs.push({ type: 'success', text: 'Kandungan protein tinggi — baik untuk pemulihan otot dan metabolisme.' });
    else if (proteins < 5 && calories > 300) recs.push({ type: 'info', text: 'Protein rendah. Pertimbangkan menambahkan telur, tempe, atau dada ayam.' });
    if (carbs > 60) recs.push({ type: 'info', text: 'Sumber karbohidrat tinggi. Ideal untuk energi sebelum aktivitas fisik.' });
    if (recs.length === 0) recs.push({ type: 'success', text: 'Komposisi nutrisi seimbang. Pertahankan pola makan bervariasi.' });
    return recs;
  };
  const recs = getRecs();

  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="flex-1 container mx-auto px-6 max-w-7xl py-10">

      {/* Back link */}
      <Link
        href="/upload"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Pindai Gambar Baru
      </Link>

      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="gold-line"></div>
            <span className="section-label">Hasil Analisis</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">{foodName}</h1>
          <p className="text-sm text-text-muted mt-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date(timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <div className="card px-5 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <p className="stat-label mb-1">Tingkat Kesesuaian</p>
            <p className="text-2xl font-bold text-text-primary">{confidencePct}%</p>
          </div>
          <div className="w-px h-10 bg-border"></div>
          <div>
            <p className="stat-label mb-1">Status</p>
            <span className={`badge ${confidencePct >= 80 ? 'badge-success' : 'badge-warning'}`}>
              {confidencePct >= 80 ? 'Akurat' : 'Perkiraan'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Images */}
        <div className="lg:col-span-4 space-y-5">

          {/* User photo */}
          <div className="card p-4">
            <p className="stat-label mb-3">Foto yang Diunggah</p>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-bg border border-border flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={scan.image} alt="Uploaded Food" className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          {/* Dataset reference */}
          {nutrition?.image && (
            <div className="card p-4">
              <p className="stat-label mb-3">Foto Referensi Dataset</p>
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-bg border border-border flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nutrition.image}
                  alt="Dataset Reference"
                  className="max-h-full max-w-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-2 italic">Sumber: Indonesian Food & Drink Nutrition Dataset</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex flex-col gap-2">
            <Link href="/upload" className="btn-secondary justify-center">
              <RotateCcw className="w-4 h-4" /> Pindai Ulang
            </Link>
            <Link href="/dashboard" className="btn-secondary justify-center">
              <BarChart3 className="w-4 h-4" /> Lihat Dashboard
            </Link>
          </div>
        </div>

        {/* RIGHT: Nutrition Data */}
        <div className="lg:col-span-8 space-y-5">

          {/* Calorie header */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 mb-5 border-b border-border">
              <div>
                <p className="stat-label mb-2">Energi Terkandung</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-text-primary">{calories}</span>
                  <span className="text-base text-text-muted font-medium">kkal</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Nilai per 100 gram konsumsi</p>
              </div>
              <div className="flex gap-2">
                <span className="badge badge-gold">{carbs}g Karbo</span>
                <span className="badge" style={{ background: 'rgba(111,78,55,0.1)', color: '#8B6347', border: '1px solid rgba(111,78,55,0.2)' }}>
                  {proteins}g Protein
                </span>
                <span className="badge" style={{ background: 'rgba(155,68,68,0.1)', color: '#C07070', border: '1px solid rgba(155,68,68,0.2)' }}>
                  {fat}g Lemak
                </span>
              </div>
            </div>

            {/* Macro bars */}
            <div>
              <p className="stat-label mb-4">Distribusi Makronutrisi</p>
              <div className="space-y-5">
                {[
                  { label: 'Karbohidrat', value: carbs, unit: 'g', pct: carbPct, bar: 'progress-fill-gold' },
                  { label: 'Protein',     value: proteins, unit: 'g', pct: protPct, bar: 'progress-fill-brown' },
                  { label: 'Lemak',       value: fat, unit: 'g', pct: fatPct, bar: 'progress-fill-muted' },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-text-secondary">{m.label}</span>
                      <span className="text-xs text-text-muted">{m.value} {m.unit} · {m.pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={m.bar} style={{ width: `${m.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="card p-6">
            <p className="stat-label mb-4">Rekomendasi Pola Makan</p>
            <div className="space-y-3">
              {recs.map((rec, i) => {
                const styles = {
                  warning: { bg: 'bg-warning/5 border-warning/20', text: 'text-warning', Icon: AlertTriangle },
                  success: { bg: 'bg-success/5 border-success/20', text: 'text-success', Icon: CheckCircle },
                  info:    { bg: 'bg-info/5 border-info/20',       text: 'text-info',    Icon: Info },
                };
                const s = styles[rec.type] || styles.info;
                return (
                  <div key={i} className={`flex gap-3 p-4 rounded-lg border text-sm leading-relaxed ${s.bg}`}>
                    <s.Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${s.text}`} />
                    <p className="text-text-secondary">{rec.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-text-muted">Memuat...</p>
        </div>
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
