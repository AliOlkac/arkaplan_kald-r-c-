"use client";

import { useRef, useState } from "react";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  onFile: (file: File) => void;
  compact?: boolean;
};

export default function Dropzone({ onFile, compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Desteklenen formatlar: JPG, JPEG, PNG, WEBP");
      return;
    }
    setError(null);
    onFile(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition",
          compact ? "gap-2 px-5 py-6" : "gap-3 px-6 py-14",
          dragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-slate-300 bg-white/60 hover:border-blue-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-blue-500",
        ].join(" ")}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={compact ? "h-6 w-6 text-blue-600" : "h-10 w-10 text-blue-600"}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4 4 4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>

        <div>
          <p className={compact ? "text-sm font-medium" : "text-base font-semibold"}>
            Görseli buraya sürükleyip bırakın
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            veya dosya seçmek için tıklayın · JPG, PNG, WEBP
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          className="mt-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Görsel Seç
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // aynı dosya tekrar seçilebilsin
        }}
      />
    </div>
  );
}
