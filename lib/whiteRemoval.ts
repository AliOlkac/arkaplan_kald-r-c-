/**
 * Beyaz / beyaza yakın piksellerin şeffaflaştırılması.
 * Tamamen client-side, saf piksel işlemi. AI yok, segmentasyon yok.
 */

export type RemovalOptions = {
  /** Bu değerin üstündeki (RGB kanallarının en düşüğü) pikseller beyaz sayılır. 200-255 */
  threshold: number;
  /** Eşiğin hemen altındaki tonlarda kademeli şeffaflık bandı (ton cinsinden). 0-40 */
  softness: number;
  /** Yarı şeffaf piksellerdeki beyaz taşmasını geri alır (kenar halkasını azaltır). */
  despill: boolean;
};

export const DEFAULT_OPTIONS: RemovalOptions = {
  threshold: 240,
  softness: 12,
  despill: true,
};

/**
 * ImageData'yı yerinde işler.
 * Mantık:
 *  - m = min(r, g, b)  → renkli alanlarda düşük, beyaza yakın alanlarda yüksek.
 *  - m >= threshold            → piksel tamamen şeffaf.
 *  - m >= threshold - softness → kademeli olarak azalan alpha (yumuşak kenar).
 *  - aksi halde                → piksel olduğu gibi korunur.
 * min() kullanmak, doygun renklerin (örn. açık sarı) yanlışlıkla silinmesini önler.
 */
export function removeWhite(imageData: ImageData, options: RemovalOptions): ImageData {
  const data = imageData.data;
  const threshold = clamp(options.threshold, 0, 255);
  const softness = Math.max(0, options.softness);
  const softStart = threshold - softness; // bu değerin altı hiç dokunulmaz

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha === 0) continue; // zaten şeffaf

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const m = r < g ? (r < b ? r : b) : g < b ? g : b;

    if (m >= threshold) {
      data[i + 3] = 0;
      continue;
    }

    if (softness > 0 && m > softStart) {
      // Eşiğe yaklaştıkça 1 → 0 arası azalan çarpan
      const factor = 1 - (m - softStart) / softness;
      const newAlpha = alpha * factor;
      data[i + 3] = newAlpha;

      if (options.despill && newAlpha > 1) {
        // Yarı saydam piksel beyaz zeminle karışmıştı; karışımı geri çöz.
        const a = newAlpha / 255;
        const white = 255 * (1 - a);
        data[i] = clamp((r - white) / a, 0, 255);
        data[i + 1] = clamp((g - white) / a, 0, 255);
        data[i + 2] = clamp((b - white) / a, 0, 255);
      }
    }
  }

  return imageData;
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** Bir görseli hedef genişlik/yüksekliğe çizip beyazı kaldırılmış canvas döndürür. */
export function renderProcessed(
  source: CanvasImageSource,
  width: number,
  height: number,
  options: RemovalOptions,
  target?: HTMLCanvasElement
): HTMLCanvasElement {
  const canvas = target ?? document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context alınamadı.");

  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  removeWhite(imageData, options);
  ctx.putImageData(imageData, 0, 0);

  return canvas;
}

/** Önizleme için makul bir boyut hesaplar (büyük görsellerde akıcılık). */
export function fitWithin(width: number, height: number, maxSize: number) {
  const ratio = Math.min(1, maxSize / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
    scale: ratio,
  };
}
