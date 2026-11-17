// ==============================================================================
// Z-EXAM BROWSER & IN-APP WEBVIEW DETECTION UTILITIES
// Specifically optimized for Instagram, Facebook, and Mobile In-App Browsers
// ==============================================================================

/**
 * Checks if the current browser session is running inside Meta's In-App Browser (Instagram, Facebook)
 */
export const isMetaInAppBrowser = () => {
  if (typeof window === 'undefined' || !navigator || !navigator.userAgent) {
    return false;
  }
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  return /FBAN|FBAV|Instagram|FB_IAB|FB4A|FBSS/i.test(ua);
};

/**
 * Checks if the user is on an Android device
 */
export const isAndroid = () => {
  if (typeof window === 'undefined' || !navigator || !navigator.userAgent) {
    return false;
  }
  return /Android/i.test(navigator.userAgent);
};

/**
 * Checks if the user is on an iOS device (iPhone, iPad, iPod)
 */
export const isIOS = () => {
  if (typeof window === 'undefined' || !navigator || !navigator.userAgent) {
    return false;
  }
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * Launches Google Chrome directly on Android from inside Instagram / Facebook
 * bypassing Meta's download-blocking sandbox completely
 */
export const openInAndroidChrome = (targetUrl) => {
  const urlToOpen = targetUrl || window.location.href;
  try {
    const cleanUrl = urlToOpen.replace(/^https?:\/\//i, '');
    const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
  } catch (err) {
    window.open(urlToOpen, '_blank');
  }
};
