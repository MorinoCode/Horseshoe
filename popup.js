/**
 * Lucky Horseshoe - Popup Logic & Interactive Experience
 * Manifest V3 compliant digital talisman extension.
 * Features:
 * - 7-Day free trial system & ExtensionPay monetization.
 * - Multi-language support (English, فارسی, العربية, Русский, Español).
 * - Settings modal with language and talisman theme selection.
 * - Interactive multi-skin switcher (Imperial Gold, Emerald, Diamond, Rose Gold).
 * - Golden Hour alarm notification toggle with background service worker sync.
 * - Daily Intention & Goal Anchor.
 * - 7-Day streak progress tracker dots.
 * - Synthesized Web Audio API celestial chimes & Canvas particle physics.
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

// --- 2. Curated Fortunes in 5 Languages ---
const FREE_FORTUNES = {
  en: [
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
  ],
  fa: [
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
  ],
  ar: [
    "تفاءل بما تهوى يكن، إن البشائر لا تمل السير نحوك.",
    "ما تبحث عنه يبحث عنك في اللحظة المناسبة تماماً.",
    "فرصة ذهبية غير متوقعة تقترب منك في هدوء هذا اليوم. كن مستعداً.",
    "طاقتك الإيجابية تجذب نتائج مبهرة تليق بطموحك العالي.",
    "رياح الحظ تهب في صالحك، ثق بحدسك الأول وقرارك الصائب.",
    "بذرة زرعتها في الماضي توشك أن تثمر خيراً وفيراً اليوم.",
    "الثقة بالنفس هي تميمتك الرابحة اليوم. الخطوات الجريئة تقود للنصر.",
    "قوى الخير تتناغم خلف الكواليس لتمهيد طريقك وإزالة الصعاب.",
    "أخبار سارة تتجه نحوك بسرعة قبل أن تغرب شمس اليوم.",
    "حدوة الحظ تحفظ البركة؛ يومك مشرق بإمكانات واعدة."
  ],
  ru: [
    "Золотые возможности появляются в самые тихие и неожиданные моменты.",
    "Ваша энергия притягивает благоприятные события. То, что вы ищете, ищет вас.",
    "Неожиданная счастливая встреча сегодня повернет ход событий в вашу пользу.",
    "Ветер удачи дует в вашу сторону. Доверьтесь первому порыву интуиции.",
    "Семя, посаженное в прошлом, готово расцвести великой удачей.",
    "Уверенность в себе — ваш главный счастливый талисман сегодня.",
    "Позитивные силы вселенной открывают для вас прямую дорогу к цели.",
    "Добрые вести спешат к вам еще до захода солнца.",
    "Подкова держит вашу удачу на высоте. День наполнен светлым потенциалом."
  ],
  es: [
    "Las oportunidades doradas llegan en momentos de calma. Mantén tus sentidos abiertos.",
    "Tu energía atrae resultados favorables. Lo que buscas te está buscando.",
    "Un encuentro casual e inesperado cambiará todo a tu favor.",
    "Los vientos de la fortuna soplan hacia ti. Confía en tu primer instinto.",
    "Una semilla plantada en el pasado florecerá hoy con extraordinaria suerte.",
    "La confianza es tu amuleto hoy. Las decisiones audaces te llevarán a la victoria.",
    "Fuerzas positivas se alinean detrás de escena para allanar tu camino.",
    "Buenas noticias viajan rápidamente hacia ti antes de que se ponga el sol.",
    "La herradura mantiene tu suerte en alto. Hoy brilla con gran potencial."
  ]
};

const PRO_VIP_FORTUNES = {
  en: [
    "👑 VIP Wealth Oracle: Unexpected monetary abundance aligns with your intentions today. Prepare to receive.",
    "👑 VIP Manifestation: A high-value opportunity will pivot decisively in your favor before day's end.",
    "👑 VIP Serendipity: Your aura is at peak magnetic resonance. Pitch your boldest ideas and claim victory.",
    "👑 VIP Abundance: Financial roadblocks dissolve today. Strategic risks taken now multiply your fortune.",
    "👑 VIP Destiny: The universe clears all obstacles on your path. A golden door opens where a wall stood.",
    "👑 VIP Prosperity: A rare stroke of luck enters your work today. Trust your timing—it is impeccable."
  ],
  fa: [
    "👑 پیشگویی ثروت: دروازه فراوانی و رزق غیرمنتظره به روی نیت امروزت گشوده شده است. آماده دریافت باش.",
    "👑 تجلی اراده: فرصتی گران‌بها و تعیین‌کننده پیش از غروب آفتاب مسیر موفقیت مالی‌ات را هموار می‌سازد.",
    "👑 رزونانس مغناطیسی: هاله شانس تو در اوج است. بزرگ‌ترین ایده و طرحت را مطرح کن و پیروز شو.",
    "👑 جریان وفور: موانع مالی امروز رنگ می‌بازند؛ ریسک‌های هوشمندانه‌ای که برداری چندبرابر بازمی‌گردند.",
    "👑 تقدیر زرین: کائنات همه موانع را کنار می‌زند. دری زرین در جایی که دیوار بود گشوده می‌شود.",
    "👑 اقبال شاهانه: موفقیتی نادر و چشمگیر به کار امروزت وارد می‌شود. زمان‌بندی کائنات بی‌نقص است."
  ],
  ar: [
    "👑 حكمة الثراء: أبواب الوفرة المالية تنفتح اليوم أمام نيتك الصادقة. استعد للاستقبال.",
    "👑 تجلي الفرص: فرصة استثمارية ثمينة ستتحول لصالحك بشكل حاسم قبل نهاية اليوم.",
    "👑 الرنين المغناطيسي: هالتك اليوم في أوج جاذبيتها. اطرح أكبر أفكارك واحصد النجاح.",
    "👑 فيض البركة: العقبات المالية تتبدد اليوم، والمخاطر المدروسة تتضاعف عوائدها لصالحك.",
    "👑 القدر الذهبي: الكون يزيل كل حائل أمامك، وباب ذهبي يفتح حيث كان هناك جدار."
  ],
  ru: [
    "👑 Оракул Богатства: Неожиданное денежное изобилие согласуется с вашими намерениями. Будьте готовы принять его.",
    "👑 Манифестация: Высокодоходная возможность решительно повернется в вашу пользу до заката.",
    "👑 Резонанс: Ваша аура находится на пике притяжения. Предлагайте самые смелые идеи и побеждайте.",
    "👑 Изобилие: Финансовые преграды растворяются сегодня. Продуманные шаги принесут кратное умножение успеха.",
    "👑 Золотая Судьба: Вселенная расчищает ваш путь. Золотая дверь открывается там, где была стена."
  ],
  es: [
    "👑 Oráculo de Riqueza: La abundancia monetaria se alinea con tus intenciones hoy. Prepárate para recibir.",
    "👑 Manifestación: Una oportunidad de gran valor girará decisivamente a tu favor antes de que termine el día.",
    "👑 Resonancia: Tu aura está en su punto magnético máximo. Presenta tus ideas más ambiciosas.",
    "👑 Abundancia: Los bloqueos financieros se disuelven hoy. Los riesgos estratégicos multiplican tu fortuna.",
    "👑 Destino Dorado: El universo despeja los obstáculos. Una puerta de oro se abre donde había una pared."
  ]
};

const LUCKY_COLORS = {
  en: ["Solar Gold", "Imperial Emerald", "Celestial Blue", "Luminous Amber", "Mystic Jade", "Radiant Topaz", "Royal Amethyst"],
  fa: ["طلایی خورشیدی", "زمرد امپراتوری", "آبی آسمانی", "کهربایی درخشان", "یشم یشمین", "توپاز تابان", "ارغوانی شاهانه"],
  ar: ["الذهبي الشمسي", "الزمرد الإمبراطوري", "الأزرق السماوي", "الكهرمان المضيء", "اليشم الملكي", "التوباز المشع", "الجمشت الملكي"],
  ru: ["Солнечное золото", "Имперский изумруд", "Небесно-голубой", "Сияющий янтарь", "Мистический нефрит", "Лучезарный топаз", "Королевский аметист"],
  es: ["Oro Solar", "Esmeralda Imperial", "Azul Celestial", "Ámbar Luminoso", "Jade Místico", "Topacio Radiante", "Amatista Real"]
};

const LUCKY_HOURS = ["9:09 AM", "11:11 AM", "1:33 PM", "2:22 PM", "3:45 PM", "5:55 PM", "7:07 PM", "8:18 PM"];

const PRO_DIRECTIONS = {
  en: ["North-East ↗️ (Wealth)", "East ➡️ (Clarity)", "South-East ↘️ (Abundance)", "North ⬆️ (Victory)", "South ⬇️ (Passion)"],
  fa: ["شمال شرقی ↗️ (ثروت)", "شرق ➡️ (آرامش و وضوح)", "جنوب شرقی ↘️ (وفور نعمت)", "شمال ⬆️ (پیروزی و فتح)", "جنوب ⬇️ (انگیزه و اشتیاق)"],
  ar: ["الشمال الشرقي ↗️ (الثراء)", "الشرق ➡️ (الوضوح والسلام)", "الجنوب الشرقي ↘️ (الوفرة)", "الشمال ⬆️ (النصر والظفر)", "الجنوب ⬇️ (الحماس والشغف)"],
  ru: ["Северо-Восток ↗️ (Богатство)", "Восток ➡️ (Ясность)", "Юго-Восток ↘️ (Изобилие)", "Север ⬆️ (Победа)", "Юг ⬇️ (Страсть)"],
  es: ["Noreste ↗️ (Riqueza)", "Este ➡️ (Claridad)", "Sureste ↘️ (Abundancia)", "Norte ⬆️ (Victoria)", "Sur ⬇️ (Pasión)"]
};

const PRO_ELEMENTS = {
  en: ["Solar Fire 🔥", "Golden Ether 🌟", "Celestial Wind 🌪️", "Deep Water 🌊", "Cosmic Earth 🌍"],
  fa: ["آتش خورشیدی 🔥", "اتر زرین 🌟", "باد آسمانی 🌪️", "آب عمیق 🌊", "خاک کیهانی 🌍"],
  ar: ["نار شمسية 🔥", "أثير ذهبي 🌟", "رياح سماوية 🌪️", "مياه عميقة 🌊", "أرض كونية 🌍"],
  ru: ["Солнечный огонь 🔥", "Золотой эфир 🌟", "Небесный ветер 🌪️", "Глубокая вода 🌊", "Космическая земля 🌍"],
  es: ["Fuego Solar 🔥", "Éter Dorado 🌟", "Viento Celestial 🌪️", "Agua Profunda 🌊", "Tierra Cósmica 🌍"]
};

const PRO_CRYSTALS = {
  en: ["Citrine (Wealth)", "Pyrite (Gold)", "Emerald (Luck)", "Amethyst (Peace)", "Clear Quartz (Power)"],
  fa: ["سیترین (ثروت و پول)", "پیریت (طلای مغناطیسی)", "زمرد (برکت و شانس)", "آمتیست (آرامش ذهن)", "کوارتز شفاف (قدرت و پاکی)"],
  ar: ["السترين (الثروة والمال)", "البيريت (مغناطيس الذهب)", "الزمرد (البركة والحظ)", "الجمشت (سلام النفس)", "الكوارتز الشفاف (القوة والنقاء)"],
  ru: ["Цитрин (Богатство)", "Пирит (Золото)", "Изумруд (Удача)", "Аметист (Покой)", "Кварц (Сила)"],
  es: ["Citrino (Riqueza)", "Pirita (Oro)", "Esmeralda (Suerte)", "Amatista (Paz)", "Cuarzo Transparente (Poder)"]
};

// --- 3. Internationalization (i18n) Dictionary in 5 Languages ---
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
    settingsTitle: "SETTINGS",
    langSectionTitle: "LANGUAGE / زبان / اللغة",
    themeSectionTitle: "HORSESHOE THEME",
    themeGoldName: "Imperial Gold",
    themeEmeraldName: "Emerald Radiance",
    themeDiamondName: "Diamond Quantum",
    themeRoseName: "Rose Gold Love",
    vipStatusTitle: "Unlock All Themes & Oracles",
    vipStatusDesc: "Lifetime Pro gives access to all talisman skins",
    vipStatusBtn: "UPGRADE",
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
    toastSkinUnlocked: "Talisman theme applied ✨",
    toastSkinProOnly: "👑 VIP Theme: Upgrade to Pro to unlock this skin!",
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
    settingsTitle: "تنظیمات",
    langSectionTitle: "انتخاب زبان",
    themeSectionTitle: "تم و پوسته نعل",
    themeGoldName: "طلای امپراتوری",
    themeEmeraldName: "زمرد کیهانی",
    themeDiamondName: "الماس کوانتومی",
    themeRoseName: "رزگلد عاشقی",
    vipStatusTitle: "بازگشایی تمام پوسته‌ها و فال‌ها",
    vipStatusDesc: "نسخه ویژه دسترسی همیشگی به تمام تم‌ها می‌دهد",
    vipStatusBtn: "ارتقا",
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
  },
  ar: {
    brandTitle: "حدوة الحظ",
    trialDaysText: (d) => `${d} أيام تجريبية`,
    trialExpired: "انتهت التجربة",
    proLabel: "برو",
    proLabelVip: "برو VIP",
    statusIdleFree: "المس لجلب الحظ",
    statusIdlePro: "المس للحظ الملكي",
    subtextIdleFree: "تميمة قديمة جاهزة لمباركة يومك بالخير والوفرة",
    subtextIdlePro: "👑 تميمة ملكية جاهزة لمباركة يومك بالوفرة والتوفيق",
    statusActiveFree: "✨ يوم الحظ نشط الآن ✨",
    statusActivePro: "👑 هالة الحظ الذهبية نشطة 👑",
    subtextActiveFree: "الهالة مشحونة بالكامل. التوفيق والبركة في طريقك.",
    subtextActivePro: "الترددات الذهبية مفعلة. جميع الفرص تتناغم لصالحك.",
    auraLabel: "مستوى هالة الحظ",
    fortuneBadgeDaily: "بركة اليوم",
    fortuneBadgeVip: "👑 حكمة الوفرة VIP",
    fortuneIdleText: "المس حدوة الحظ الذهبية لتكشف عن حكمة ورموز حظك اليوم.",
    titleNumber: "رقم الحظ",
    titleHour: "الساعة الذهبية",
    titleColor: "لون الحظ",
    titleDirection: "اتجاه الحظ",
    titleElement: "عنصر الكون",
    titleCrystal: "بلورة الثروة",
    lockText: "مصفوفة الطاقة والثروة VIP",
    proUnlockTag: "فتح النسخة المميزة 👑",
    intentionPlaceholder: "سجل هدفك اليوم (صفقة، اختبار، اجتماع)...",
    ibLabel: "مبارك لـ:",
    btnActivate: "تفعيل حظ اليوم",
    btnRecharge: "إعادة شحن الهالة",
    shareBtnLabel: "مشاركة",
    settingsTitle: "الإعدادات",
    langSectionTitle: "اختيار اللغة",
    themeSectionTitle: "مظهر وتميمة الحظ",
    themeGoldName: "الذهب الإمبراطوري",
    themeEmeraldName: "الزمرد الإشعاعي",
    themeDiamondName: "الماس الكمي",
    themeRoseName: "الذهب الوردي",
    vipStatusTitle: "فتح جميع المظاهر والحكم",
    vipStatusDesc: "اشتراك Pro مدى الحياة يتيح الوصول لجميع المظاهر",
    vipStatusBtn: "ترقية",
    paywallTitle: "انتهت فترة الـ 7 أيام التجريبية",
    paywallDesc: "انتهت أيامك التجريبية المجانية. حافظ على تدفق طاقتك الإيجابية وحظك الوفير مع اشتراك مدى الحياة.",
    perk1: "إعادة شحن يومي غير محدود للهالة",
    perk2: "تنبؤات وحكم عميقة للوفرة والثراء",
    perk3: "مصفوفة الطاقة الكاملة (الاتجاه، البلورة، العنصر)",
    perk4: "حماية تميمة الحظ الدائمة",
    paywallBtnText: "👑 الترقية لمدى الحياة VIP",
    paywallLoginBtn: "اشتريت بالفعل؟ تسجيل الدخول والاستعادة",
    toastLuckActivated: "تم تفعيل حظ اليوم! 🍀",
    toastVipActivated: "👑 تم تفعيل هالة الحظ الذهبية VIP!",
    toastUpgradePrompt: "👑 قم بالترقية للحصول على شحن غير محدود وبلورات الثروة!",
    toastVipRecharged: "👑 تم شحن الهالة الملكية إلى الحد الأقصى! ✨",
    toastAlreadyPro: "أنت تمتلك عضوية VIP مدى الحياة! 👑",
    toastExtPayReady: "جهاز للدفع الإلكتروني ✨",
    toastSoundOn: "الصوت قيد التشغيل 🔔",
    toastSoundMuted: "الصوت مكتوم 🔕",
    toastCopied: "تم نسخ حكمة ورموز الحظ! 🍀",
    toastAlarmSet: "🔔 تم ضبط تذكير الساعة الذهبية!",
    toastAlarmCleared: "🔕 تم إيقاف تذكير الساعة الذهبية",
    toastSkinUnlocked: "تم تغيير مظهر التميمة بنجاح ✨",
    toastSkinProOnly: "👑 مظهر حصري: قم بالترقية لفتح جميع المظاهر!",
    toastIntentionSaved: "تم تثبيت الهدف ومباركته لليوم! 🎯✨"
  },
  ru: {
    brandTitle: "ПОДКОВА УДАЧИ",
    trialDaysText: (d) => `${d} дн. триал`,
    trialExpired: "Триал окончен",
    proLabel: "PRO",
    proLabelVip: "PRO VIP",
    statusIdleFree: "НАЖМИТЕ ДЛЯ УДАЧИ",
    statusIdlePro: "НАЖМИТЕ ДЛЯ VIP УДАЧИ",
    subtextIdleFree: "Древний талисман готов благословить ваш день",
    subtextIdlePro: "👑 Вечный VIP талисман готов принести изобилие",
    statusActiveFree: "✨ ДЕНЬ УДАЧИ АКТИВИРОВАН ✨",
    statusActivePro: "👑 ЗОЛОТАЯ VIP АУРА АКТИВНА 👑",
    subtextActiveFree: "Аура заряжена. Удача и счастливый случай на вашей стороне.",
    subtextActivePro: "Безлимитный резонанс удачи включен. Все возможности совпадают.",
    auraLabel: "УРОВЕНЬ АУРЫ УДАЧИ",
    fortuneBadgeDaily: "ПОСЛАНИЕ ДНЯ",
    fortuneBadgeVip: "👑 VIP ОРАКУЛ",
    fortuneIdleText: "Коснитесь золотой подковы, чтобы раскрыть пророчество и знаки удачи.",
    titleNumber: "ЧИСЛО УДАЧИ",
    titleHour: "ЗОЛОТОЙ ЧАС",
    titleColor: "ЦВЕТ УДАЧИ",
    titleDirection: "НАПРАВЛЕНИЕ",
    titleElement: "СТИХИЯ",
    titleCrystal: "КРИСТАЛЛ",
    lockText: "VIP Матрица Энергии и Богатства",
    proUnlockTag: "Открыть PRO 👑",
    intentionPlaceholder: "Закрепите цель дня (сделка, экзамен, встреча)...",
    ibLabel: "Благословлено на:",
    btnActivate: "АКТИВИРОВАТЬ УДАЧУ",
    btnRecharge: "ПЕРЕЗАРЯДИТЬ АУРУ",
    shareBtnLabel: "Поделиться",
    settingsTitle: "НАСТРОЙКИ",
    langSectionTitle: "ВЫБОР ЯЗЫКА",
    themeSectionTitle: "ОФОРМЛЕНИЕ ПОДКОВЫ",
    themeGoldName: "Имперское Золото",
    themeEmeraldName: "Изумрудное Сияние",
    themeDiamondName: "Алмазный Квант",
    themeRoseName: "Розовое Золото",
    vipStatusTitle: "Разблокируйте все темы и оракулы",
    vipStatusDesc: "Вечный Pro открывает доступ ко всем талисманам",
    vipStatusBtn: "ОБНОВИТЬ",
    paywallTitle: "7-ДНЕВНЫЙ ТРИАЛ ЗАВЕРШЕН",
    paywallDesc: "Ваши 7 дней ежедневных благословений завершились. Сохраните мощный поток удачи с вечным доступом Pro.",
    perk1: "Безлимитная ежедневная зарядка ауры",
    perk2: "Глубокие оракулы изобилия и процветания",
    perk3: "Полная энергетическая матрица (кристалл, стихия, сторона)",
    perk4: "Постоянная защита талисмана удачи",
    paywallBtnText: "👑 ПЕРЕЙТИ НА ВЕЧНЫЙ PRO",
    paywallLoginBtn: "Уже покупали? Войти и восстановить",
    toastLuckActivated: "Удача на сегодня активирована! 🍀",
    toastVipActivated: "👑 Золотая VIP аура активирована!",
    toastUpgradePrompt: "👑 Перейдите на Pro для безлимитной энергии и кристаллов!",
    toastVipRecharged: "👑 VIP аура заряжена на максимум! ✨",
    toastAlreadyPro: "У вас вечный доступ VIP Pro! 👑",
    toastExtPayReady: "Оплата ExtensionPay готова ✨",
    toastSoundOn: "Звук включен 🔔",
    toastSoundMuted: "Звук выключен 🔕",
    toastCopied: "Пророчество и знаки скопированы! 🍀",
    toastAlarmSet: "🔔 Напоминание на Золотой час установлено!",
    toastAlarmCleared: "🔕 Напоминание на Золотой час отключено",
    toastSkinUnlocked: "Облик талисмана применен ✨",
    toastSkinProOnly: "👑 VIP облик: Обновитесь до Pro, чтобы открыть все стили!",
    toastIntentionSaved: "Цель дня закреплена и благословлена! 🎯✨"
  },
  es: {
    brandTitle: "HERRADURA SUERTE",
    trialDaysText: (d) => `${d}d Prueba`,
    trialExpired: "Prueba Vencida",
    proLabel: "PRO",
    proLabelVip: "PRO VIP",
    statusIdleFree: "TOCA PARA RECIBIR SUERTE",
    statusIdlePro: "TOCA PARA SUERTE VIP",
    subtextIdleFree: "Talismán ancestral listo para bendecir tu día",
    subtextIdlePro: "👑 Talismán VIP eterno listo para darte abundancia",
    statusActiveFree: "✨ DÍA DE SUERTE ACTIVO ✨",
    statusActivePro: "👑 AURA DORADA VIP ACTIVA 👑",
    subtextActiveFree: "Aura cargada al máximo. La serendipia está de tu lado.",
    subtextActivePro: "Resonancia ilimitada activa. Todas las oportunidades se alinean.",
    auraLabel: "NIVEL DE AURA DE SUERTE",
    fortuneBadgeDaily: "BENDICIÓN DIARIA",
    fortuneBadgeVip: "👑 ORÁCULO VIP",
    fortuneIdleText: "Toca la herradura dorada para desbloquear tu oráculo y fichas de suerte.",
    titleNumber: "NÚMERO DE SUERTE",
    titleHour: "HORA DORADA",
    titleColor: "COLOR DE SUERTE",
    titleDirection: "DIRECCIÓN",
    titleElement: "ELEMENTO",
    titleCrystal: "CRISTAL",
    lockText: "Matriz VIP de Riqueza y Energía",
    proUnlockTag: "Desbloquear PRO 👑",
    intentionPlaceholder: "Ancla tu meta de hoy (reunión, examen, contrato)...",
    ibLabel: "Bendecido para:",
    btnActivate: "ACTIVAR SUERTE DE HOY",
    btnRecharge: "RECARGAR AURA",
    shareBtnLabel: "Compartir",
    settingsTitle: "AJUSTES",
    langSectionTitle: "SELECCIONAR IDIOMA",
    themeSectionTitle: "TEMA DE LA HERRADURA",
    themeGoldName: "Oro Imperial",
    themeEmeraldName: "Esmeralda Radiante",
    themeDiamondName: "Diamante Cuántico",
    themeRoseName: "Oro Rosa Amor",
    vipStatusTitle: "Desbloquea Todos los Temas",
    vipStatusDesc: "Pro de por vida te da acceso a todas las skins",
    vipStatusBtn: "MEJORAR",
    paywallTitle: "PRUEBA DE 7 DÍAS FINALIZADA",
    paywallDesc: "Tus 7 días de bendiciones gratuitas han terminado. Mantén tu racha positiva con Pro de por vida.",
    perk1: "Recargas diarias ilimitadas de aura",
    perk2: "Profecías profundas de riqueza y manifestación",
    perk3: "Matriz completa de energía (dirección, cristal, elemento)",
    perk4: "Protección permanente del talismán de la suerte",
    paywallBtnText: "👑 MEJORAR A PRO DE POR VIDA",
    paywallLoginBtn: "¿Ya compraste? Restaurar / Iniciar sesión",
    toastLuckActivated: "¡Día de suerte activado! 🍀",
    toastVipActivated: "👑 ¡Aura dorada VIP activada!",
    toastUpgradePrompt: "👑 ¡Mejora a Pro para recargas ilimitadas y gemas de riqueza!",
    toastVipRecharged: "👑 ¡Aura VIP recargada al máximo! ✨",
    toastAlreadyPro: "¡Ya tienes acceso VIP Pro de por vida! 👑",
    toastExtPayReady: "Pago listo (lucky-horseshoe) ✨",
    toastSoundOn: "Sonido activado 🔔",
    toastSoundMuted: "Sonido silenciado 🔕",
    toastCopied: "¡Fortuna y fichas copiadas al portapapeles! 🍀",
    toastAlarmSet: "🔔 ¡Recordatorio de Hora Dorada configurado!",
    toastAlarmCleared: "🔕 Recordatorio de Hora Dorada desactivado",
    toastSkinUnlocked: "Tema de talismán aplicado ✨",
    toastSkinProOnly: "👑 Tema VIP: ¡Mejora a Pro para desbloquear todos los temas!",
    toastIntentionSaved: "¡Meta anclada y bendecida para hoy! 🎯✨"
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
    number: (absHash % 77) + 1,
    hour: LUCKY_HOURS[(absHash >> 4) % LUCKY_HOURS.length],
    getFortune: (lang, isPro) => {
      const source = isPro ? PRO_VIP_FORTUNES : FREE_FORTUNES;
      const list = source[lang] || source.en;
      return list[absHash % list.length];
    },
    getColor: (lang) => {
      const list = LUCKY_COLORS[lang] || LUCKY_COLORS.en;
      return list[(absHash >> 2) % list.length];
    },
    getDirection: (lang) => {
      const list = PRO_DIRECTIONS[lang] || PRO_DIRECTIONS.en;
      return list[(absHash >> 3) % list.length];
    },
    getElement: (lang) => {
      const list = PRO_ELEMENTS[lang] || PRO_ELEMENTS.en;
      return list[(absHash >> 5) % list.length];
    },
    getCrystal: (lang) => {
      const list = PRO_CRYSTALS[lang] || PRO_CRYSTALS.en;
      return list[(absHash >> 1) % list.length];
    }
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
    this.trialPill = document.getElementById('trialPill');
    this.trialDaysText = document.getElementById('trialDaysText');
    this.proBtn = document.getElementById('proBtn');
    this.proLabel = document.getElementById('proLabel');
    this.streakCount = document.getElementById('streakCount');
    this.soundToggle = document.getElementById('soundToggle');
    this.soundOnIcon = document.getElementById('soundOnIcon');
    this.soundOffIcon = document.getElementById('soundOffIcon');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.settingsBackdrop = document.getElementById('settingsBackdrop');
    this.settingsCloseBtn = document.getElementById('settingsCloseBtn');
    this.settingsTitle = document.getElementById('settingsTitle');
    this.langSectionTitle = document.getElementById('langSectionTitle');
    this.themeSectionTitle = document.getElementById('themeSectionTitle');
    this.themeGoldName = document.getElementById('themeGoldName');
    this.themeEmeraldName = document.getElementById('themeEmeraldName');
    this.themeDiamondName = document.getElementById('themeDiamondName');
    this.themeRoseName = document.getElementById('themeRoseName');
    this.vipStatusTitle = document.getElementById('vipStatusTitle');
    this.vipStatusDesc = document.getElementById('vipStatusDesc');
    this.settingsProBtn = document.getElementById('settingsProBtn');
    this.langChoiceBtns = document.querySelectorAll('.lang-choice-btn');
    this.themeCards = document.querySelectorAll('.theme-card');

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
    this.lang = 'en'; // default language English
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
    // Settings modal open/close
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => this.openSettings());
    }
    if (this.settingsCloseBtn) {
      this.settingsCloseBtn.addEventListener('click', () => this.closeSettings());
    }
    if (this.settingsBackdrop) {
      this.settingsBackdrop.addEventListener('click', () => this.closeSettings());
    }

    // Language choice buttons inside Settings
    if (this.langChoiceBtns) {
      this.langChoiceBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetLang = btn.getAttribute('data-lang');
          this.setLanguage(targetLang);
        });
      });
    }

    // Theme / Skin choice cards inside Settings
    if (this.themeCards) {
      this.themeCards.forEach((card) => {
        card.addEventListener('click', () => {
          const skin = card.getAttribute('data-skin');
          this.handleSkinSelect(skin);
        });
      });
    }

    // Pro buttons & Lock overlays
    if (this.proBtn) {
      this.proBtn.addEventListener('click', () => this.handleProClick());
    }
    if (this.proUnlockTag) {
      this.proUnlockTag.addEventListener('click', () => this.handleProClick());
    }
    if (this.settingsProBtn) {
      this.settingsProBtn.addEventListener('click', () => this.handleProClick());
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

  openSettings() {
    this.sound.playTapSparkle();
    this.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.settingsModal.classList.add('hidden');
  }

  setLanguage(lang) {
    if (!I18N[lang]) return;
    this.lang = lang;
    Storage.set({ lang: this.lang });

    // Update active class on language choice buttons
    this.langChoiceBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    this.sound.playTapSparkle();
    this.applyLanguage();
    this.renderInitialUI();

    const langNames = {
      en: 'English',
      fa: 'فارسی',
      ar: 'العربية',
      ru: 'Русский',
      es: 'Español'
    };
    this.showToast(`Language: ${langNames[lang] || lang}`);
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
    
    // 1. Language preference: defaults to English unless user explicitly chose one
    if (data.lang && I18N[data.lang]) {
      this.lang = data.lang;
    } else {
      this.lang = 'en';
    }

    // Update active button on settings lang grid
    if (this.langChoiceBtns) {
      this.langChoiceBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === this.lang);
      });
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

  applyLanguage() {
    const t = I18N[this.lang] || I18N.en;
    const isRtl = this.lang === 'fa' || this.lang === 'ar';

    // Toggle RTL class on body for Persian and Arabic
    document.body.classList.toggle('rtl', isRtl);

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

    // Settings modal texts
    this.settingsTitle.textContent = t.settingsTitle;
    this.langSectionTitle.textContent = t.langSectionTitle;
    this.themeSectionTitle.textContent = t.themeSectionTitle;
    this.themeGoldName.textContent = t.themeGoldName;
    this.themeEmeraldName.textContent = t.themeEmeraldName;
    this.themeDiamondName.textContent = t.themeDiamondName;
    this.themeRoseName.textContent = t.themeRoseName;
    this.vipStatusTitle.textContent = t.vipStatusTitle;
    this.vipStatusDesc.textContent = t.vipStatusDesc;
    this.settingsProBtn.textContent = t.vipStatusBtn;

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
    const t = I18N[this.lang] || I18N.en;
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

    // Update active class on theme cards in Settings
    if (this.themeCards) {
      this.themeCards.forEach((card) => {
        card.classList.toggle('active', card.getAttribute('data-skin') === skin);
      });
    }

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
      const t = I18N[this.lang] || I18N.en;
      this.showToast(t.toastSkinUnlocked);
    }
  }

  toggleGoldenHourAlarm() {
    const t = I18N[this.lang] || I18N.en;
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
    const t = I18N[this.lang] || I18N.en;
    this.showToast(t.toastIntentionSaved);
  }

  updateStreakDots() {
    const current = Math.max(0, Math.min(7, this.streak));
    this.streakDots.forEach((dot) => {
      const day = parseInt(dot.getAttribute('data-day'), 10);
      dot.classList.toggle('active', day <= current);
    });
  }

  renderInitialUI() {
    const t = I18N[this.lang] || I18N.en;

    // Human readable date
    const d = new Date();
    const options = { month: 'short', day: 'numeric', weekday: 'short' };
    this.fortuneDate.textContent = d.toLocaleDateString(undefined, options);

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
    const t = I18N[this.lang] || I18N.en;
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
    const t = I18N[this.lang] || I18N.en;

    this.horseshoeBtn.classList.add('is-active');
    if (this.isProUser) {
      this.horseshoeBtn.classList.add('is-pro-active');
    }

    this.statusHeading.textContent = this.isProUser ? t.statusActivePro : t.statusActiveFree;
    this.statusSubtext.textContent = this.isProUser ? t.subtextActivePro : t.subtextActiveFree;
    
    // Animate aura fill
    this.auraFill.style.width = '100%';
    this.auraPercent.textContent = '100%';
    
    // Set fortune
    const quote = this.dailyData.getFortune(this.lang, this.isProUser);
    this.fortuneText.textContent = `“${quote}”`;
    
    // Standard tokens
    this.tokenNumber.textContent = this.dailyData.number;
    this.tokenHour.textContent = this.dailyData.hour;
    this.tokenColor.textContent = this.dailyData.getColor(this.lang);

    // Pro tokens
    this.tokenDirection.textContent = this.dailyData.getDirection(this.lang);
    this.tokenElement.textContent = this.dailyData.getElement(this.lang);
    this.tokenCrystal.textContent = this.dailyData.getCrystal(this.lang);

    // Buttons
    this.btnLabel.textContent = t.btnRecharge;
    this.activateBtn.classList.add('active-mode');
    this.shareBtn.classList.remove('hidden');

    this.streakCount.textContent = Math.max(1, this.streak);
    this.updateStreakDots();
  }

  async handleActivation(event) {
    const t = I18N[this.lang] || I18N.en;

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
    const t = I18N[this.lang] || I18N.en;
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
    const t = I18N[this.lang] || I18N.en;
    this.showToast(this.sound.enabled ? t.toastSoundOn : t.toastSoundMuted);
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
    const quote = this.dailyData.getFortune(this.lang, this.isProUser);
    const color = this.dailyData.getColor(this.lang);
    const direction = this.dailyData.getDirection(this.lang);
    const crystal = this.dailyData.getCrystal(this.lang);
    const goal = this.intentionInput.value.trim();

    let text;
    if (this.lang === 'fa') {
      text = `🍀 برکت و فال امروز نعل خوش‌شانسی من:\n` +
        `«${quote}»\n` +
        (goal ? `🎯 هدف متبرک امروز: ${goal}\n` : '') +
        `🔢 عدد شانس: ${this.dailyData.number}\n` +
        `⏰ ساعت طلایی: ${this.dailyData.hour}\n` +
        `🎨 رنگ شانس: ${color}\n` +
        (this.isProUser ? `🧭 جهت شانس: ${direction}\n💎 سنگ ثروت: ${crystal}\n` : '') +
        `🔥 زنجیره اقبال: ${this.streak} روز مداوم\n` +
        `امروز اتفاقات شگفت‌انگیزی در انتظار توست! ✨`;
    } else if (this.lang === 'ar') {
      text = `🍀 بركة وفأل اليوم من حدوة الحظ:\n` +
        `«${quote}»\n` +
        (goal ? `🎯 الهدف المبارك: ${goal}\n` : '') +
        `🔢 رقم الحظ: ${this.dailyData.number}\n` +
        `⏰ الساعة الذهبية: ${this.dailyData.hour}\n` +
        `🎨 لون الحظ: ${color}\n` +
        (this.isProUser ? `🧭 اتجاه الحظ: ${direction}\n💎 بلورة الثروة: ${crystal}\n` : '') +
        `🔥 سلسلة الحظ: ${this.streak} أيام متواصلة\n` +
        `أيامك مليئة بالخير والبركة! ✨`;
    } else if (this.lang === 'ru') {
      text = `🍀 Послание дня от Подковы Удачи:\n` +
        `«${quote}»\n` +
        (goal ? `🎯 Цель дня: ${goal}\n` : '') +
        `🔢 Число удачи: ${this.dailyData.number}\n` +
        `⏰ Золотой час: ${this.dailyData.hour}\n` +
        `🎨 Цвет удачи: ${color}\n` +
        (this.isProUser ? `🧭 Направление: ${direction}\n💎 Кристалл: ${crystal}\n` : '') +
        `🔥 Серия удачи: ${this.streak} дн.\n` +
        `Пусть день будет наполнен успехом! ✨`;
    } else if (this.lang === 'es') {
      text = `🍀 Bendición de hoy de la Herradura de la Suerte:\n` +
        `“${quote}”\n` +
        (goal ? `🎯 Meta bendecida: ${goal}\n` : '') +
        `🔢 Número de suerte: ${this.dailyData.number}\n` +
        `⏰ Hora dorada: ${this.dailyData.hour}\n` +
        `🎨 Color de suerte: ${color}\n` +
        (this.isProUser ? `🧭 Dirección: ${direction}\n💎 Cristal: ${crystal}\n` : '') +
        `🔥 Racha de suerte: ${this.streak} días\n` +
        `¡Que la fortuna te acompañe hoy! ✨`;
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

    const t = I18N[this.lang] || I18N.en;
    navigator.clipboard.writeText(text).then(() => {
      this.showToast(t.toastCopied);
    }).catch(() => {
      this.showToast(t.toastCopied);
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

// Initialize on DOM Ready and expose globally for inspection
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LuckyHorseshoeApp();
});
