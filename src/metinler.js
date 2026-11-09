/**
 * Site üzerindeki tüm metinler, marka adı, hata mesajları ve ayarlar
 * buradan tek bir noktadan yönetilir.
 */
export const METINLER = {
  // Marka & Başlık (Adı buradan değiştirdiğinizde tüm sitede güncellenir)
  siteAdi: "Eforsuz",
  sayfaBasligi: "Eforsuz — Videodan sese, eforsuz.",
  baslik: "Videodan sese, eforsuz.",
  altBaslik: "Dosyan cihazından çıkmaz. Dönüşüm tarayıcında yapılır.",

  // Tema / Ampul
  ampulAciklama: "Açık / Koyu görünümü değiştir",
  temaSeciciEtiket: "Görsel Stil:",

  // Dosya Seçim Alanı
  dosyaSecBaslik: "Video Dosyası Seç",
  dosyaSecIpucu: "Buraya sürükleyip bırak veya dokunarak seç",
  desteklenenFormatlar: "MP4, MOV, WEBM, MKV, M4A, AVI",
  dosyaDegistir: "Farklı dosya seç",
  buyukDosyaUyarisi: "Seçtiğin dosya 500 MB üzerinde. Mobil cihazlarda tarayıcı belleği yetmeyebilir, ancak yine de denemeye hazırız.",

  // Kalite ve Format Seçenekleri
  ciktiAyarlariBaslik: "Çıktı Kalitesi ve Formatı",
  formatlar: [
    { id: "mp3-128", etiket: "MP3 · 128 kbps", aciklama: "Küçük boyut", format: "mp3", bitrate: "128k", uzanti: "mp3", mime: "audio/mpeg" },
    { id: "mp3-192", etiket: "MP3 · 192 kbps", aciklama: "Önerilen standart", format: "mp3", bitrate: "192k", uzanti: "mp3", mime: "audio/mpeg", varsayilan: true },
    { id: "mp3-320", etiket: "MP3 · 320 kbps", aciklama: "Yüksek kalite", format: "mp3", bitrate: "320k", uzanti: "mp3", mime: "audio/mpeg" },
    { id: "m4a-aac", etiket: "M4A · AAC", aciklama: "Apple uyumlu", format: "m4a", bitrate: "192k", uzanti: "m4a", mime: "audio/mp4" },
    { id: "wav-pcm", etiket: "WAV · Kayıpsız", aciklama: "Sıkıştırmasız", format: "wav", bitrate: null, uzanti: "wav", mime: "audio/wav" }
  ],

  // Aksiyon Butonları
  cevirButonu: "MP3'e Çevir",
  cevirButonuGenel: "Sese Çevir",
  iptalButonu: "İptal Et",
  indirButonu: "Ses Dosyasını İndir",
  yenisekmeYardim: "İndirme başlamadıysa yeni sekmede aç",
  yeniDosyaButonu: "Yeni Bir Video Çevir",

  // Durum ve İlerleme Mesajları
  motorYukleniyor: "Ses motoru hazırlanıyor (ilk seferde birkaç saniye sürer)...",
  donusturuluyor: "Dönüştürülüyor...",
  tamamlandi: "Dönüşüm tamamlandı! Dosyan indirmeye hazır.",
  iptalEdildi: "Dönüşüm işlemi iptal edildi.",

  // Hata Mesajları
  hatalar: {
    desteklenmeyenFormat: "Bu dosya türü desteklenmiyor. Lütfen MP4, MOV, WEBM, MKV, M4A veya AVI uzantılı bir dosya seç.",
    bellekYetersiz: "Cihazın tarayıcı belleği bu dosya için yetersiz kaldı. Lütfen daha küçük boyutlu bir video dene veya açık diğer sekmeleri kapat.",
    bozukDosya: "Dosya okunamadı, ses kanalı içermiyor veya bozuk olabilir. Lütfen başka bir video dosyası dene.",
    motorYuklemeHatasi: "Dönüştürme motoru yüklenemedi. İnternet bağlantını kontrol edip sayfayı yenile.",
    genelHata: "Dönüşüm sırasında beklenmeyen bir sorun oluştu. Lütfen tekrar dene."
  },

  // Alt Bilgi (Footer)
  gizlilikNotu: "Gizlilik garantisi: Seçtiğin videolar hiçbir sunucuya yüklenmez, tüm işlem kendi cihazının işlemcisiyle tarayıcı içinde gerçekleşir.",
  telifUyarisi: "Yalnızca kendi içeriğini veya dönüştürme hakkın olan dosyaları kullan."
};
