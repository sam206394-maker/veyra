import type { CapacitorConfig } from '@capacitor/cli';

// Change this to your deployed Veyra URL after the Vercel deploy:
// e.g. "https://veyra-yourname.vercel.app"
const VEYRA_SERVER_URL = process.env.VEYRA_SERVER_URL ?? "https://your-app.vercel.app";

const config: CapacitorConfig = {
  appId: 'com.veyra.app',
  appName: 'Veyra',
  webDir: 'www',
  server: {
    url: VEYRA_SERVER_URL,
    androidScheme: 'https',
    cleartext: false,
  },
};

export default config;
