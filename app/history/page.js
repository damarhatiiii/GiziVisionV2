'use client';

import { useState, useEffect } from 'react';
import { getHistory, deleteHistoryItem } from '@/services/history.service';
import Link from 'next/link';
import { Eye, Trash2, Search, Camera, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    setHistory(getHistory());
    setLoading(false);
  };

  useEffect(() => { loadHistory(); }, []);

  const handleDelete = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Hapus item ini dari riwayat?')) {
      deleteHistoryItem(id);
      loadHistory();
    }
  };

  // Search across all item names in a scan
  const filtered = history.filter(scan => {
    const query = searchQuery.toLowerCase();
    // Support new format (items array)
    if (scan.items && Array.isArray(scan.items)) {
      return scan.items.some(item => item.name?.toLowerCase().includes(query));
    }
    // Support old format (foodName)
    return scan.foodName?.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-sm text-text-muted">Memuat riwayat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-6 max-w-7xl py-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="gold-line"></div>
            <span className="section-label">Riwayat</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Riwayat Pemindaian</h1>
          <p className="text-sm text-text-muted mt-1">
            {history.length > 0 ? `${history.length} pemindaian tersimpan di perangkat ini.` : 'Belum ada pemindaian.'}
          </p>
        </div>

        {/* Search */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 min-w-[220px]">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari makanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-text-primary placeholder-text-muted outline-none w-full"
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="card p-14 text-center max-w-lg mx-auto mt-6">
          <div className="w-14 h-14 rounded-xl bg-card border border-border flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-text-muted" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Riwayat Kosong</h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            Belum ada pemindaian makanan. Unggah foto makanan untuk memulai analisis nutrisi.
          </p>
          <Link href="/upload" className="btn-primary inline-flex">
            <Camera className="w-4 h-4" />
            Mulai Pindai
          </Link>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Makanan</th>
                    <th>Tanggal</th>
                    <th className="text-center">Kesesuaian</th>
                    <th className="text-right">Kalori</th>
                    <th className="text-center">Makronutrisi</th>
                    <th className="text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-text-muted italic">
                        Tidak ditemukan makanan dengan kata kunci &ldquo;{searchQuery}&rdquo;
                      </td>
                    </tr>
                  ) : (
                    filtered.map((scan) => {
                      // Support both old and new format
                      const nut = scan.totalNutrition || scan.nutrition || {};
                      const items = scan.items || [];
                      const itemCount = items.filter(i => i.nutrition).length;
                      const displayName = scan.foodName || items[0]?.name || 'Tidak Dikenal';
                      
                      // Calculate average confidence
                      const avgConf = items.length > 0
                        ? Math.round(items.reduce((s, i) => s + (i.confidence || 0), 0) / items.length * 100)
                        : Math.round((scan.confidence || 0) * 100);

                      return (
                        <tr key={scan.id}>
                          {/* Food name + image */}
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg overflow-hidden bg-bg border border-border flex-shrink-0">
                                {scan.image ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img src={scan.image} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-text-disabled text-xs">?</div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                                {itemCount > 1 && (
                                  <p className="text-[10px] text-gold font-medium">+{itemCount - 1} item lain</p>
                                )}
                                {itemCount <= 1 && (
                                  <p className="text-[10px] text-text-muted font-mono">#{scan.id.slice(-6)}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td>
                            <p className="text-sm text-text-secondary">
                              {new Date(scan.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-text-muted">
                              {new Date(scan.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                          {/* Confidence */}
                          <td className="text-center">
                            <span className={`badge ${avgConf >= 80 ? 'badge-success' : 'badge-warning'}`}>
                              {avgConf}%
                            </span>
                          </td>

                          {/* Calories */}
                          <td className="text-right">
                            <span className="text-sm font-bold text-text-primary">{nut.calories || '—'}</span>
                            <span className="text-xs text-text-muted ml-1">kkal</span>
                          </td>

                          {/* Macros */}
                          <td>
                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold">
                              <span className="px-2 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                                K {nut.carbohydrate ?? '—'}g
                              </span>
                              <span className="px-2 py-0.5 rounded bg-brown/10 text-brown-light border border-brown/20">
                                P {nut.proteins ?? '—'}g
                              </span>
                              <span className="px-2 py-0.5 rounded bg-danger/10 text-danger border border-danger/20">
                                L {nut.fat ?? '—'}g
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="flex items-center justify-center gap-1.5">
                              <Link
                                href={`/analysis?id=${scan.id}`}
                                title="Lihat Hasil"
                                className="w-7 h-7 rounded-md border border-border bg-card hover:border-gold/40 hover:text-gold flex items-center justify-center text-text-muted transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={(e) => handleDelete(scan.id, e)}
                                title="Hapus"
                                className="w-7 h-7 rounded-md border border-border bg-card hover:border-danger/40 hover:text-danger flex items-center justify-center text-text-muted transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-text-muted px-1">
            Riwayat disimpan secara lokal di browser. Menghapus cache browser akan menghapus data ini.
          </p>
        </div>
      )}
    </div>
  );
}
