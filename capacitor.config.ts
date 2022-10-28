import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.itesm.sostek',
  appName: 'sostek',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    url: 'http://192.168.1.7:3000'
  }
};

export default config;
