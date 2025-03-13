import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["script.js"],
  bundle: true,
  format: "iife",
  outfile: "dist/script.js",
  minify: true
});
