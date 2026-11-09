import './stil.css';
import { METINLER } from './metinler.js';
import { videoyuSeseCevir, donusumuIptalEt } from './donusturucu.js';

const DESTEKLENEN_UZANTILAR = ['mp4', 'mov', 'webm', 'mkv', 'm4a', 'avi'];
const BUYUK_DOSYA_SINIRI = 500 * 1024 * 1024; // 500 MB

let seciliDosya = null;
let seciliFormat = METINLER.formatlar.find((f) => f.varsayilan) || METINLER.formatlar[0];
let aktifBlobUrl = null;
let islemDevamEdiyor = false;
let kullaniciIptalEtti = false;

/* ==========================================================================
   1. METİNLERİ DOM'A YERLEŞTİRME (Tek Noktadan Yönetim)
   ========================================================================== */
function metinleriYukle() {
  document.title = METINLER.sayfaBasligi;

  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setElText('brand-name', METINLER.siteAdi);
  setElText('hero-title', METINLER.baslik);
  setElText('hero-subtitle', METINLER.altBaslik);

  const lampBtn = document.getElementById('lamp-toggle');
  if (lampBtn) {
    lampBtn.setAttribute('aria-label', METINLER.ampulAciklama);
    lampBtn.setAttribute('title', METINLER.ampulAciklama);
  }

  setElText('dropzone-title', METINLER.dosyaSecBaslik);
  setElText('dropzone-hint', METINLER.dosyaSecIpucu);
  setElText('dropzone-formats', METINLER.desteklenenFormatlar);
  setElText('change-file-btn', METINLER.dosyaDegistir);
  setElText('quality-label', METINLER.ciktiAyarlariBaslik);
  setElText('cancel-btn', METINLER.iptalButonu);
  setElText('download-btn-text', METINLER.indirButonu);
  setElText('ios-fallback-link', METINLER.yenisekmeYardim);
  setElText('reset-btn', METINLER.yeniDosyaButonu);
  setElText('privacy-note', METINLER.gizlilikNotu);
  setElText('copyright-note', METINLER.telifUyarisi);
  setElText('theme-switcher-label', METINLER.temaSeciciEtiket);

  cevirButonMetniniGuncelle();
}

function cevirButonMetniniGuncelle() {
  const btn = document.getElementById('convert-btn');
  if (!btn) return;
  if (seciliFormat.format === 'mp3') {
    btn.textContent = METINLER.cevirButonu;
  } else {
    btn.textContent = `${seciliFormat.uzanti.toUpperCase()} Formatına Çevir`;
  }
}

/* ==========================================================================
   2. AÇIK / KOYU MOD (SAĞ ÜST AMPUL) VE EDİTORYAL TEMA YÖNETİMİ
   ========================================================================== */
