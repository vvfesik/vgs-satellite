const ElectronCookies = require('@exponent/electron-cookies');

window.enableCookies = function() {
  ElectronCookies.enable({ origin: 'localhoste://satellite' });
};
