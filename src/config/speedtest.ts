export const SPEEDTEST_SERVER = process.env.NEXT_PUBLIC_SPEEDTEST_SERVER;

export const SPEEDTEST_ENDPOINTS = {
  download: "garbage.php",
  upload: "empty.php",
  ping: "empty.php",
};

export const SPEEDTEST_SETTINGS = {
  downloadSizeMb: 25,
  uploadSizeMb: 10,
  pingSamples: 6,
};
