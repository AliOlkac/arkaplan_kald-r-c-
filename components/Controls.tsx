"use client";

import type { RemovalOptions } from "@/lib/whiteRemoval";
import { DEFAULT_OPTIONS } from "@/lib/whiteRemoval";

type Props = {
  options: RemovalOptions;
  onChange: (next: RemovalOptions) => void;
};

export default function Controls({ options, onChange }: Props) {
  const set = (patch: Partial<RemovalOptions>) => onChange({ ...options, ...patch });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Ayarlar
        </h2>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_OPTIONS)}
          className="text-xs text-blue-600 hover:underline"
        >
          Varsayılana dön
        </button>
      </div>

      <Slider
        label="Beyaz Eşiği (White Threshold)"
        hint="Düşürdükçe daha fazla açık ton silinir."
        min={200}
        max={255}
        value={options.threshold}
        onChange={(threshold) => set({ threshold })}
      />

      <Slider
        label="Yumuşak Geçiş (Soft Edge)"
        hint="Eşiğin altındaki tonlarda kademeli şeffaflık; kenarları yumuşatır."
        min={0}
        max={40}
        value={options.softness}
        onChange={(softness) => set({ softness })}
      />

      <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-100/70 p-3 dark:bg-slate-800/50">
        <input
          type="checkbox"
          checked={options.despill}
          onChange={(e) => set({ despill: e.target.checked })}
          className="mt-0.5 h-4 w-4 accent-blue-600"
        />
        <span>
          <span className="block text-sm font-medium">Beyaz kenar parlamasını azalt</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            Yarı saydam kenarlardaki beyaz karışımı geri çözer.
          </span>
        </span>
      </label>
    </div>
  );
}

function Slider({
  label,
  hint,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium">{label}</label>
        <span className="rounded-md bg-slate-200 px-2 py-0.5 font-mono text-xs dark:bg-slate-700">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}
