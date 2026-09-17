"use client";

import { forwardRef, useCallback, useRef, useState } from "react";

export type ViewMode = "side" | "compare";

type Props = {
  originalUrl: string;
  aspectRatio: number; // width / height
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  busy: boolean;
};

/**
 * Sonuç canvas'ı ref ile dışarı verilir; sayfa piksel işlemini doğrudan
 * bu canvas üzerinde yapar (ekstra kopya / blob üretilmez).
 */
const PreviewArea = forwardRef<HTMLCanvasElement, Props>(function PreviewArea(
  { originalUrl, aspectRatio, mode, onModeChange, busy },
  canvasRef
) {
  const compareRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);

  const updatePosition = useCallback((clientX: number) => {
    const el = compareRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Önizleme
        </h2>

        <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-medium dark:bg-slate-800">
          <ModeButton active={mode === "side"} onClick={() => onModeChange("side")}>
            Yan yana
          </ModeButton>
          <ModeButton active={mode === "compare"} onClick={() => onModeChange("compare")}>
            Karşılaştır
          </ModeButton>
        </div>
      </div>

      {mode === "side" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Frame label="Önce" aspectRatio={aspectRatio}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={originalUrl} alt="Orijinal görsel" className="h-full w-full object-contain" />
          </Frame>

          <Frame label="Sonra" aspectRatio={aspectRatio} checkerboard busy={busy}>
            <canvas ref={canvasRef} className="h-full w-full object-contain" />
          </Frame>
        </div>
      ) : (
        <Frame label="Önce / Sonra" aspectRatio={aspectRatio} checkerboard busy={busy}>
          <div
            ref={compareRef}
            onPointerDown={startDrag}
            onPointerMove={(e) => e.buttons === 1 && updatePosition(e.clientX)}
            className="relative h-full w-full cursor-ew-resize touch-none select-none"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full object-contain"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalUrl}
              alt="Orijinal görsel"
              draggable={false}
              className="absolute inset-0 h-full w-full bg-white object-contain dark:bg-white"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-blue-500"
              style={{ left: `${position}%` }}
            >
              <div className="absolute top-1/2 left-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500 bg-white shadow" />
            </div>
          </div>
        </Frame>
      )}
    </section>
  );
});

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-3 py-1.5 transition",
        active
          ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white"
          : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Frame({
  label,
  aspectRatio,
  checkerboard = false,
  busy = false,
  children,
}: {
  label: string;
  aspectRatio: number;
  checkerboard?: boolean;
  busy?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
        {busy && <span className="text-blue-600">işleniyor…</span>}
      </div>
      <div
        className={[
          "overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700",
          checkerboard ? "checkerboard" : "bg-white dark:bg-slate-900",
        ].join(" ")}
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        {children}
      </div>
    </div>
  );
}

export default PreviewArea;
