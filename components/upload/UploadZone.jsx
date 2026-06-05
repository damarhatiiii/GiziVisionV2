'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addHistory } from '@/services/history.service';
import { UploadCloud, X, Sparkles, Loader2, ImageIcon, AlertTriangle } from 'lucide-react';

export default function UploadZone() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Format berkas harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    setError('');
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    const reader = new FileReader();
    reader.onloadend = () => setBase64Image(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl('');
    setBase64Image('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!base64Image) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, fileName: file.name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menganalisis gambar.');
      const savedScan = addHistory({
        name: data.name,
        confidence: data.confidence,
        nutrition: data.nutrition,
        image: base64Image,
      });
      if (savedScan) router.push(`/analysis?id=${savedScan.id}`);
      else throw new Error('Gagal menyimpan hasil analisis.');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menganalisis.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">

      {!previewUrl ? (
        /* ── DROPZONE ── */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative w-full h-72 rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center gap-4 cursor-pointer
            transition-all duration-200
            ${dragActive
              ? 'border-gold bg-gold/5'
              : 'border-border hover:border-brown hover:bg-surface/50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          <div className={`
            w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-200
            ${dragActive ? 'bg-gold/15 text-gold' : 'bg-card text-text-muted'}
          `}>
            <UploadCloud className="w-7 h-7" />
          </div>
          <div className="text-center px-6">
            <p className="text-sm font-semibold text-text-primary mb-1">
              {dragActive ? 'Lepaskan file di sini' : 'Tarik & Lepas Foto Makanan'}
            </p>
            <p className="text-xs text-text-muted">
              atau klik untuk memilih file · JPG, PNG, WEBP
            </p>
          </div>
          <div className="text-xs text-text-disabled bg-card border border-border px-3 py-1.5 rounded-md">
            Tip: Beri nama file seperti{' '}
            <code className="text-gold font-mono">bakso.jpg</code> untuk deteksi lebih akurat
          </div>
        </div>

      ) : (
        /* ── PREVIEW STATE ── */
        <div className="card p-5 space-y-4">
          
          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-bg border border-border flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Food Preview"
              className="max-h-full max-w-full object-contain"
            />

            {/* Loading scan line */}
            {loading && (
              <div
                className="absolute left-0 w-full h-0.5 opacity-70 animate-[scanLine_1.8s_linear_infinite]"
                style={{
                  background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                  boxShadow: '0 0 8px #D4AF37',
                }}
              />
            )}
          </div>

          {/* File info row */}
          <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-text-primary truncate max-w-xs">{file?.name}</p>
                <p className="text-[10px] text-text-muted">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={handleRemove}
                className="w-7 h-7 rounded-md border border-border bg-card flex items-center justify-center text-text-muted hover:border-danger/50 hover:text-danger transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Analyze button */}
          <button
            disabled={loading}
            onClick={handleAnalyze}
            className={`
              w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2
              transition-all duration-200
              ${loading
                ? 'bg-brown/30 text-brown cursor-not-allowed border border-brown/20'
                : 'btn-primary w-full justify-center py-3'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menganalisis kandungan nutrisi...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analisis Kandungan Nutrisi
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-danger/5 border border-danger/20 text-danger text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Analisis Gagal</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

    </div>
  );
}
