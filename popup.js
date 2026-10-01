/**
 * Lucky Horseshoe - Popup Logic & Interactive Experience
 * Implements Manifest V3 compliant audio synthesis, particle physics,
 * 7-day free trial system, ExtensionPay integration, and Pro VIP perks.
 */

// --- 1. Storage Wrapper (handles chrome.storage with fallback to localStorage) ---
const Storage = {
  get: (keys) => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(keys, resolve);
      } else {
        const result = {};
        keys.forEach((k) => {
          const val = localStorage.getItem('horseshoe_' + k);
          try {
            result[k] = val ? JSON.parse(val) : undefined;
          } catch {
            result[k] = val;
          }
        });
        resolve(result);
      }
    });
  },
  set: (data) => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set(data, resolve);
      } else {
        Object.keys(data).forEach((k) => {
          localStorage.setItem('horseshoe_' + k, JSON.stringify(data[k]));
        });
        resolve();
      }
    });
  }
};

// --- 2. Curated Fortunes & Lucky Matrix (Free & Pro VIP) ---
const FREE_FORTUNES = [
  "Golden opportunities arrive in quiet moments today. Keep your senses open.",
  "Your energy attracts favorable outcomes. What you seek is seeking you.",
  "An unexpected serendipitous encounter will turn things in your favor.",
  "The winds of fortune blow your way. Trust your instinctive first choice.",
  "A seed planted in the past is ready to bloom with extraordinary luck.",
  "Serendipity surrounds you: small efforts yield outsized rewards today.",
  "Confidence is your lucky charm today. Bold moves lead to victory.",
  "Positive forces are aligning behind the scenes to clear your path.",
  "Good news travels quickly toward you before the sun sets.",
  "You hold the winning mindset. Harmony, wealth, and clarity guide you.",
  "An old dilemma dissolves easily as luck shifts the balance in your favor.",
  "The horseshoe holds your luck high. Today shines bright with potential."
];

const PRO_VIP_FORTUNES = [
  "👑 VIP Wealth Oracle: Unexpected monetary abundance aligns with your intentions today. Prepare to receive.",
  "👑 VIP Manifestation: A high-value opportunity will pivot decisively in your favor before day's end.",
  "👑 VIP Serendipity: Your aura is at peak magnetic resonance. Pitch your boldest ideas and claim victory.",
  "👑 VIP Abundance: Financial roadblocks dissolve today. Strategic risks taken now multiply your fortune.",
  "👑 VIP Destiny: The universe clears all obstacles on your path. A golden door opens where a wall stood.",
  "👑 VIP Prosperity: A rare stroke of luck enters your work today. Trust your timing—it is impeccable."
];

const LUCKY_COLORS = [
  "Solar Gold",
  "Imperial Emerald",
  "Celestial Blue",
  "Luminous Amber",
  "Mystic Jade",
  "Radiant Topaz",
  "Royal Amethyst"
];

const LUCKY_HOURS = [
  "9:09 AM",
  "11:11 AM",
  "1:33 PM",
  "2:22 PM",
  "3:45 PM",
  "5:55 PM",
  "7:07 PM",
  "8:18 PM"
];

const PRO_DIRECTIONS = [
  "North-East ↗️ (Wealth)",
  "East ➡️ (Clarity)",
  "South-East ↘️ (Abundance)",
  "North ⬆️ (Victory)",
  "South ⬇️ (Passion)"
];

const PRO_ELEMENTS = [
  "Solar Fire 🔥",
  "Golden Ether 🌟",
  "Celestial Wind 🌪️",
  "Deep Water 🌊",
  "Cosmic Earth 🌍"
];

const PRO_CRYSTALS = [
  "Citrine (Wealth)",
  "Pyrite (Gold)",
  "Emerald (Luck)",
  "Amethyst (Peace)",
  "Clear Quartz (Power)"
];

