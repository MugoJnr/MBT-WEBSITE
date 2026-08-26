const fs = require("fs");
let s = fs.readFileSync("build.mjs", "utf8");

// 1. remove the manual ?v= on css/js (the global pass will handle it)
s = s.replace('href="/assets/css/main.css?v={{VER}}"', 'href="/assets/css/main.css"');
s = s.replace('<script src="/assets/js/main.js?v=${ASSET_VER}" defer></script>', '<script src="/assets/js/main.js" defer></script>');

// 2. add a global asset-versioning pass before writeFileSync
const anchor = "  const outName = page.slug === \"\" ? \"index.html\" : `${page.slug}.html`;";
const pass = `  // Version every local asset reference so deploys always serve fresh files
  const finalHtml = html.replace(
    /(\\/assets\\/(?:img|css|js)\\/[a-z0-9\\-]+\\.(?:webp|jpg|jpeg|png|css|js))(?!\\?)/g,
    "$1?v=" + ASSET_VER
  );
`;
if (!s.includes("Version every local asset")) {
  s = s.replace(anchor, pass + anchor);
  s = s.replace("writeFileSync(outName, html);", "writeFileSync(outName, finalHtml);");
}
fs.writeFileSync("build.mjs", s);
console.log("build.mjs updated");
