import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
 // Read version from package.json
 const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
 return {
   server: {
     host: "localhost",
     port: 8080,
   },
   plugins: [
     react(),
     mode === 'development' &&
     componentTagger(),
   ].filter(Boolean),
   resolve: {
     alias: {
       "@": path.resolve(__dirname, "./src"),
     },
   },
   define: {
     "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
   },
 };
});
