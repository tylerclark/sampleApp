import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.staging.umbrella.vet',
  appName: 'umbrella-app-staging',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