// Helper: format today's date YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Pseudo-random deterministic hash from date string
function getDeterministicDailyData(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  return {
    freeFortune: FREE_FORTUNES[absHash % FREE_FORTUNES.length],
    proFortune: PRO_VIP_FORTUNES[absHash % PRO_VIP_FORTUNES.length],
    color: LUCKY_COLORS[(absHash >> 2) % LUCKY_COLORS.length],
    hour: LUCKY_HOURS[(absHash >> 4) % LUCKY_HOURS.length],
    number: (absHash % 77) + 1,
    direction: PRO_DIRECTIONS[(absHash >> 3) % PRO_DIRECTIONS.length],
    element: PRO_ELEMENTS[(absHash >> 5) % PRO_ELEMENTS.length],
    crystal: PRO_CRYSTALS[(absHash >> 1) % PRO_CRYSTALS.length]
  };
}

// --- 3. Synthesized Web Audio Chimes ---
class SoundManager {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCelestialChime(isPro = false) {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Pro VIP has a rich 6-note golden harp chord
      const freqs = isPro 
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98] // C Major 7th golden octave
        : [659.25, 830.61, 987.77, 1318.51, 1661.22];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = isPro ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        const startTime = now + idx * 0.07;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.28 / (idx + 1), startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (isPro ? 1.6 : 1.2));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.7);
      });
    } catch (e) {
      // Audio fallback
    }
  }

  playTapSparkle() {
    if (!this.enabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1174.66, now);
      osc.frequency.exponentialRampToValueAtTime(2349.32, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      // Audio fallback
    }
  }
}

// --- 4. High-Performance Particle Canvas Engine ---
class ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.offsetWidth || 360;
    this.canvas.height = this.canvas.offsetHeight || 560;
  }

  burst(x, y, count = 45, isPro = false) {
    const goldPalette = isPro 
      ? ['#FEF08A', '#FCD34D', '#F59E0B', '#34D399', '#10B981', '#6EE7B7', '#FFFFFF']
      : ['#FEF08A', '#FCD34D', '#F59E0B', '#34D399', '#FFFFFF', '#10B981'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (isPro ? 3 : 2) + Math.random() * (isPro ? 8 : 6.5);
      const size = 2 + Math.random() * (isPro ? 5.5 : 4.5);
      const color = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      const isStar = Math.random() > 0.45;

      this.particles.push({
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height * 0.32,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        gravity: 0.12,
        size,
        color,
        isStar,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.018,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.15
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.tick();
    }
  }

  tick() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      if (p.isStar) {
        const r = p.size * 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -r);
        this.ctx.quadraticCurveTo(0, 0, r, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, r);
        this.ctx.quadraticCurveTo(0, 0, -r, 0);
        this.ctx.quadraticCurveTo(0, 0, 0, -r);
        this.ctx.fill();
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.tick());
    } else {
      this.animating = false;
    }
  }
}

// --- 5. Application State & Controller ---
class LuckyHorseshoeApp {
  constructor() {
    this.sound = new SoundManager();
    this.particles = new ParticleEngine(document.getElementById('particleCanvas'));
    
    // UI elements
    this.horseshoeBtn = document.getElementById('horseshoeBtn');
    this.pedestalGlow = document.getElementById('pedestalGlow');
    this.statusHeading = document.getElementById('statusHeading');
    this.statusSubtext = document.getElementById('statusSubtext');
    this.auraFill = document.getElementById('auraFill');
    this.auraPercent = document.getElementById('auraPercent');
    this.fortuneCard = document.getElementById('fortuneCard');
    this.fortuneBadge = document.getElementById('fortuneBadge');
    this.fortuneText = document.getElementById('fortuneText');
    this.fortuneDate = document.getElementById('fortuneDate');
    this.tokenNumber = document.getElementById('tokenNumber');
    this.tokenHour = document.getElementById('tokenHour');
    this.tokenColor = document.getElementById('tokenColor');
    this.tokenDirection = document.getElementById('tokenDirection');
    this.tokenElement = document.getElementById('tokenElement');
    this.tokenCrystal = document.getElementById('tokenCrystal');
    this.proTokensWrap = document.getElementById('proTokensWrap');
    this.proLockOverlay = document.getElementById('proLockOverlay');
    this.proUnlockTag = document.getElementById('proUnlockTag');
    this.activateBtn = document.getElementById('activateBtn');
    this.btnLabel = document.getElementById('btnLabel');
    this.shareBtn = document.getElementById('shareBtn');
    this.streakCount = document.getElementById('streakCount');
    this.soundToggle = document.getElementById('soundToggle');
    this.soundOnIcon = document.getElementById('soundOnIcon');
    this.soundOffIcon = document.getElementById('soundOffIcon');
    this.toast = document.getElementById('toast');
    this.trialPill = document.getElementById('trialPill');
    this.trialDaysText = document.getElementById('trialDaysText');
    this.proBtn = document.getElementById('proBtn');
    this.proLabel = document.getElementById('proLabel');
    this.paywallModal = document.getElementById('paywallModal');
    this.paywallUpgradeBtn = document.getElementById('paywallUpgradeBtn');
    this.paywallLoginBtn = document.getElementById('paywallLoginBtn');

    // ExtensionPay instance
    this.extpay = typeof ExtPay !== 'undefined' ? ExtPay('lucky-horseshoe') : null;
    this.isProUser = false;
    this.isTrialExpired = false;
    this.daysRemaining = 7;

    this.isActivatedToday = false;
    this.todayStr = getTodayString();
    this.dailyData = getDeterministicDailyData(this.todayStr);

    this.init();
  }

