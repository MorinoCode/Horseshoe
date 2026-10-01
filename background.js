/**
 * Lucky Horseshoe - Background Service Worker (Manifest V3)
 * Manages extension lifecycle, badge indicators, ExtensionPay, daily status sync,
 * and Golden Hour reminders.
 */

importScripts('ExtPay.js');

// Initialize ExtensionPay for monetization
const extpay = ExtPay('lucky-horseshoe');
extpay.startBackground();

// Helper to get today's date string YYYY-MM-DD in local time
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Update the extension toolbar badge based on activation status & Pro status
async function updateBadge(isActivatedToday) {
  if (isActivatedToday) {
    try {
      const testData = await new Promise((r) => chrome.storage.local.get(['proTestOverride'], r));
      if (testData && testData.proTestOverride) {
        chrome.action.setBadgeText({ text: '👑' });
        chrome.action.setBadgeBackgroundColor({ color: '#D97706' }); // Royal Gold
        chrome.action.setTitle({ title: 'Lucky Horseshoe (VIP Pro Active 👑)' });
        return;
      }
      const user = await extpay.getUser();
      if (user && user.paid) {
        chrome.action.setBadgeText({ text: '👑' });
        chrome.action.setBadgeBackgroundColor({ color: '#D97706' }); // Royal Gold
        chrome.action.setTitle({ title: 'Lucky Horseshoe (VIP Pro Active 👑)' });
        return;
      }
    } catch {
      // Fallback to standard badge
    }
    chrome.action.setBadgeText({ text: '🍀' });
    chrome.action.setBadgeBackgroundColor({ color: '#10B981' }); // Emerald green
    chrome.action.setTitle({ title: 'Lucky Horseshoe (Luck Active ✨)' });
  } else {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Lucky Horseshoe (Tap to activate luck)' });
  }
}

// Check current state from storage and refresh badge
function refreshDailyState() {
  chrome.storage.local.get(['lastActivatedDate', 'goldenHourAlarmEnabled', 'goldenHourTime'], (result) => {
    const today = getTodayDateString();
    const isActivated = result.lastActivatedDate === today;
    updateBadge(isActivated);

    if (result.goldenHourAlarmEnabled && result.goldenHourTime) {
      scheduleGoldenHourAlarm(result.goldenHourTime);
    }
  });
}

// Schedule Golden Hour reminder alarm
function scheduleGoldenHourAlarm(hourStr) {
  if (!hourStr || typeof chrome.alarms === 'undefined') return;
  const match = hourStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return;
  let [_, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (period.toUpperCase() === 'PM' && h < 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;

  const target = new Date();
  target.setHours(h, m, 0, 0);

  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }

  chrome.alarms.create('golden_hour_alarm', { when: target.getTime() });
}

// Trigger desktop notification when Golden Hour arrives
if (typeof chrome.alarms !== 'undefined') {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'golden_hour_alarm') {
      if (typeof chrome.notifications !== 'undefined') {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: '🍀 Your Golden Hour Has Arrived!',
          message: 'Your cosmic lucky hour is active now. Take a deep breath, focus your intention, and let serendipity work for you! ✨',
          priority: 2
        });
      }
    }
  });
}

// On installation or extension update
chrome.runtime.onInstalled.addListener(() => {
  refreshDailyState();
});

// On browser startup
chrome.runtime.onStartup.addListener(() => {
  refreshDailyState();
});

// Listen for storage changes from popup
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.lastActivatedDate || changes.proTestOverride) {
      const today = getTodayDateString();
      chrome.storage.local.get(['lastActivatedDate'], (res) => {
        updateBadge(res.lastActivatedDate === today);
      });
    }
    if (changes.goldenHourAlarmEnabled || changes.goldenHourTime) {
      chrome.storage.local.get(['goldenHourAlarmEnabled', 'goldenHourTime'], (res) => {
        if (res.goldenHourAlarmEnabled && res.goldenHourTime) {
          scheduleGoldenHourAlarm(res.goldenHourTime);
        } else {
          chrome.alarms.clear('golden_hour_alarm');
        }
      });
    }
  }
});
