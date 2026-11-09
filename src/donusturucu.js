import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * Tek iş parçacıklı (single-threaded) @ffmpeg/core sürümü.
 * SharedArrayBuffer GEREKTİRMEZ — iOS Safari, Android Chrome ve tüm
 * statik barındırma servislerinde özel HTTP başlığı olmadan çalışır.
 */
const CORE_VERSION = '0.12.6';
const CDN_SOURCES = [
  `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`,
  `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`
];

let ffmpegInstance = null;
let isLoaded = false;
let currentProgressCallback = null;

/**
 * FFmpeg çekirdeğini yalnızca kullanıcı dönüştürmeye başladığında yükler.
 */
async function ensureFFmpegLoaded() {
  if (ffmpegInstance && isLoaded) {
    return ffmpegInstance;
  }

  ffmpegInstance = new FFmpeg();

  ffmpegInstance.on('progress', ({ progress }) => {
    if (typeof currentProgressCallback === 'function') {
      const clamped = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
      currentProgressCallback(Math.round(clamped * 100));
    }
  });

  let lastError = null;
  for (const baseURL of CDN_SOURCES) {
    try {
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      await ffmpegInstance.load({ coreURL, wasmURL });
      isLoaded = true;
      return ffmpegInstance;
    } catch (err) {
      lastError = err;
    }
  }

  ffmpegInstance = null;
  isLoaded = false;
  const error = new Error('ENGINE_LOAD_FAILED');
  error.cause = lastError;
  throw error;
}

/**
 * Video dosyasını seçilen ses formatına dönüştürür.
 * @param {File} file - Kullanıcının seçtiği video dosyası
 * @param {Object} formatOption - src/metinler.js içindeki format nesnesi
 * @param {Object} callbacks - { onEngineLoading, onProgress }
 */
export async function videoyuSeseCevir(file, formatOption, { onEngineLoading, onProgress } = {}) {
  if (!isLoaded && typeof onEngineLoading === 'function') {
    onEngineLoading();
  }

  const ffmpeg = await ensureFFmpegLoaded();
  currentProgressCallback = onProgress;

  const uzantiParcalari = file.name.split('.');
  const kaynakUzanti = uzantiParcalari.length > 1 ? uzantiParcalari.pop().toLowerCase() : 'mp4';
  const girisDosyaAdi = `giris_${Date.now()}.${kaynakUzanti}`;
  const cikisDosyaAdi = `cikis_${Date.now()}.${formatOption.uzanti}`;

  try {
    const dosyaVerisi = await fetchFile(file);
    await ffmpeg.writeFile(girisDosyaAdi, dosyaVerisi);

    let komutArgumanlari = ['-i', girisDosyaAdi, '-vn'];

    if (formatOption.format === 'mp3') {
      komutArgumanlari.push(
        '-acodec', 'libmp3lame',
        '-b:a', formatOption.bitrate || '192k'
      );
    } else if (formatOption.format === 'm4a') {
      komutArgumanlari.push(
        '-c:a', 'aac',
        '-b:a', formatOption.bitrate || '192k'
      );
    } else if (formatOption.format === 'wav') {
      komutArgumanlari.push(
        '-acodec', 'pcm_s16le'
      );
    }

    komutArgumanlari.push(cikisDosyaAdi);

    const cikisKodu = await ffmpeg.exec(komutArgumanlari);
    if (cikisKodu !== 0) {
      throw new Error('CORRUPT_OR_NO_AUDIO');
    }

    const ciktiVerisi = await ffmpeg.readFile(cikisDosyaAdi);
    if (!ciktiVerisi || ciktiVerisi.length === 0) {
      throw new Error('CORRUPT_OR_NO_AUDIO');
    }

    const blob = new Blob([ciktiVerisi.buffer], { type: formatOption.mime });
    return blob;
  } finally {
    currentProgressCallback = null;
    try {
      await ffmpeg.deleteFile(girisDosyaAdi);
    } catch (_) {
      // Yoksay
    }
    try {
      await ffmpeg.deleteFile(cikisDosyaAdi);
    } catch (_) {
      // Yoksay
    }
  }
}

/**
 * Devam eden dönüşüm işlemini anında durdurur ve Web Worker belleğini temizler.
 */
export function donusumuIptalEt() {
  currentProgressCallback = null;
  if (ffmpegInstance) {
    try {
      ffmpegInstance.terminate();
    } catch (_) {
      // Yoksay
    }
    ffmpegInstance = null;
    isLoaded = false;
  }
}
