/**
 * Lucky Horseshoe - Popup Logic & Interactive Experience
 * Manifest V3 compliant digital talisman extension.
 * Features:
 * - 7-day free trial system & ExtensionPay monetization.
 * - Free vs Pro VIP differentiation (unlimited recharges, VIP matrix, multi-skin).
 * - Multi-language support (English & فارسی with Hafez/Rumi quotes).
 * - Interactive multi-skin talisman switcher (Imperial Gold, Emerald, Diamond, Rose Gold).
 * - Golden Hour alarm notification toggle with background service worker sync.
 * - Daily Intention & Goal Anchor.
 * - 7-Day streak progress tracker dots.
 * - High performance particle physics engine and Web Audio API synthesized chimes.
 */

// --- 1. Storage Wrapper (chrome.storage.local with localStorage fallback) ---
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

// --- 2. Curated Fortunes & Lucky Matrix (English & Persian) ---
const FREE_FORTUNES_EN = [
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

const FREE_FORTUNES_FA = [
  "رسید مژده که ایام غم نخواهد ماند، چنان نماند و چنین نیز هم نخواهد ماند. (حافظ)",
  "در ناامیدی بسی امید است، پایان شب سیه سپید است. (نظامی)",
  "صبر و ظفر هر دو دوستان قدیمند، بر اثر صبر نوبت ظفر آید. (حافظ)",
  "گر در طلب گوهر کانی، کانی؛ ور در پی جستجوی جانی، جانی. هر چیز که در جستن آنی، آنی. (مولانا)",
  "امروز فرصتی طلایی در خلوت‌ترین لحظه به سراغت می‌آید؛ گوش به زنگ باش.",
  "انرژی مثبت تو نتایج خیره‌کننده‌ای رقم می‌زند؛ آنچه می‌جویی در پی توست.",
  "یک برخورد غیرمنتظره و پربرکت همه چیز را به نفع تو تغییر خواهد داد.",
  "نسیم اقبال به سوی تو می‌وزد؛ به اولین ندای قلبت اعتماد کن.",
  "دانه‌ای که در گذشته کاشته‌ای، امروز جوانه زده و برکت می‌آورد.",
  "اعتمادبه‌نفس برگ برنده توست؛ گام‌های شجاعانه امروز به فتح ختم می‌شوند.",
  "گره قدیمی با یاری کائنات و شانس امروز به آسانی گشوده خواهد شد.",
  "نعل نیک‌اقبالی برکت را نگه می‌دارد؛ امروز از هر نظر درخشان و پربار است."
];

const PRO_VIP_FORTUNES_EN = [
  "👑 VIP Wealth Oracle: Unexpected monetary abundance aligns with your intentions today. Prepare to receive.",
  "👑 VIP Manifestation: A high-value opportunity will pivot decisively in your favor before day's end.",
  "👑 VIP Serendipity: Your aura is at peak magnetic resonance. Pitch your boldest ideas and claim victory.",
  "👑 VIP Abundance: Financial roadblocks dissolve today. Strategic risks taken now multiply your fortune.",
  "👑 VIP Destiny: The universe clears all obstacles on your path. A golden door opens where a wall stood.",
  "👑 VIP Prosperity: A rare stroke of luck enters your work today. Trust your timing—it is impeccable."
];

const PRO_VIP_FORTUNES_FA = [
  "👑 پیشگویی ثروت: دروازه فراوانی و رزق غیرمنتظره به روی نیت امروزت گشوده شده است. آماده دریافت باش.",
  "👑 تجلی اراده: فرصتی گران‌بها و تعیین‌کننده پیش از غروب آفتاب مسیر موفقیت مالی‌ات را هموار می‌سازد.",
  "👑 رزونانس مغناطیسی: هاله شانس تو در اوج است. بزرگ‌ترین ایده و طرحت را مطرح کن و پیروز شو.",
  "👑 جریان وفور: موانع مالی امروز رنگ می‌بازند؛ ریسک‌های هوشمندانه‌ای که برداری چندبرابر بازمی‌گردند.",
  "👑 تقدیر زرین: کائنات همه موانع را کنار می‌زند. دری زرین در جایی که دیوار بود گشوده می‌شود.",
  "👑 اقبال شاهانه: موفقیتی نادر و چشمگیر به کار امروزت وارد می‌شود. زمان‌بندی کائنات بی‌نقص است."
];

const LUCKY_COLORS_EN = ["Solar Gold", "Imperial Emerald", "Celestial Blue", "Luminous Amber", "Mystic Jade", "Radiant Topaz", "Royal Amethyst"];
const LUCKY_COLORS_FA = ["طلایی خورشیدی", "زمرد امپراتوری", "آبی آسمانی", "کهربایی درخشان", "یشم یشمین", "توپاز تابان", "ارغوانی شاهانه"];

const LUCKY_HOURS = ["9:09 AM", "11:11 AM", "1:33 PM", "2:22 PM", "3:45 PM", "5:55 PM", "7:07 PM", "8:18 PM"];

const PRO_DIRECTIONS_EN = ["North-East ↗️ (Wealth)", "East ➡️ (Clarity)", "South-East ↘️ (Abundance)", "North ⬆️ (Victory)", "South ⬇️ (Passion)"];
const PRO_DIRECTIONS_FA = ["شمال شرقی ↗️ (ثروت)", "شرق ➡️ (آرامش و وضوح)", "جنوب شرقی ↘️ (وفور نعمت)", "شمال ⬆️ (پیروزی و فتح)", "جنوب ⬇️ (انگیزه و اشتیاق)"];

const PRO_ELEMENTS_EN = ["Solar Fire 🔥", "Golden Ether 🌟", "Celestial Wind 🌪️", "Deep Water 🌊", "Cosmic Earth 🌍"];
const PRO_ELEMENTS_FA = ["آتش خورشیدی 🔥", "اتر زرین 🌟", "باد آسمانی 🌪️", "آب عمیق 🌊", "خاک کیهانی 🌍"];

const PRO_CRYSTALS_EN = ["Citrine (Wealth)", "Pyrite (Gold)", "Emerald (Luck)", "Amethyst (Peace)", "Clear Quartz (Power)"];
const PRO_CRYSTALS_FA = ["سیترین (ثروت و پول)", "پیریت (طلای مغناطیسی)", "زمرد (برکت و شانس)", "آمتیست (آرامش ذهن)", "کوارتز شفاف (قدرت و پاکی)"];

// --- 3. Internationalization (i18n) Dictionary ---
const I18N = {
  en: {
    brandTitle: "LUCKY HORSESHOE",
    trialDaysText: (d) => `${d}d Trial`,
    trialExpired: "Trial Expired",
    proLabel: "PRO",
    proLabelVip: "PRO VIP",
    statusIdleFree: "TAP TO RECEIVE LUCK",
    statusIdlePro: "TAP FOR VIP LUCK",
    subtextIdleFree: "Ancient talisman waiting to bless your day",
    subtextIdlePro: "👑 Eternal VIP talisman ready to bless your day",
    statusActiveFree: "✨ LUCKY DAY ACTIVE ✨",
    statusActivePro: "👑 VIP LUCKY AURA ACTIVE 👑",
    subtextActiveFree: "Aura is charged. Serendipity is on your side.",
    subtextActivePro: "Unlimited lucky resonance enabled. All fortunes align.",
    auraLabel: "LUCKY AURA LEVEL",
    fortuneBadgeDaily: "DAILY BLESSING",
    fortuneBadgeVip: "👑 VIP BLESSING",
    fortuneIdleText: "Tap the golden horseshoe above to unlock your daily oracle and lucky tokens.",
    titleNumber: "LUCKY NUMBER",
    titleHour: "GOLDEN HOUR",
    titleColor: "LUCKY COLOR",
    titleDirection: "LUCKY DIRECTION",
    titleElement: "LUCKY ELEMENT",
    titleCrystal: "WEALTH CRYSTAL",
    lockText: "VIP Wealth & Energy Matrix",
    proUnlockTag: "Unlock PRO 👑",
    intentionPlaceholder: "Anchor today's goal (e.g. Big meeting, Exam, Deal)...",
    ibLabel: "Blessed for:",
    btnActivate: "ACTIVATE TODAY'S LUCK",
    btnRecharge: "RECHARGE AURA",
    shareBtnLabel: "Share",
    paywallTitle: "7-DAY FREE TRIAL ENDED",
    paywallDesc: "Your 7 days of daily blessings have finished. Keep your positive momentum and good fortune alive with Lifetime Pro.",
    perk1: "Unlimited Daily Aura Recharges",
    perk2: "Deep Wealth & Manifestation Prophecies",
    perk3: "Full Energy Matrix (Direction, Crystal, Element)",
    perk4: "Permanent Lucky Talisman Protection",
    paywallBtnText: "👑 UPGRADE TO LIFETIME PRO",
    paywallLoginBtn: "Already purchased? Restore / Log In",
    toastLuckActivated: "Lucky Day Activated! 🍀",
    toastVipActivated: "👑 VIP Golden Luck Activated!",
    toastUpgradePrompt: "👑 Upgrade to Pro for unlimited recharges & VIP tokens!",
    toastVipRecharged: "👑 VIP Aura Re-energized to Maximum! ✨",
    toastAlreadyPro: "You have Lifetime VIP Pro Luck! 👑",
    toastExtPayReady: "ExtensionPay ready (lucky-horseshoe) ✨",
    toastSoundOn: "Sound On 🔔",
    toastSoundMuted: "Sound Muted 🔕",
    toastCopied: "Fortune copied to clipboard! 🍀",
    toastAlarmSet: "🔔 Reminder set for Golden Hour!",
    toastAlarmCleared: "🔕 Golden Hour reminder disabled",
    toastSkinUnlocked: "Talisman skin applied ✨",
    toastSkinProOnly: "👑 VIP Skin: Upgrade to Pro to unlock all talisman skins!",
    toastIntentionSaved: "Goal anchored and blessed for today! 🎯✨"
  },
  fa: {
    brandTitle: "نعل خوش‌شانسی",
    trialDaysText: (d) => `${d} روز رایگان`,
    trialExpired: "پایان آزمایشی",
    proLabel: "ویژه",
    proLabelVip: "ویژه VIP",
    statusIdleFree: "برای دریافت شانس لمس کنید",
    statusIdlePro: "لمس برای شانس ویژه",
    subtextIdleFree: "طلسم کهن خوش‌یمنی منتظر برکت بخشیدن به روز شماست",
    subtextIdlePro: "👑 طلسم ابدی ویژه آماده برکت بخشیدن به روز شماست",
    statusActiveFree: "✨ روز پر از شانس شما فعال شد ✨",
    statusActivePro: "👑 هاله طلایی ویژه فعال شد 👑",
    subtextActiveFree: "هاله شانس شارژ شد. انرژی کائنات و اقبال همراه شماست.",
    subtextActivePro: "رزونانس نامحدود شانس فعال است. تمام فرصت‌ها همسو شده‌اند.",
    auraLabel: "میزان هاله شانس",
    fortuneBadgeDaily: "برکت امروز",
    fortuneBadgeVip: "👑 برکت ویژه",
    fortuneIdleText: "نعل طلایی را لمس کنید تا فال و نشانه‌های خوش‌اقبالی امروز باز شوند.",
    titleNumber: "عدد شانس",
    titleHour: "ساعت طلایی",
    titleColor: "رنگ شانس",
    titleDirection: "جهت شانس",
    titleElement: "عنصر کائنات",
    titleCrystal: "سنگ ثروت",
    lockText: "ماتریس ثروت و انرژی ویژه",
    proUnlockTag: "ارتقا به ویژه 👑",
    intentionPlaceholder: "هدف امروزت رو ثبت کن (مثل: معامله، آزمون، قرارداد)...",
    ibLabel: "متبرک برای:",
    btnActivate: "فعال‌سازی شانس امروز",
    btnRecharge: "شارژ مجدد هاله",
    shareBtnLabel: "اشتراک",
    paywallTitle: "دوره ۷ روزه آزمایشی به پایان رسید",
    paywallDesc: "مهلت ۷ روزه رایگان تمام شد. برای حفظ شانس، ثروت و فال‌های نامحدود، به نسخه ویژه مادام‌العمر بپیوندید.",
    perk1: "شارژ نامحدود و مداوم هاله شانس",
    perk2: "پیش‌گویی‌های ژرف ثروت و موفقیت",
    perk3: "ماتریس کامل انرژی (جهت، سنگ و عنصر شانس)",
    perk4: "محافظت همیشگی طلسم نیک‌اقبالی",
    paywallBtnText: "👑 خرید لایف‌تایم نسخه ویژه",
    paywallLoginBtn: "قبلاً خرید کرده‌اید؟ ورود و بازیابی",
    toastLuckActivated: "شانس امروز فعال شد! 🍀",
    toastVipActivated: "👑 هاله طلایی ویژه فعال شد!",
    toastUpgradePrompt: "👑 برای شارژ نامحدود و سنگ‌های ثروت به نسخه ویژه ارتقا دهید!",
    toastVipRecharged: "👑 هاله ویژه تا بی‌نهایت شارژ شد! ✨",
    toastAlreadyPro: "شما کاربر ویژه مادام‌العمر هستید! 👑",
    toastExtPayReady: "اتصال به درگاه پرداخت (lucky-horseshoe) ✨",
    toastSoundOn: "صدا روشن شد 🔔",
    toastSoundMuted: "صدا خاموش شد 🔕",
    toastCopied: "فال و نشانه‌ها در حافظه کپی شد! 🍀",
    toastAlarmSet: "🔔 یادآور ساعت طلایی تنظیم شد!",
    toastAlarmCleared: "🔕 یادآور ساعت طلایی خاموش شد",
    toastSkinUnlocked: "پوسته نعل با موفقیت تغییر کرد ✨",
    toastSkinProOnly: "👑 پوسته ویژه: برای باز کردن این پوسته به نسخه ویژه ارتقا دهید!",
    toastIntentionSaved: "هدف امروزت ثبت و متبرک شد! 🎯✨"
  }
};

// Helper: format today's date YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Deterministic daily data generator
function getDeterministicDailyData(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  return {
    freeFortuneEn: FREE_FORTUNES_EN[absHash % FREE_FORTUNES_EN.length],
    freeFortuneFa: FREE_FORTUNES_FA[absHash % FREE_FORTUNES_FA.length],
    proFortuneEn: PRO_VIP_FORTUNES_EN[absHash % PRO_VIP_FORTUNES_EN.length],
    proFortuneFa: PRO_VIP_FORTUNES_FA[absHash % PRO_VIP_FORTUNES_FA.length],
    colorEn: LUCKY_COLORS_EN[(absHash >> 2) % LUCKY_COLORS_EN.length],
    colorFa: LUCKY_COLORS_FA[(absHash >> 2) % LUCKY_COLORS_FA.length],
    hour: LUCKY_HOURS[(absHash >> 4) % LUCKY_HOURS.length],
    number: (absHash % 77) + 1,
    directionEn: PRO_DIRECTIONS_EN[(absHash >> 3) % PRO_DIRECTIONS_EN.length],
    directionFa: PRO_DIRECTIONS_FA[(absHash >> 3) % PRO_DIRECTIONS_FA.length],
    elementEn: PRO_ELEMENTS_EN[(absHash >> 5) % PRO_ELEMENTS_EN.length],
    elementFa: PRO_ELEMENTS_FA[(absHash >> 5) % PRO_ELEMENTS_FA.length],
    crystalEn: PRO_CRYSTALS_EN[(absHash >> 1) % PRO_CRYSTALS_EN.length],
    crystalFa: PRO_CRYSTALS_FA[(absHash >> 1) % PRO_CRYSTALS_FA.length]
  };
}

// --- 4. Synthesized Web Audio Chimes ---
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
    } catch {
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
    } catch {
      // Audio fallback
    }
  }
}