function temaBaslat() {
  const kayitliTema = localStorage.getItem('eforsuz_theme');
  const sistemKoyuMu = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const baslangicTema = kayitliTema || (sistemKoyuMu ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', baslangicTema);

  // Sistem teması değişirse ve kullanıcı elle kalıcı seçim yapmadıysa uyum sağla
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('eforsuz_theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  const lampBtn = document.getElementById('lamp-toggle');
  if (lampBtn) {
    lampBtn.addEventListener('click', () => {
      // Kordon çekilme animasyonu (3-5px aşağı inip yumuşakça yukarı çıkma)
      lampBtn.classList.add('is-pulled');
      setTimeout(() => {
        lampBtn.classList.remove('is-pulled');
      }, 220);

      const mevcut = document.documentElement.getAttribute('data-theme');
      const yeni = mevcut === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', yeni);
      localStorage.setItem('eforsuz_theme', yeni);
    });
  }

  // Editoryal Minimalizm Yön Seçici (STUDIO NOVA / LINEA DESIGN / MONOQ)
  const kayitliStil = localStorage.getItem('eforsuz_style') || 'studio-nova';
  document.documentElement.setAttribute('data-style', kayitliStil);

  const stilButonlari = document.querySelectorAll('.style-pill');
  stilButonlari.forEach((btn) => {
    if (btn.dataset.style === kayitliStil) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }

    btn.addEventListener('click', () => {
      const secilenStil = btn.dataset.style;
      document.documentElement.setAttribute('data-style', secilenStil);
      localStorage.setItem('eforsuz_style', secilenStil);
      stilButonlari.forEach((b) => b.classList.toggle('is-active', b === btn));
    });
  });
}

/* ==========================================================================
   3. KALİTE VE FORMAT SEÇENEKLERİNİ OLUŞTURMA
   ========================================================================== */
function kaliteSecenekleriniOlustur() {
  const container = document.getElementById('quality-grid');
  if (!container) return;
  container.innerHTML = '';

  METINLER.formatlar.forEach((fmt) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `quality-option ${fmt.id === seciliFormat.id ? 'is-active' : ''}`;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', fmt.id === seciliFormat.id ? 'true' : 'false');

    const titleSpan = document.createElement('span');
    titleSpan.className = 'quality-title';
    titleSpan.textContent = fmt.etiket;

    const descSpan = document.createElement('span');
    descSpan.className = 'quality-desc';
    descSpan.textContent = fmt.aciklama;

    btn.appendChild(titleSpan);
    btn.appendChild(descSpan);

    btn.addEventListener('click', () => {
      if (islemDevamEdiyor) return;
      seciliFormat = fmt;
      container.querySelectorAll('.quality-option').forEach((el) => {
        el.classList.remove('is-active');
        el.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-checked', 'true');
      cevirButonMetniniGuncelle();
    });

    container.appendChild(btn);
  });
}

/* ==========================================================================
   4. DOSYA SEÇİMİ VE SÜRÜKLE-BIRAK YÖNETİMİ
   ========================================================================== */
function boyutFormatla(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function dosyaGecerliMi(file) {
  if (!file) return false;
  const parcalar = file.name.split('.');
  const uzanti = parcalar.length > 1 ? parcalar.pop().toLowerCase() : '';
  if (DESTEKLENEN_UZANTILAR.includes(uzanti)) {
    return true;
  }
  if (file.type && (file.type.startsWith('video/') || file.type === 'audio/mp4' || file.type === 'audio/x-m4a')) {
    return true;
  }
  return false;
}

function hataGoster(mesaj) {
  const errBox = document.getElementById('error-banner');
  if (!errBox) return;
  if (!mesaj) {
    errBox.textContent = '';
    errBox.classList.add('hidden');
  } else {
    errBox.textContent = mesaj;
    errBox.classList.remove('hidden');
  }
}

function dosyaSecildi(file) {
  if (!file || islemDevamEdiyor) return;

  hataGoster(null);
  sonucKartiniGizle();

  if (!dosyaGecerliMi(file)) {
    hataGoster(METINLER.hatalar.desteklenmeyenFormat);
    return;
  }

  seciliDosya = file;

  // Seçilen dosya kartını göster
  document.getElementById('dropzone').classList.add('hidden');
  const fileCard = document.getElementById('selected-file-card');
  fileCard.classList.remove('hidden');

  document.getElementById('selected-file-name').textContent = file.name;
  document.getElementById('selected-file-size').textContent = boyutFormatla(file.size);

  // 500 MB üzeri nazik bellek uyarısı
  const warnBox = document.getElementById('large-file-warning');
  if (file.size > BUYUK_DOSYA_SINIRI) {
    warnBox.textContent = METINLER.buyukDosyaUyarisi;
    warnBox.classList.remove('hidden');
  } else {
    warnBox.classList.add('hidden');
  }

  document.getElementById('convert-btn').disabled = false;
}

function dosyaSeciciyiSifirla() {
  seciliDosya = null;
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';

  document.getElementById('selected-file-card').classList.add('hidden');
  document.getElementById('large-file-warning').classList.add('hidden');
  document.getElementById('dropzone').classList.remove('hidden');
  document.getElementById('convert-btn').disabled = true;
  document.getElementById('convert-btn').classList.remove('hidden');

  hataGoster(null);
  sonucKartiniGizle();
}

function sonucKartiniGizle() {
  const resultCard = document.getElementById('result-card');
  resultCard.classList.add('hidden');
  const audioPreview = document.getElementById('audio-preview');
  if (audioPreview) {
    audioPreview.pause();
    audioPreview.removeAttribute('src');
  }
  if (aktifBlobUrl) {
    URL.revokeObjectURL(aktifBlobUrl);
    aktifBlobUrl = null;
  }
}

/* ==========================================================================
   5. DÖNÜŞTÜRME AKIŞI, İLERLEME VE iOS UYUMLU İNDİRME
   ========================================================================== */
function ciktiDosyaAdiOlustur(orijinalAd, hedefUzanti) {
  const noktaIndeksi = orijinalAd.lastIndexOf('.');
  const tabanAd = noktaIndeksi > 0 ? orijinalAd.substring(0, noktaIndeksi) : orijinalAd;
  return `${tabanAd}.${hedefUzanti}`;
}

async function donusumuBaslat() {
  if (!seciliDosya || islemDevamEdiyor) return;

  islemDevamEdiyor = true;
  kullaniciIptalEtti = false;
  hataGoster(null);
  sonucKartiniGizle();

  const convertBtn = document.getElementById('convert-btn');
  const changeFileBtn = document.getElementById('change-file-btn');
  const progressCard = document.getElementById('progress-card');
  const progressStatus = document.getElementById('progress-status');
  const progressPercent = document.getElementById('progress-percent');
  const progressFill = document.getElementById('progress-fill');

  convertBtn.classList.add('hidden');
  changeFileBtn.disabled = true;
  progressCard.classList.remove('hidden');

  progressStatus.textContent = METINLER.donusturuluyor;
  progressPercent.textContent = '%0';
  progressFill.style.width = '0%';

  try {
    const sesBlob = await videoyuSeseCevir(seciliDosya, seciliFormat, {
      onEngineLoading: () => {
        progressStatus.textContent = METINLER.motorYukleniyor;
      },
      onProgress: (yuzde) => {
        progressStatus.textContent = METINLER.donusturuluyor;
        progressPercent.textContent = `%${yuzde}`;
        progressFill.style.width = `${yuzde}%`;
      }
    });

    if (kullaniciIptalEtti) return;

    progressFill.style.width = '100%';
    progressPercent.textContent = '%100';
    progressCard.classList.add('hidden');

    aktifBlobUrl = URL.createObjectURL(sesBlob);
    const yeniDosyaAdi = ciktiDosyaAdiOlustur(seciliDosya.name, seciliFormat.uzanti);

    // İndirme kartını doldur ve göster
    const resultCard = document.getElementById('result-card');
    document.getElementById('result-badge').textContent = METINLER.tamamlandi;
    document.getElementById('result-filename').textContent = `${yeniDosyaAdi} (${boyutFormatla(sesBlob.size)})`;

    const downloadLink = document.getElementById('download-link');
    downloadLink.href = aktifBlobUrl;
    downloadLink.download = yeniDosyaAdi;

    const fallbackLink = document.getElementById('ios-fallback-link');
    fallbackLink.href = aktifBlobUrl;

    const audioPreview = document.getElementById('audio-preview');
    audioPreview.src = aktifBlobUrl;

    resultCard.classList.remove('hidden');
  } catch (err) {
    progressCard.classList.add('hidden');
    convertBtn.classList.remove('hidden');

    if (kullaniciIptalEtti) {
      hataGoster(METINLER.iptalEdildi);
      return;
    }

    const hataMesaji = String(err?.message || err || '');
    if (hataMesaji.includes('ENGINE_LOAD_FAILED')) {
      hataGoster(METINLER.hatalar.motorYuklemeHatasi);
    } else if (
      err instanceof RangeError ||
      hataMesaji.toLowerCase().includes('memory') ||
      hataMesaji.toLowerCase().includes('oom') ||
      hataMesaji.toLowerCase().includes('allocation')
    ) {
      hataGoster(METINLER.hatalar.bellekYetersiz);
    } else if (hataMesaji.includes('CORRUPT_OR_NO_AUDIO')) {
      hataGoster(METINLER.hatalar.bozukDosya);
    } else {
      hataGoster(METINLER.hatalar.genelHata);
    }
  } finally {
    islemDevamEdiyor = false;
    changeFileBtn.disabled = false;
  }
}

/* ==========================================================================
   6. OLAY DİNLEYİCİLERİ VE PWA SERVICE WORKER KAYDI
   ========================================================================== */
function olaylariBagla() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const changeFileBtn = document.getElementById('change-file-btn');
  const convertBtn = document.getElementById('convert-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Dosya seçiciyi açma (dokunma veya tıklama)
  dropzone.addEventListener('click', () => {
    if (!islemDevamEdiyor) fileInput.click();
  });

  dropzone.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !islemDevamEdiyor) {
      e.preventDefault();
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) dosyaSecildi(file);
  });

  // Masaüstü Sürükle-Bırak
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!islemDevamEdiyor) dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    if (islemDevamEdiyor) return;
    const file = e.dataTransfer?.files?.[0];
    if (file) dosyaSecildi(file);
  });

  changeFileBtn.addEventListener('click', () => {
    if (!islemDevamEdiyor) {
      dosyaSeciciyiSifirla();
      fileInput.click();
    }
  });

  convertBtn.addEventListener('click', donusumuBaslat);

  cancelBtn.addEventListener('click', () => {
    if (!islemDevamEdiyor) return;
    kullaniciIptalEtti = true;
    donusumuIptalEt();
    islemDevamEdiyor = false;
    document.getElementById('progress-card').classList.add('hidden');
    document.getElementById('convert-btn').classList.remove('hidden');
    document.getElementById('change-file-btn').disabled = false;
    hataGoster(METINLER.iptalEdildi);
  });

  resetBtn.addEventListener('click', dosyaSeciciyiSifirla);
}

function pwaKaydet() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Geliştirme ortamında sessizce geç
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  metinleriYukle();
  temaBaslat();
  kaliteSecenekleriniOlustur();
  olaylariBagla();
  pwaKaydet();
});
