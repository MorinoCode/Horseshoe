# Privacy Policy for Lucky Horseshoe

**Last Updated: October 1, 2026**

Lucky Horseshoe ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how information is handled when you use the Lucky Horseshoe Chrome Extension.

---

### 1. Information Collection and Usage

**Lucky Horseshoe does NOT collect, track, store, or sell any personal data, browsing history, web traffic, or sensitive user information.**

All core features of the extension operate locally on your device:
- **Daily Fortunes & Numbers:** Generated locally using deterministic mathematical algorithms based on your local device date.
- **Audio Synthesis:** Sound effects and crystal chimes are synthesized directly in real-time via the browser's native Web Audio API without connecting to external audio servers.
- **Intention / Goal Anchor:** Any personal goals or intentions you write are stored solely on your local device via Chrome's `chrome.storage.local` API and never leave your computer.
- **Language & Theme Preferences:** Stored locally in `chrome.storage.local`.

---

### 2. Permissions Justification

Lucky Horseshoe requests only the minimal permissions strictly necessary to deliver its features:
- **`storage`**: Used exclusively to save your selected theme, language preference, daily streak counter, and optional daily intention text locally on your device.
- **`alarms`**: Used to schedule a local timer for the optional Golden Hour daily reminder when you enable the bell notification.
- **`notifications`**: Used to show a subtle local desktop alert when your scheduled Golden Hour arrives.
- **`https://extensionpay.com/*`**: Used solely to verify Pro VIP license activations and payments securely through ExtensionPay.

---

### 3. Payments and Billing (ExtensionPay & Stripe)

We offer an optional Lifetime Pro VIP upgrade. Payment processing is handled by **ExtensionPay** and **Stripe**, industry-leading secure payment processors:
- We never see, collect, or store your credit card details, bank information, or billing address.
- All transactions are encrypted and processed directly through Stripe's certified PCI-DSS compliant infrastructure.
- Please refer to [ExtensionPay's Privacy Policy](https://extensionpay.com) and [Stripe's Privacy Policy](https://stripe.com/privacy) for details on payment data handling.

---

### 4. Third-Party Services & Remote Code

- The extension does **not** load or execute any remote hosted code.
- The extension does **not** integrate third-party analytics trackers, advertising networks, or tracking cookies.
- No user data is transferred or sold to any third party for marketing or advertising purposes.

---

### 5. Data Retention & Deletion

Since all user preferences and daily intentions are stored locally on your device in `chrome.storage.local`, you can completely erase all data at any time by simply uninstalling the extension or clearing extension data in `chrome://extensions`.

---

### 6. Children's Privacy

Lucky Horseshoe does not knowingly collect or solicit any personal information from children under the age of 13.

---

### 7. Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be posted to this page with an updated "Last Updated" date.

---

### 8. Contact Us

If you have any questions or feedback regarding this Privacy Policy, please open an issue on our official GitHub repository:
- **GitHub Repository:** [https://github.com/MorinoCode/Horseshoe](https://github.com/MorinoCode/Horseshoe)
