import type { CapacitorConfig } from '@capacitor/cli';

// Set the repository variable VEYRA_SERVER_URL (or this file) to your
// deployed Veyra URL, e.g. "https://veyra.vercel.app".
const VEYRA_SERVER_URL =
  (process.env.VEYRA_SERVER_URL ?? "").trim() || "https://your-app.vercel.app";

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
