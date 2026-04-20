(function () {
  function toast(text) {
    try {
      if (typeof showMsg === 'function') showMsg(text);
    } catch (_) {}
  }

  function ensureUnlocked() {
    try {
      if (typeof unlockTts === 'function') unlockTts();
      else if ('speechSynthesis' in window) window.speechSynthesis.resume();
    } catch (_) {}
  }

  function stopPlayback() {
    try {
      if (typeof stopTtsPlayback === 'function') {
        stopTtsPlayback();
        return;
      }
    } catch (_) {}
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (_) {}
    try {
      if (typeof currentTtsAudio !== 'undefined' && currentTtsAudio) {
        currentTtsAudio.pause();
        currentTtsAudio.currentTime = 0;
        currentTtsAudio = null;
      }
    } catch (_) {}
  }

  function findArabicVoice() {
    try {
      const voices = ('speechSynthesis' in window && window.speechSynthesis.getVoices()) || [];
      if (!voices.length) return null;
      return (
        voices.find(v => /^ar(-|$)/i.test(v.lang || '') && /google|arabic|العربية/i.test(v.name || '')) ||
        voices.find(v => /^ar(-|$)/i.test(v.lang || '')) ||
        voices.find(v => /arabic|العربية/i.test(v.name || '')) ||
        null
      );
    } catch (_) {
      return null;
    }
  }

  function showVoiceHelp() {
    toast('Нет арабского голоса на устройстве');
    setTimeout(function () {
      toast('Установите Arabic TTS в настройках телефона');
    }, 900);
  }

  window.playGoogleTtsFallback = function () {
    showVoiceHelp();
  };

  window.speak = function (text, e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    try {
      if (typeof canUsePremiumFeatures === 'function' && !canUsePremiumFeatures()) {
        if (typeof showActivationPrompt === 'function') showActivationPrompt();
        return;
      }
    } catch (_) {}

    const cleanText = String(text || '').trim();
    if (!cleanText) {
      toast('Нет текста для озвучки');
      return;
    }

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      showVoiceHelp();
      return;
    }

    ensureUnlocked();
    stopPlayback();

    let voice = null;
    try {
      voice = findArabicVoice();
      if (voice && typeof cachedArabicVoice !== 'undefined') cachedArabicVoice = voice;
    } catch (_) {}

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = (voice && voice.lang) ? voice.lang : 'ar-SA';
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    let started = false;
    let finished = false;

    utterance.onstart = function () {
      started = true;
      finished = true;
    };

    utterance.onend = function () {
      finished = true;
    };

    utterance.onerror = function (err) {
      finished = true;
      console.error('Speech synthesis error:', err);
      if (!voice) showVoiceHelp();
      else toast('Системная озвучка недоступна');
    };

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis start error:', err);
      if (!voice) showVoiceHelp();
      else toast('Озвучка не запустилась');
      return;
    }

    setTimeout(function () {
      if (finished) return;
      const speaking = !!window.speechSynthesis.speaking;
      const pending = !!window.speechSynthesis.pending;
      if (started || speaking || pending) return;
      try { window.speechSynthesis.cancel(); } catch (_) {}
      if (!voice) showVoiceHelp();
      else toast('Озвучка не запустилась');
    }, 700);
  };

  document.addEventListener('click', ensureUnlocked, { passive: true });
  document.addEventListener('touchstart', ensureUnlocked, { passive: true });

  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = function () {
        try {
          const voice = findArabicVoice();
          if (voice && typeof cachedArabicVoice !== 'undefined') cachedArabicVoice = voice;
        } catch (_) {}
      };
    }
  } catch (_) {}
})();
