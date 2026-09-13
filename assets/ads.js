/* Adsterra sitewide ads: Popunder + Social Bar
   Loaded once per page. Safe to include on every page via:
   <script src="assets/ads.js"></script>
*/
(function () {
  function loadScript(src) {
    var s = document.createElement('script');
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }

  // Popunder
  loadScript('https://pl31322388.profitableratecpmnetwork.com/c3/4b/49/c34b499a3bfc34a41623c84177b082d5.js');

  // Social Bar
  loadScript('https://pl31322389.profitableratecpmnetwork.com/3d/d0/9d/3dd09d2a01d35ad1a9a5d8fbcd561f29.js');
})();

/* Responsive banner helper: injects 728x90 on wider screens, 320x50 on narrow screens.
   Usage: <div id="some-id"></div><script>window.renderResponsiveBanner('some-id');</script>
*/
window.renderResponsiveBanner = function (containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var isMobile = window.innerWidth < 768;

  var optsScript = document.createElement('script');
  optsScript.type = 'text/javascript';
  optsScript.text = isMobile
    ? "atOptions = {'key':'99c62e21ec2af735f02b158197639015','format':'iframe','height':50,'width':320,'params':{}};"
    : "atOptions = {'key':'7c60d2ac039b437954acdbef1c16da3f','format':'iframe','height':90,'width':728,'params':{}};";
  el.appendChild(optsScript);

  var invokeScript = document.createElement('script');
  invokeScript.src = isMobile
    ? 'https://www.highrevenueformat.com/99c62e21ec2af735f02b158197639015/invoke.js'
    : 'https://www.highrevenueformat.com/7c60d2ac039b437954acdbef1c16da3f/invoke.js';
  el.appendChild(invokeScript);
};

/* 300x250 banner helper for sidebar widgets.
   Usage: <div id="some-id"></div><script>window.renderSidebarBanner('some-id');</script>
*/
window.renderSidebarBanner = function (containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var optsScript = document.createElement('script');
  optsScript.type = 'text/javascript';
  optsScript.text = "atOptions = {'key':'a85a8e92e1b52b20cca70cf9ff2d794c','format':'iframe','height':250,'width':300,'params':{}};";
  el.appendChild(optsScript);

  var invokeScript = document.createElement('script');
  invokeScript.src = 'https://www.highrevenueformat.com/a85a8e92e1b52b20cca70cf9ff2d794c/invoke.js';
  el.appendChild(invokeScript);
};
