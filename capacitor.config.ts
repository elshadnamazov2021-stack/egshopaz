import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.egshop',
  appName: 'EG Shop',
  webDir: 'dist',
  server: {
    // Mobil tətbiq birbaşa canlı sayta qoşulur — eyni dizayn, eyni funksiya, avtomatik sinxronizasiya
    url: 'https://egshopaz.lovable.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
