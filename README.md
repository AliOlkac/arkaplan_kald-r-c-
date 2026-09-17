# Beyaz Arka Plan Kaldırıcı

Görseldeki **beyaz ve beyaza yakın** pikselleri şeffaflaştırıp sonucu **gerçek alpha kanallı transparan PNG** olarak indiren tek sayfalık Next.js uygulaması.

Tüm işlem tarayıcıda (client-side) yapılır: backend, veritabanı, upload sunucusu veya üçüncü parti servis yoktur. Yüklenen görsel cihazdan hiç çıkmaz.

> Bu bir AI background remover değildir. Sadece eşik değerine göre açık/beyaz pikselleri kaldırır; karakterlere ve renkli alanlara dokunmaz.

## Özellikler

- Drag & drop veya "Görsel Seç" ile yükleme (JPG, JPEG, PNG, WEBP)
- **Beyaz Eşiği (White Threshold)** slider'ı — 200–255
- **Yumuşak Geçiş (Soft Edge)** slider'ı — 0–40 ton, kenarlarda kademeli alpha
- **Beyaz kenar parlamasını azalt** — yarı saydam kenarlardaki beyaz karışımı geri çözer
- Dama tahtası zeminli önizleme; "Yan yana" ve sürüklenebilir "Karşılaştır" modu
- Önizleme küçültülmüş boyutta işlenir (hızlı), indirme **tam çözünürlükte** üretilir
- Koyu tema desteği, mobil uyumlu düzen

## Nasıl çalışır?

`lib/whiteRemoval.ts` içindeki algoritma her piksel için `m = min(r, g, b)` değerini hesaplar:

| Durum | Sonuç |
| --- | --- |
| `m >= threshold` | Piksel tamamen şeffaf (`alpha = 0`) |
| `threshold - softness < m < threshold` | Kademeli olarak azalan alpha (yumuşak kenar) |
| Diğer | Piksel olduğu gibi korunur |

`min()` kullanılması, doygun ama açık renklerin (örneğin açık sarı veya açık mavi) yanlışlıkla silinmesini önler — sadece üç kanalı da yüksek olan, yani gerçekten beyaza yakın pikseller kaldırılır.

## Kurulum

```bash
npm install
```

## Local çalıştırma

```bash
npm run dev
```

Ardından http://localhost:3000 adresini açın.

## Build alma

```bash
npm run build
npm run start
```

## Vercel deploy

Uygulama tamamen statik/client-side çalıştığı için ek yapılandırma gerektirmez — ortam değişkeni, secret veya harici servis yoktur.

**Git üzerinden (önerilen)**

1. Projeyi bir GitHub/GitLab/Bitbucket deposuna push edin.
2. [vercel.com/new](https://vercel.com/new) adresinden depoyu import edin.
3. Vercel framework olarak Next.js'i otomatik algılar; Build Command `next build`, Output ayarı varsayılan kalsın.
4. **Deploy**'a basın.

**CLI ile**

```bash
npm i -g vercel
vercel
vercel --prod
```

## Proje yapısı

```
app/
  layout.tsx        Kök layout ve metadata
  page.tsx          Tek sayfa uygulama, durum yönetimi ve indirme
  globals.css       Tailwind + dama tahtası deseni
components/
  Dropzone.tsx      Drag & drop + dosya seçici
  Controls.tsx      Threshold / soft edge / despill ayarları
  PreviewArea.tsx   Yan yana ve karşılaştırmalı önizleme
lib/
  whiteRemoval.ts   Piksel işleme algoritması
```

## Notlar

- Önizleme en fazla 1400 px kenar uzunluğunda işlenir; bu yalnızca ekrandaki görüntüyü etkiler, indirilen PNG orijinal çözünürlüktedir.
- Çok büyük görsellerde (ör. 8000 px+) tarayıcı canvas bellek sınırlarına takılabilir; böyle bir durumda uygulama hata mesajı gösterir.
