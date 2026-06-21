/* Remove-Ads billing glue (RevenueCat).  Load this AFTER index.html's script,
   e.g. add  <script src="billing-glue.js"></script>  to www/index.html, OR paste
   into index.html. It wires the game's removeAds()/restorePurchases() to Play Billing.
   Product (Play Console -> Monetize -> In-app products, NON-consumable): "remove_ads".
   Get your RevenueCat public SDK key from app.revenuecat.com. */
(function () {
  const RC_KEY = 'goog_XXXXXXXXXXXXXXXXXXXX';   // <-- your RevenueCat Google public key
  const PRODUCT = 'remove_ads';
  function P() { return window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.Purchases; }

  async function init() {
    const p = P(); if (!p) return;
    try {
      await p.configure({ apiKey: RC_KEY });
      const info = await p.getCustomerInfo();
      if (info && info.customerInfo && info.customerInfo.entitlements &&
          info.customerInfo.entitlements.active && info.customerInfo.entitlements.active['ad_free']) {
        if (typeof grantAdFree === 'function') grantAdFree(); // already owned
      }
    } catch (e) {}
  }

  // called by the game's removeAds() when a billing plugin is present
  window.onRemoveAdsPurchase = async function () {
    const p = P(); if (!p) return;
    try {
      const offerings = await p.getOfferings();
      await p.purchaseStoreProduct({ product: { identifier: PRODUCT } });
      if (typeof grantAdFree === 'function') grantAdFree();
    } catch (e) { /* user cancelled / error */ }
  };

  // override the game's restorePurchases() to query Play Billing
  window.restorePurchases = async function () {
    const p = P(); if (!p) { return; }
    try {
      const info = await p.restorePurchases();
      const ent = info && info.customerInfo && info.customerInfo.entitlements &&
                  info.customerInfo.entitlements.active;
      if (ent && ent['ad_free'] && typeof grantAdFree === 'function') grantAdFree();
    } catch (e) {}
  };

  if (window.Capacitor) document.addEventListener('deviceready', init), init();
})();
