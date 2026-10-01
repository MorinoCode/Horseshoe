/**
 * Lucky Horseshoe - Background Service Worker (Manifest V3)
 * Manages extension lifecycle, badge indicators, ExtensionPay, and daily status sync.
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
  chrome.storage.local.get(['lastActivatedDate'], (result) => {
    const today = getTodayDateString();
    const isActivated = result.lastActivatedDate === today;
    updateBadge(isActivated);
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
  if (areaName === 'local' && changes.lastActivatedDate) {
    const today = getTodayDateString();
    const isActivated = changes.lastActivatedDate.newValue === today;
    updateBadge(isActivated);
  }
});
