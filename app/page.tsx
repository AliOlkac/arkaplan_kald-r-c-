"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Controls from "@/components/Controls";
import Dropzone from "@/components/Dropzone";
import PreviewArea, { type ViewMode } from "@/components/PreviewArea";
import {
  DEFAULT_OPTIONS,
  fitWithin,
  renderProcessed,
  type RemovalOptions,
} from "@/lib/whiteRemoval";

/** Önizleme bu boyuta küçültülerek işlenir; indirme her zaman tam çözünürlüktedir. */
const PREVIEW_MAX_SIZE = 1400;

type LoadedImage = {
  element: HTMLImageElement;
  url: string;
  name: string;
  width: number;
  height: number;
};

export default function Home() {
  const [image, setImage] = useState<LoadedImage | null>(null);
  const [options, setOptions] = useState<RemovalOptions>(DEFAULT_OPTIONS);
  const [mode, setMode] = useState<ViewMode>("side");
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dosya seçildiğinde görseli yükle, önceki object URL'i serbest bırak.
  const handleFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const element = new Image();
    element.onload = () => {
      setError(null);
      setImage((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return {
          element,
          url,
          name: file.name,
          width: element.naturalWidth,
          height: element.naturalHeight,
        };
      });
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Görsel okunamadı. Lütfen başka bir dosya deneyin.");
    };
    element.src = url;
  }, []);

  // Ayar değiştikçe önizlemeyi yeniden üret (küçültülmüş boyutta, hızlı).
  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setBusy(true);
    // Bir frame bekleyerek slider'ın akıcı kalmasını sağlar.
    const frame = requestAnimationFrame(() => {
      try {
        const { width, height } = fitWithin(image.width, image.height, PREVIEW_MAX_SIZE);
        renderProcessed(image.element, width, height, options, canvas);
      } catch {
        setError("Önizleme oluşturulamadı.");
      } finally {
        setBusy(false);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [image, options, mode]);

  // Sayfa kapanırken object URL temizliği
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = useCallback(async () => {
    if (!image) return;
    setDownloading(true);
    setError(null);

    try {
      // Tam çözünürlükte yeniden işle — önizleme küçültmesi çıktıya yansımaz.
      const canvas = renderProcessed(image.element, image.width, image.height, options);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("PNG üretilemedi");

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = toPngName(image.name);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      setError("PNG oluşturulamadı. Görsel çok büyük olabilir.");
    } finally {
      setDownloading(false);
    }
  }, [image, options]);

  const handleReset = useCallback(() => {
    setImage((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
    setOptions(DEFAULT_OPTIONS);
    setError(null);
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Beyaz Arka Plan Kaldırıcı
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
          Görselinizdeki beyaz ve beyaza yakın pikselleri şeffaflaştırır, sonucu gerçek
          transparan PNG olarak indirir. Tüm işlem tarayıcınızda yapılır — hiçbir dosya
          sunucuya yüklenmez.
        </p>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </div>
      )}

      {!image ? (
        <div className="mx-auto max-w-2xl">
          <Dropzone onFile={handleFile} />
          <ol className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-4 dark:text-slate-400">
            {["Görsel yükle", "Eşiği ayarla", "Sonucu önizle", "PNG indir"].map((step, i) => (
              <li
                key={step}
                className="rounded-xl border border-slate-200 bg-white/60 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40"
              >
                <span className="mr-2 font-mono text-blue-600">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="order-2 space-y-6 lg:order-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <Controls options={options} onChange={setOptions} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="truncate text-sm font-medium" title={image.name}>
                {image.name}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {image.width} × {image.height} px · çıktı tam çözünürlükte
              </p>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloading ? "Hazırlanıyor…" : "Şeffaf PNG İndir"}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Başka görsel yükle
              </button>
            </div>

            <div className="hidden lg:block">
              <Dropzone onFile={handleFile} compact />
            </div>
          </aside>

          <div className="order-1 rounded-2xl border border-slate-200 bg-white p-5 lg:order-2 dark:border-slate-800 dark:bg-slate-900/60">
            <PreviewArea
              ref={canvasRef}
              originalUrl={image.url}
              aspectRatio={image.width / image.height}
              mode={mode}
              onModeChange={setMode}
              busy={busy}
            />
          </div>
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-slate-500 dark:text-slate-500">
        Yalnızca beyaz / beyaza yakın alanları kaldırır — renkli nesnelere ve karakterlere
        dokunmaz.
      </footer>
    </main>
  );
}

function toPngName(fileName: string): string {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "");
  return `${base || "gorsel"}-transparent.png`;
}