  async init() {
    this.attachEvents();
    await this.loadTrialAndState();
    await this.checkProStatus();
    this.renderInitialUI();
  }

  attachEvents() {
    // Pro button
    if (this.proBtn) {
      this.proBtn.addEventListener('click', () => this.handleProClick());
    }

    // Unlock tag on pro tokens lock
    if (this.proUnlockTag) {
      this.proUnlockTag.addEventListener('click', () => this.handleProClick());
    }

    // Paywall buttons
    if (this.paywallUpgradeBtn) {
      this.paywallUpgradeBtn.addEventListener('click', () => this.handleProClick());
    }
    if (this.paywallLoginBtn) {
      this.paywallLoginBtn.addEventListener('click', () => {
        if (this.extpay) this.extpay.openLoginPage();
      });
    }

    // Horseshoe click
    this.horseshoeBtn.addEventListener('click', (e) => this.handleActivation(e));
    this.horseshoeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleActivation();
      }
    });

    // Main action button click
    this.activateBtn.addEventListener('click', (e) => this.handleActivation(e));

    // Sound toggle
    this.soundToggle.addEventListener('click', () => this.toggleSound());

    // Share button
    this.shareBtn.addEventListener('click', () => this.shareFortune());
  }

  async loadTrialAndState() {
    const data = await Storage.get(['installTimestamp', 'lastActivatedDate', 'streakCount', 'soundEnabled']);
    
    // 7-day trial calculation
    let installTime = data.installTimestamp;
    if (!installTime) {
      installTime = Date.now();
      await Storage.set({ installTimestamp: installTime });
    }

    const elapsedDays = Math.floor((Date.now() - installTime) / (1000 * 60 * 60 * 24));
    this.daysRemaining = Math.max(0, 7 - elapsedDays);
    this.isTrialExpired = this.daysRemaining <= 0;

    // Sound preference
    if (data.soundEnabled !== undefined) {
      this.sound.enabled = data.soundEnabled;
    }
    this.updateSoundIcons();

    // Streak and daily activation
    const lastDate = data.lastActivatedDate;
    let streak = data.streakCount || 0;

    if (lastDate === this.todayStr) {
      this.isActivatedToday = true;
    } else {
      this.isActivatedToday = false;
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];
        if (lastDate !== yestStr) {
          streak = 0;
        }
      } else {
        streak = 0;
      }
    }

    this.streak = streak;
    this.streakCount.textContent = streak > 0 ? streak : 1;
  }

  async checkProStatus() {
    if (!this.extpay) return;
    try {
      const user = await this.extpay.getUser();
      if (user && user.paid) {
        this.isProUser = true;
        this.isTrialExpired = false; // Pro users never expire
      }
    } catch (e) {
      // ExtPay offline or network notice
    }
  }

  renderInitialUI() {
    // Human readable date
    const d = new Date();
    const options = { month: 'short', day: 'numeric', weekday: 'short' };
    this.fortuneDate.textContent = d.toLocaleDateString(undefined, options);

    // Update Pro UI
    if (this.isProUser) {
      this.proBtn.classList.add('is-pro');
      this.proLabel.textContent = 'PRO VIP';
      this.trialPill.style.display = 'none'; // Pro users don't need trial pill
      this.horseshoeBtn.classList.add('is-pro-active');
      this.fortuneBadge.classList.add('pro-mode');
      this.fortuneBadge.textContent = '👑 VIP BLESSING';

      // Unlock Pro tokens
      this.proTokensWrap.classList.remove('is-locked');
      this.proLockOverlay.classList.add('hidden');
      this.paywallModal.classList.add('hidden');
    } else {
      // Free User
      if (this.isTrialExpired) {
        // 7-day trial ended! Show paywall modal
        this.trialDaysText.textContent = 'Trial Expired';
        this.trialPill.classList.add('is-expired');
        this.paywallModal.classList.remove('hidden');
      } else {
        this.trialDaysText.textContent = `${this.daysRemaining}d Trial`;
        this.trialPill.classList.remove('is-expired');
        this.paywallModal.classList.add('hidden');
      }

      // Lock Pro tokens
      this.proTokensWrap.classList.add('is-locked');
      this.proLockOverlay.classList.remove('hidden');
      this.fortuneBadge.textContent = 'DAILY BLESSING';
    }

    if (this.isActivatedToday) {
      this.applyActivatedVisuals();
    } else {
      this.applyIdleVisuals();
    }
  }

  applyIdleVisuals() {
    this.horseshoeBtn.classList.remove('is-active');
    this.statusHeading.textContent = "TAP TO RECEIVE LUCK";
    this.statusSubtext.textContent = this.isProUser 
      ? "👑 Eternal VIP talisman ready to bless your day"
      : "Ancient talisman waiting to bless your day";
    this.auraFill.style.width = '0%';
    this.auraPercent.textContent = '0%';
    this.btnLabel.textContent = "ACTIVATE TODAY'S LUCK";
    this.activateBtn.classList.remove('active-mode');
    this.shareBtn.classList.add('hidden');

    this.tokenNumber.textContent = '--';
    this.tokenHour.textContent = '--:--';
    this.tokenColor.textContent = '--';
    this.tokenDirection.textContent = '--';
    this.tokenElement.textContent = '--';
    this.tokenCrystal.textContent = '--';
    this.fortuneText.textContent = "Tap the golden horseshoe above to unlock your daily oracle and lucky tokens.";
  }

  applyActivatedVisuals() {
    this.horseshoeBtn.classList.add('is-active');
    if (this.isProUser) {
      this.horseshoeBtn.classList.add('is-pro-active');
    }

    this.statusHeading.textContent = this.isProUser 
      ? "👑 VIP LUCKY AURA ACTIVE 👑" 
      : "✨ LUCKY DAY ACTIVE ✨";
    this.statusSubtext.textContent = this.isProUser
      ? "Unlimited lucky resonance enabled. All fortunes align."
      : "Aura is charged. Serendipity is on your side.";
    
    // Animate aura fill
    this.auraFill.style.width = '100%';
    this.auraPercent.textContent = '100%';
    
    // Set fortune (VIP gets deep wealth/manifestation prophecy)
    this.fortuneText.textContent = `“${this.isProUser ? this.dailyData.proFortune : this.dailyData.freeFortune}”`;
    
    // Standard tokens
    this.tokenNumber.textContent = this.dailyData.number;
    this.tokenHour.textContent = this.dailyData.hour;
    this.tokenColor.textContent = this.dailyData.color;

    // Pro tokens
    this.tokenDirection.textContent = this.dailyData.direction;
    this.tokenElement.textContent = this.dailyData.element;
    this.tokenCrystal.textContent = this.dailyData.crystal;

    // Buttons
    this.btnLabel.textContent = "RECHARGE AURA";
    this.activateBtn.classList.add('active-mode');
    this.shareBtn.classList.remove('hidden');

    this.streakCount.textContent = Math.max(1, this.streak);
  }

  async handleActivation(event) {
    // If trial is expired and user is not Pro, block and show paywall!
    if (this.isTrialExpired && !this.isProUser) {
      this.paywallModal.classList.remove('hidden');
      return;
    }

    // Coordinates for particle burst
    let burstX, burstY;
    if (event && event.clientX && event.clientY) {
      const rect = this.particles.canvas.getBoundingClientRect();
      burstX = event.clientX - rect.left;
      burstY = event.clientY - rect.top;
    }

    if (!this.isActivatedToday) {
      // First activation of the day!
      this.isActivatedToday = true;
      this.streak = (this.streak || 0) + 1;

      await Storage.set({
        lastActivatedDate: this.todayStr,
        streakCount: this.streak
      });

      this.sound.playCelestialChime(this.isProUser);
      this.particles.burst(burstX, burstY, this.isProUser ? 85 : 60, this.isProUser);
      this.applyActivatedVisuals();
      this.showToast(this.isProUser ? "👑 VIP Golden Luck Activated!" : "Lucky Day Activated! 🍀");
    } else {
      // Re-energize check:
      // Free users get gentle tap or upgrade prompt; Pro users get unlimited full bursts!
      if (!this.isProUser) {
        this.sound.playTapSparkle();
        this.particles.burst(burstX, burstY, 25, false);
        this.horseshoeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => { this.horseshoeBtn.style.transform = ''; }, 200);
        this.showToast("👑 Upgrade to Pro for unlimited recharges & VIP tokens!");
      } else {
        // Pro User: UNLIMITED FULL RECHARGE BURST!
        this.sound.playCelestialChime(true);
        this.particles.burst(burstX, burstY, 60, true);
        this.horseshoeBtn.style.transform = 'scale(1.15)';
        setTimeout(() => { this.horseshoeBtn.style.transform = ''; }, 200);
        this.showToast("👑 VIP Aura Re-energized to Maximum! ✨");
      }
    }
  }

  handleProClick() {
    if (this.isProUser) {
      this.showToast("You have Lifetime VIP Pro Luck! 👑");
      return;
    }
    if (this.extpay) {
      this.extpay.openPaymentPage();
    } else {
      this.showToast("ExtensionPay ready (lucky-horseshoe) ✨");
    }
  }

  toggleSound() {
    this.sound.enabled = !this.sound.enabled;
    Storage.set({ soundEnabled: this.sound.enabled });
    this.updateSoundIcons();
    this.showToast(this.sound.enabled ? "Sound On 🔔" : "Sound Muted 🔕");
  }

  updateSoundIcons() {
    if (this.sound.enabled) {
      this.soundOnIcon.classList.remove('hidden');
      this.soundOffIcon.classList.add('hidden');
    } else {
      this.soundOnIcon.classList.add('hidden');
      this.soundOffIcon.classList.remove('hidden');
    }
  }

  shareFortune() {
    const text = `🍀 My Lucky Horseshoe Blessing for Today:\n` +
      `“${this.isProUser ? this.dailyData.proFortune : this.dailyData.freeFortune}”\n` +
      `🔢 Lucky Number: ${this.dailyData.number}\n` +
      `⏰ Golden Hour: ${this.dailyData.hour}\n` +
      `🎨 Lucky Color: ${this.dailyData.color}\n` +
      (this.isProUser ? `🧭 Direction: ${this.dailyData.direction}\n💎 Crystal: ${this.dailyData.crystal}\n` : '') +
      `🔥 Lucky Streak: ${this.streak} days\n` +
      `May good fortune follow you today! ✨`;

    navigator.clipboard.writeText(text).then(() => {
      this.showToast("Fortune copied to clipboard! 🍀");
    }).catch(() => {
      this.showToast("Blessing ready for today! ✨");
    });
  }

  showToast(msg) {
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2500);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  new LuckyHorseshoeApp();
});
