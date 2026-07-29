/**
 * Mobile-First QR Code Camera Scanner
 * Uses the html5-qrcode library to capture device camera feed, detect QR codes,
 * provide haptic and audio feedback, and immediately redirect to the decoded URL.
 */

document.addEventListener('DOMContentLoaded', () => {
  const successOverlay = document.getElementById('success-overlay');
  const qrDataText = document.getElementById('qr-data-text');
  let html5QrcodeScanner = null;

  // Sound generator helper (beep on success)
  function playSuccessBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.warn("Audio Context beep failed", e);
    }
  }

  // Haptic Feedback helper
  function triggerVibration() {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // double buzz
    }
  }

  // Scan Success Handler
  function onScanSuccess(decodedText, decodedResult) {
    console.log(`Scan matched: ${decodedText}`, decodedResult);
    
    // Stop the scanner immediately to prevent double redirects
    if (html5QrcodeScanner) {
      html5QrcodeScanner.stop().then(() => {
        console.log("Scanner stopped.");
      }).catch(err => {
        console.warn("Failed to stop scanner", err);
      });
    }

    // Play feedback
    playSuccessBeep();
    triggerVibration();

    // Show confirmation UI overlay
    qrDataText.innerText = "Redirecting...";
    successOverlay.classList.add('active');

    // Perform redirect after 1 second
    setTimeout(() => {
      // Validate if scanned text is a valid URL, otherwise treat as text search or fallback
      let targetUrl = decodedText.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        // If not a URL, let's check if it's a relative path in our hall app, otherwise search Google
        if (targetUrl.includes('.html') || targetUrl.startsWith('/')) {
          targetUrl = window.location.origin + (targetUrl.startsWith('/') ? '' : '/') + targetUrl;
        } else {
          targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
        }
      }
      window.location.href = targetUrl;
    }, 1000);
  }

  // Scan Failure Handler (fires continuously while searching for codes)
  function onScanFailure(error) {
    // Keep quiet, as html5-qrcode scans 15 frames per second and logs frequently
  }

  // Initialize and Start Scanner
  function startScanner() {
    // Check if Html5Qrcode is available (from CDN)
    if (typeof Html5Qrcode === 'undefined') {
      setTimeout(startScanner, 100); // retry if CDN script not fully parsed
      return;
    }

    html5QrcodeScanner = new Html5Qrcode("reader");

    // Camera configuration (prefer back camera on mobile)
    const config = { 
      fps: 15, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0 
    };

    // Request permissions and start
    html5QrcodeScanner.start(
      { facingMode: "environment" }, // back camera
      config,
      onScanSuccess,
      onScanFailure
    ).catch(err => {
      console.error("Camera access failed", err);
      
      // Fallback: If environment camera is missing (e.g. desktop), try any available camera
      html5QrcodeScanner.start(
        { facingMode: "user" }, // user/front camera fallback
        config,
        onScanSuccess,
        onScanFailure
      ).catch(fallbackErr => {
        document.getElementById('instruction').innerHTML = 
          `<span style="color: #ef4444; font-weight: 600;">Camera Error</span>` +
          `<div class="instruction-sub">Please enable camera permissions in your browser settings to scan QR codes.</div>`;
      });
    });
  }

  // Start the engine
  startScanner();
});