// --- 5. High-Performance Particle Canvas Engine ---
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
    const palette = isPro 
      ? ['#FEF08A', '#FCD34D', '#F59E0B', '#34D399', '#10B981', '#6EE7B7', '#FFFFFF']
      : ['#FEF08A', '#FCD34D', '#F59E0B', '#34D399', '#FFFFFF', '#10B981'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (isPro ? 3 : 2) + Math.random() * (isPro ? 8 : 6.5);
      const size = 2 + Math.random() * (isPro ? 5.5 : 4.5);
      const color = palette[Math.floor(Math.random() * palette.length)];
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

// --- 6. Application State & Controller ---
class LuckyHorseshoeApp {
  constructor() {
    this.sound = new SoundManager();
    this.particles = new ParticleEngine(document.getElementById('particleCanvas'));
    
    // UI elements
    this.brandTitle = document.getElementById('brandTitle');
    this.langToggle = document.getElementById('langToggle');
    this.trialPill = document.getElementById('trialPill');
    this.trialDaysText = document.getElementById('trialDaysText');
    this.proBtn = document.getElementById('proBtn');
    this.proLabel = document.getElementById('proLabel');
    this.streakCount = document.getElementById('streakCount');
    this.soundToggle = document.getElementById('soundToggle');
    this.soundOnIcon = document.getElementById('soundOnIcon');
    this.soundOffIcon = document.getElementById('soundOffIcon');
    this.skinsBar = document.getElementById('skinsBar');
    this.skinBtns = document.querySelectorAll('.skin-btn');
    this.horseshoeBtn = document.getElementById('horseshoeBtn');
    this.horseshoeBody = document.getElementById('horseshoeBody');
    this.orbitRingSvg = document.getElementById('orbitRingSvg');
    this.statusHeading = document.getElementById('statusHeading');
    this.statusSubtext = document.getElementById('statusSubtext');
    this.auraLabel = document.getElementById('auraLabel');
    this.auraFill = document.getElementById('auraFill');
    this.auraPercent = document.getElementById('auraPercent');
    this.streakDotsWrap = document.getElementById('streakDotsWrap');
    this.streakDots = document.querySelectorAll('.s-dot');
    this.fortuneCard = document.getElementById('fortuneCard');
    this.fortuneBadge = document.getElementById('fortuneBadge');
    this.fortuneDate = document.getElementById('fortuneDate');
    this.fortuneText = document.getElementById('fortuneText');
    this.titleNumber = document.getElementById('titleNumber');
    this.tokenNumber = document.getElementById('tokenNumber');
    this.titleHour = document.getElementById('titleHour');
    this.tokenHour = document.getElementById('tokenHour');
    this.goldenHourBell = document.getElementById('goldenHourBell');
    this.titleColor = document.getElementById('titleColor');
    this.tokenColor = document.getElementById('tokenColor');
    this.proTokensWrap = document.getElementById('proTokensWrap');
    this.titleDirection = document.getElementById('titleDirection');
    this.tokenDirection = document.getElementById('tokenDirection');
    this.titleElement = document.getElementById('titleElement');
    this.tokenElement = document.getElementById('tokenElement');
    this.titleCrystal = document.getElementById('titleCrystal');
    this.tokenCrystal = document.getElementById('tokenCrystal');
    this.proLockOverlay = document.getElementById('proLockOverlay');
    this.lockText = document.getElementById('lockText');
    this.proUnlockTag = document.getElementById('proUnlockTag');
    this.intentionWrap = document.getElementById('intentionWrap');
    this.intentionInputRow = document.getElementById('intentionInputRow');
    this.intentionInput = document.getElementById('intentionInput');
    this.intentionBlessed = document.getElementById('intentionBlessed');
    this.ibLabel = document.getElementById('ibLabel');
    this.ibText = document.getElementById('ibText');
    this.activateBtn = document.getElementById('activateBtn');
    this.btnLabel = document.getElementById('btnLabel');
    this.shareBtn = document.getElementById('shareBtn');
    this.shareBtnLabel = document.getElementById('shareBtnLabel');
    this.paywallModal = document.getElementById('paywallModal');
    this.paywallTitle = document.getElementById('paywallTitle');
    this.paywallDesc = document.getElementById('paywallDesc');
    this.perk1 = document.getElementById('perk1');
    this.perk2 = document.getElementById('perk2');
    this.perk3 = document.getElementById('perk3');
    this.perk4 = document.getElementById('perk4');
    this.paywallUpgradeBtn = document.getElementById('paywallUpgradeBtn');
    this.paywallBtnText = document.getElementById('paywallBtnText');
    this.paywallLoginBtn = document.getElementById('paywallLoginBtn');
    this.toast = document.getElementById('toast');

    // ExtensionPay instance
    this.extpay = typeof ExtPay !== 'undefined' ? ExtPay('lucky-horseshoe') : null;
    this.isProUser = false;
    this.isTrialExpired = false;
    this.daysRemaining = 7;

    // Feature state
    this.lang = 'en'; // default language
    this.selectedSkin = 'gold';
    this.goldenHourAlarmEnabled = false;
    this.isActivatedToday = false;
    this.streak = 1;
    this.todayStr = getTodayString();
    this.dailyData = getDeterministicDailyData(this.todayStr);

    this.init();
  }

  async init() {
    this.attachEvents();
    await this.loadTrialAndState();
    await this.checkProStatus();
    this.applySkin(this.selectedSkin, false);
    this.applyLanguage();
    this.renderInitialUI();
  }

  attachEvents() {
    // Language toggle
    if (this.langToggle) {
      this.langToggle.addEventListener('click', () => this.toggleLanguage());
    }

    // Pro button & Lock overlays
    if (this.proBtn) {
      this.proBtn.addEventListener('click', () => this.handleProClick());
    }
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

    // Skins selector
    if (this.skinBtns) {
      this.skinBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const skin = btn.getAttribute('data-skin');
          this.handleSkinSelect(skin);
        });
      });
    }

    // Golden Hour bell reminder
    if (this.goldenHourBell) {
      this.goldenHourBell.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleGoldenHourAlarm();
      });
    }

    // Daily Intention Anchor
    if (this.intentionInput) {
      this.intentionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.saveIntention();
        }
      });
      this.intentionInput.addEventListener('blur', () => {
        if (this.intentionInput.value.trim().length > 0) {
          this.saveIntention();
        }
      });
    }
    if (this.intentionBlessed) {
      this.intentionBlessed.addEventListener('click', () => {
        // Switch back to input mode to let user edit
        this.intentionBlessed.classList.add('hidden');
        this.intentionInputRow.classList.remove('hidden');
        this.intentionInput.focus();
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
    const data = await Storage.get([
      'installTimestamp',
      'lastActivatedDate',
      'streakCount',
      'soundEnabled',
      'lang',
      'selectedSkin',
      'goldenHourAlarmEnabled',
      'dailyIntention'
    ]);
    
    // 1. Language preference (Default to browser language if available and not saved)
    if (data.lang) {
      this.lang = data.lang;
    } else {
      const navLang = (navigator.language || '').toLowerCase();
      this.lang = navLang.startsWith('fa') ? 'fa' : 'en';
    }

    // 2. 7-day trial calculation
    let installTime = data.installTimestamp;
    if (!installTime) {
      installTime = Date.now();
      await Storage.set({ installTimestamp: installTime });
    }

    const elapsedDays = Math.floor((Date.now() - installTime) / (1000 * 60 * 60 * 24));
    this.daysRemaining = Math.max(0, 7 - elapsedDays);
    this.isTrialExpired = this.daysRemaining <= 0;

    // 3. Sound preference
    if (data.soundEnabled !== undefined) {
      this.sound.enabled = data.soundEnabled;
    }
    this.updateSoundIcons();

    // 4. Skin preference
    if (data.selectedSkin) {
      this.selectedSkin = data.selectedSkin;
    }

    // 5. Golden Hour Alarm
    this.goldenHourAlarmEnabled = !!data.goldenHourAlarmEnabled;
    if (this.goldenHourBell) {
      this.goldenHourBell.classList.toggle('active', this.goldenHourAlarmEnabled);
    }

    // 6. Streak and daily activation
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
    this.updateStreakDots();

    // 7. Daily Intention
    if (data.dailyIntention && data.dailyIntention.date === this.todayStr && data.dailyIntention.text) {
      this.intentionInput.value = data.dailyIntention.text;
      this.ibText.textContent = data.dailyIntention.text;
      this.intentionInputRow.classList.add('hidden');
      this.intentionBlessed.classList.remove('hidden');
    } else {
      this.intentionInputRow.classList.remove('hidden');
      this.intentionBlessed.classList.add('hidden');
    }
  }

  async checkProStatus() {
    if (!this.extpay) return;
    try {
      const user = await this.extpay.getUser();
      if (user && user.paid) {
        this.isProUser = true;
        this.isTrialExpired = false; // Pro users never expire
      }
    } catch {
      // ExtPay offline or network notice
    }
  }

  toggleLanguage() {
    this.lang = this.lang === 'en' ? 'fa' : 'en';
    Storage.set({ lang: this.lang });
    this.applyLanguage();
    this.renderInitialUI();
    this.showToast(this.lang === 'fa' ? 'زبان به فارسی تغییر کرد 🇮🇷' : 'Language set to English 🇬🇧');
  }

  applyLanguage() {
    const t = I18N[this.lang];
    const isFa = this.lang === 'fa';

    // Toggle RTL class on body
    document.body.classList.toggle('rtl', isFa);

    // Language toggle button shows target language
    this.langToggle.textContent = isFa ? 'EN' : 'FA';
    this.langToggle.title = isFa ? 'Switch to English' : 'تغییر زبان به فارسی';

    // Brand and labels
    this.brandTitle.textContent = t.brandTitle;
    this.auraLabel.textContent = t.auraLabel;
    this.titleNumber.textContent = t.titleNumber;
    this.titleColor.textContent = t.titleColor;
    this.titleDirection.textContent = t.titleDirection;
    this.titleElement.textContent = t.titleElement;
    this.titleCrystal.textContent = t.titleCrystal;
    this.lockText.textContent = t.lockText;
    this.proUnlockTag.textContent = t.proUnlockTag;
    this.intentionInput.placeholder = t.intentionPlaceholder;
    this.ibLabel.textContent = t.ibLabel;
    this.shareBtnLabel.textContent = t.shareBtnLabel;

    // Golden Hour Title preserving the bell button
    this.titleHour.innerHTML = `${t.titleHour} <button class="hour-bell-btn ${this.goldenHourAlarmEnabled ? 'active' : ''}" id="goldenHourBell" title="Set Golden Hour Reminder Notification">🔔</button>`;
    this.goldenHourBell = document.getElementById('goldenHourBell');
    this.goldenHourBell.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleGoldenHourAlarm();
    });

    // Paywall modal texts
    this.paywallTitle.textContent = t.paywallTitle;
    this.paywallDesc.textContent = t.paywallDesc;
    this.perk1.textContent = t.perk1;
    this.perk2.textContent = t.perk2;
    this.perk3.textContent = t.perk3;
    this.perk4.textContent = t.perk4;
    this.paywallBtnText.textContent = t.paywallBtnText;
    this.paywallLoginBtn.textContent = t.paywallLoginBtn;
  }

  handleSkinSelect(skin) {
    const t = I18N[this.lang];
    // VIP skins (emerald, diamond, rosegold) are Pro perks
    if (!this.isProUser && skin !== 'gold') {
      this.showToast(t.toastSkinProOnly);
      if (this.extpay) {
        setTimeout(() => this.extpay.openPaymentPage(), 600);
      }
      return;
    }

    this.applySkin(skin, true);
  }

  applySkin(skin, showFeedback = true) {
    this.selectedSkin = skin;
    Storage.set({ selectedSkin: skin });

    // Update active class on skin buttons
    this.skinBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-skin') === skin);
    });

    // Update SVG fills and strokes
    const sheenId = `url(#${skin}Sheen)`;
    if (this.horseshoeBody) {
      this.horseshoeBody.setAttribute('fill', sheenId);
    }
    if (this.orbitRingSvg) {
      this.orbitRingSvg.setAttribute('stroke', sheenId);
    }

    if (showFeedback) {
      this.sound.playTapSparkle();
      this.showToast(I18N[this.lang].toastSkinUnlocked);
    }
  }

  toggleGoldenHourAlarm() {
    const t = I18N[this.lang];
    this.goldenHourAlarmEnabled = !this.goldenHourAlarmEnabled;
    this.goldenHourBell.classList.toggle('active', this.goldenHourAlarmEnabled);

    Storage.set({
      goldenHourAlarmEnabled: this.goldenHourAlarmEnabled,
      goldenHourTime: this.dailyData.hour
    });

    this.sound.playTapSparkle();
    this.showToast(this.goldenHourAlarmEnabled ? t.toastAlarmSet : t.toastAlarmCleared);
  }

  saveIntention() {
    const text = (this.intentionInput.value || '').trim();
    if (!text) return;

    Storage.set({
      dailyIntention: {
        date: this.todayStr,
        text: text
      }
    });

    this.ibText.textContent = text;
    this.intentionInputRow.classList.add('hidden');
    this.intentionBlessed.classList.remove('hidden');

    this.sound.playTapSparkle();
    this.showToast(I18N[this.lang].toastIntentionSaved);
  }

  updateStreakDots() {
    const current = Math.max(0, Math.min(7, this.streak));
    this.streakDots.forEach((dot) => {
      const day = parseInt(dot.getAttribute('data-day'), 10);
      dot.classList.toggle('active', day <= current);
    });
  }

  renderInitialUI() {
    const t = I18N[this.lang];
    const isFa = this.lang === 'fa';

    // Human readable date
    const d = new Date();
    const options = { month: 'short', day: 'numeric', weekday: 'short' };
    this.fortuneDate.textContent = isFa ? 'امروز' : d.toLocaleDateString(undefined, options);

    // Update Pro & Trial UI
    if (this.isProUser) {
      this.proBtn.classList.add('is-pro');
      this.proLabel.textContent = t.proLabelVip;
      this.trialPill.style.display = 'none'; // Pro users don't need trial pill
      this.horseshoeBtn.classList.add('is-pro-active');
      this.fortuneBadge.classList.add('pro-mode');
      this.fortuneBadge.textContent = t.fortuneBadgeVip;

      // Unlock Pro tokens
      this.proTokensWrap.classList.remove('is-locked');
      this.proLockOverlay.classList.add('hidden');
      this.paywallModal.classList.add('hidden');
    } else {
      // Free User
      if (this.isTrialExpired) {
        // 7-day trial ended! Show paywall modal
        this.trialDaysText.textContent = t.trialExpired;
        this.trialPill.classList.add('is-expired');
        this.paywallModal.classList.remove('hidden');
      } else {
        this.trialDaysText.textContent = t.trialDaysText(this.daysRemaining);
        this.trialPill.classList.remove('is-expired');
        this.paywallModal.classList.add('hidden');
      }

      // Lock Pro tokens
      this.proTokensWrap.classList.add('is-locked');
      this.proLockOverlay.classList.remove('hidden');
      this.fortuneBadge.classList.remove('pro-mode');
      this.fortuneBadge.textContent = t.fortuneBadgeDaily;
      this.proLabel.textContent = t.proLabel;
    }

    if (this.isActivatedToday) {
      this.applyActivatedVisuals();
    } else {
      this.applyIdleVisuals();
    }
  }

  applyIdleVisuals() {
    const t = I18N[this.lang];
    this.horseshoeBtn.classList.remove('is-active');
    this.statusHeading.textContent = this.isProUser ? t.statusIdlePro : t.statusIdleFree;
    this.statusSubtext.textContent = this.isProUser ? t.subtextIdlePro : t.subtextIdleFree;
    this.auraFill.style.width = '0%';
    this.auraPercent.textContent = '0%';
    this.btnLabel.textContent = t.btnActivate;
    this.activateBtn.classList.remove('active-mode');
    this.shareBtn.classList.add('hidden');

    this.tokenNumber.textContent = '--';
    this.tokenHour.textContent = '--:--';
    this.tokenColor.textContent = '--';
    this.tokenDirection.textContent = '--';
    this.tokenElement.textContent = '--';
    this.tokenCrystal.textContent = '--';
    this.fortuneText.textContent = t.fortuneIdleText;
  }

  applyActivatedVisuals() {
    const t = I18N[this.lang];
    const isFa = this.lang === 'fa';

    this.horseshoeBtn.classList.add('is-active');
    if (this.isProUser) {
      this.horseshoeBtn.classList.add('is-pro-active');
    }

    this.statusHeading.textContent = this.isProUser ? t.statusActivePro : t.statusActiveFree;
    this.statusSubtext.textContent = this.isProUser ? t.subtextActivePro : t.subtextActiveFree;
    
    // Animate aura fill
    this.auraFill.style.width = '100%';
    this.auraPercent.textContent = '100%';
    
    // Set fortune (VIP gets deep wealth/manifestation prophecy)
    const quote = this.isProUser
      ? (isFa ? this.dailyData.proFortuneFa : this.dailyData.proFortuneEn)
      : (isFa ? this.dailyData.freeFortuneFa : this.dailyData.freeFortuneEn);
    this.fortuneText.textContent = `“${quote}”`;
    
    // Standard tokens
    this.tokenNumber.textContent = this.dailyData.number;
    this.tokenHour.textContent = this.dailyData.hour;
    this.tokenColor.textContent = isFa ? this.dailyData.colorFa : this.dailyData.colorEn;

    // Pro tokens
    this.tokenDirection.textContent = isFa ? this.dailyData.directionFa : this.dailyData.directionEn;
    this.tokenElement.textContent = isFa ? this.dailyData.elementFa : this.dailyData.elementEn;
    this.tokenCrystal.textContent = isFa ? this.dailyData.crystalFa : this.dailyData.crystalEn;

    // Buttons
    this.btnLabel.textContent = t.btnRecharge;
    this.activateBtn.classList.add('active-mode');
    this.shareBtn.classList.remove('hidden');

    this.streakCount.textContent = Math.max(1, this.streak);
    this.updateStreakDots();
  }

  async handleActivation(event) {
    const t = I18N[this.lang];

    // If trial is expired and user is not Pro, block and show paywall!
    if (this.isTrialExpired && !this.isProUser) {
      this.paywallModal.classList.remove('hidden');
      return;
    }

    // Auto-save daily intention if typed
    if (this.intentionInput && this.intentionInput.value.trim().length > 0 && this.intentionBlessed.classList.contains('hidden')) {
      this.saveIntention();
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
      this.showToast(this.isProUser ? t.toastVipActivated : t.toastLuckActivated);
    } else {
      // Re-energize check:
      if (!this.isProUser) {
        this.sound.playTapSparkle();
        this.particles.burst(burstX, burstY, 25, false);
        this.horseshoeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => { this.horseshoeBtn.style.transform = ''; }, 200);
        this.showToast(t.toastUpgradePrompt);
      } else {
        // Pro User: UNLIMITED FULL RECHARGE BURST!
        this.sound.playCelestialChime(true);
        this.particles.burst(burstX, burstY, 60, true);
        this.horseshoeBtn.style.transform = 'scale(1.15)';
        setTimeout(() => { this.horseshoeBtn.style.transform = ''; }, 200);
        this.showToast(t.toastVipRecharged);
      }
    }
  }

  handleProClick() {
    const t = I18N[this.lang];
    if (this.isProUser) {
      this.showToast(t.toastAlreadyPro);
      return;
    }
    if (this.extpay) {
      this.extpay.openPaymentPage();
    } else {
      this.showToast(t.toastExtPayReady);
    }
  }

  toggleSound() {
    this.sound.enabled = !this.sound.enabled;
    Storage.set({ soundEnabled: this.sound.enabled });
    this.updateSoundIcons();
    this.showToast(this.sound.enabled ? I18N[this.lang].toastSoundOn : I18N[this.lang].toastSoundMuted);
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
    const isFa = this.lang === 'fa';
    const quote = this.isProUser
      ? (isFa ? this.dailyData.proFortuneFa : this.dailyData.proFortuneEn)
      : (isFa ? this.dailyData.freeFortuneFa : this.dailyData.freeFortuneEn);
    
    const color = isFa ? this.dailyData.colorFa : this.dailyData.colorEn;
    const direction = isFa ? this.dailyData.directionFa : this.dailyData.directionEn;
    const crystal = isFa ? this.dailyData.crystalFa : this.dailyData.crystalEn;
    const goal = this.intentionInput.value.trim();

    let text;
    if (isFa) {
      text = `🍀 برکت و فال امروز نعل خوش‌شانسی من:\n` +
        `«${quote}»\n` +
        (goal ? `🎯 هدف متبرک امروز: ${goal}\n` : '') +
        `🔢 عدد شانس: ${this.dailyData.number}\n` +
        `⏰ ساعت طلایی: ${this.dailyData.hour}\n` +
        `🎨 رنگ شانس: ${color}\n` +
        (this.isProUser ? `🧭 جهت شانس: ${direction}\n💎 سنگ ثروت: ${crystal}\n` : '') +
        `🔥 زنجیره اقبال: ${this.streak} روز مداوم\n` +
        `امروز اتفاقات شگفت‌انگیزی در انتظار توست! ✨`;
    } else {
      text = `🍀 My Lucky Horseshoe Blessing for Today:\n` +
        `“${quote}”\n` +
        (goal ? `🎯 Blessed Goal: ${goal}\n` : '') +
        `🔢 Lucky Number: ${this.dailyData.number}\n` +
        `⏰ Golden Hour: ${this.dailyData.hour}\n` +
        `🎨 Lucky Color: ${color}\n` +
        (this.isProUser ? `🧭 Direction: ${direction}\n💎 Crystal: ${crystal}\n` : '') +
        `🔥 Lucky Streak: ${this.streak} days\n` +
        `May good fortune follow you today! ✨`;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast(I18N[this.lang].toastCopied);
    }).catch(() => {
      this.showToast(I18N[this.lang].toastCopied);
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
  window.app = new LuckyHorseshoeApp();
});
