# Eforsuz — Videodan sese, eforsuz.

**Eforsuz**, kullanıcının cihazından seçtiği video dosyalarını (`MP4`, `MOV`, `WEBM`, `MKV`, `M4A`, `AVI`) hiçbir sunucuya yüklemeden, doğrudan tarayıcı içinde **MP3** (`128 kbps`, `192 kbps`, `320 kbps`), **M4A** veya **WAV** ses dosyasına dönüştüren statik bir web uygulamasıdır (PWA).

## Özellikler

- **%100 Cihaz İçi Dönüşüm:** `@ffmpeg/ffmpeg` ve `@ffmpeg/util` tek iş parçacıklı (single-threaded) çekirdeği kullanılır. `SharedArrayBuffer` veya özel HTTP başlıkları (`COOP`/`COEP`) gerektirmez; iOS Safari ve Android Chrome'da sorunsuz çalışır.
- **Tembel Yükleme (Lazy Load):** FFmpeg WASM çekirdeği yalnızca kullanıcı dönüştürme butonuna bastığında indirilir; sayfanın ilk açılışı anlıktır.
- **Editoryal Minimalizm Tasarım:** Glassmorphism, bulanıklık veya gradyan içermez. Düz opak renkler, keskin tipografi ve `src/temalar/` altında 3 farklı editoryal tema (**STUDIO NOVA**, **LINEA DESIGN**, **MONOQ**) sunar.
- **İkonik Sarkıt Ampul (Koyu/Açık Mod):** Sağ üst köşeden sarkan kablolu duy ve ampul ile tek tıkla (ve 5px aşağı esneyen mekanik kordon hissiyle) açık/koyu mod geçişi yapılır.
- **Tek Noktadan Metin Yönetimi:** Sitedeki tüm başlıklar, butonlar, hata mesajları ve site adı `src/metinler.js` dosyasından yönetilir.

---

## 1. Kurulum ve Yerelde Çalıştırma

Bilgisayarınızda [Node.js](https://nodejs.org/) (v18 veya üzeri) kurulu olmalıdır.

```bash
# Proje klasörüne gidin
cd ~/Desktop/eforsuz

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresini açarak uygulamayı test edebilirsiniz.

Üretim (production) derlemesini oluşturmak ve yerelde test etmek için:

```bash
npm run build
npm run preview
```

---

## 2. Metinleri ve Site Adını Değiştirme

Sitedeki hiçbir yazı HTML veya JS mantığının içine gömülmemiştir. Tüm metinleri değiştirmek için [`src/metinler.js`](./src/metinler.js) dosyasını açmanız yeterlidir:

```js
export const METINLER = {
  siteAdi: "Eforsuz", // Burayı değiştirdiğinizde üst başlık ve marka adı anında değişir
  baslik: "Videodan sese, eforsuz.",
  altBaslik: "Dosyan cihazından çıkmaz. Dönüşüm tarayıcında yapılır.",
  // ...
};
```

---

## 3. Tasarım Yönünü (Temayı) Değiştirme

Uygulama `src/temalar/` klasöründe üç ayrı editoryal minimalizm teması barındırır:

1. **`src/temalar/studio-nova.css`** (`studio-nova`): Grafik ve cesur. Büyük tipografi, keskin köşeler (`0px`), siyah-beyaz zemin üstünde tek canlı renk (`#FF3B00`).
2. **`src/temalar/linea-design.css`** (`linea-design`): Çizgi odaklı. İnce konturlar (`1px`), ızgara düzen, mimari çizim hissi, mavi-gri tonlar.
3. **`src/temalar/monoq.css`** (`monoq`): Tek renkli (monokrom). Siyah, beyaz ve gri tonları, vurgu rengi yok; hiyerarşi sadece boyut ve kalınlıkla.

Varsayılan temayı değiştirmek için:
- `index.html` dosyasındaki `<html lang="tr" data-style="studio-nova">` satırında `data-style` değerini `linea-design` veya `monoq` yapabilirsiniz.
- Ayrıca sayfanın en altındaki stil seçici butonlarla kullanıcılar da canlı olarak geçiş yapabilir.

---

## 4. GitHub ve Cloudflare Pages (veya Netlify) ile Ücretsiz Yayınlama

### Adım 1: Kodu GitHub'a Yükleyin
```bash
cd ~/Desktop/eforsuz
git init
git add .
git commit -m "İlk sürüm: Eforsuz"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/eforsuz.git
git push -u origin main
```

### Adım 2: Cloudflare Pages ile Bağlama
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) hesabınıza giriş yapın ve sol menüden **Workers & Pages** -> **Create** -> **Pages** -> **Connect to Git** seçeneğine tıklayın.
2. `eforsuz` GitHub deponuzu seçin.
3. **Build settings (Derleme ayarları)** bölümünü şu şekilde doldurun:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy** butonuna basın. Birkaç saniye içinde siteniz `https://eforsuz.pages.dev` benzeri bir adreste ücretsiz ve otomatik HTTPS ile yayına girecektir.

### Adım 3: Özel Alan Adı (Custom Domain) ve HTTPS
1. Cloudflare Pages projenizin içindeyken **Custom domains** sekmesine tıklayın.
2. **Set up a custom domain** butonuna basıp kendi alan adınızı (ör. `eforsuz.com`) yazın.
3. DNS kayıtları Cloudflare tarafından otomatik eklenir ve ücretsiz SSL/HTTPS sertifikası birkaç dakika içinde aktif olur.
