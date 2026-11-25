import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  // Copied from node_modules at build time; not our code.
  { ignores: ["public/ffmpeg/**", "public/pdfjs/**"] },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
