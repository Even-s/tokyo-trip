/**
 * 開啟日產租車 App (Android Intent) 或 Fallback
 */
export function openNissanRentacarApp(): void {
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const intentUrl = "intent://#Intent;package=com.nissan.rentacar.aprs;end";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.nissan.rentacar.aprs&hl=zh_TW";
  const webUrl = "https://www.nissan-rentacar.com/";

  if (isAndroid) {
    window.location.href = intentUrl;
    const start = Date.now();
    setTimeout(() => {
      // 如果 1.5 秒後頁面仍然可見，代表 App 未成功開啟
      if (document.visibilityState === 'visible' && Date.now() - start < 1500) {
        window.location.href = playStoreUrl;
      }
    }, 1000);
  } else {
    window.open(isIOS ? webUrl : playStoreUrl, '_blank', 'noopener,noreferrer');
  }
}