const tw = require('tailwindcss');
const path = require('path');
(async () => {
  const css = '@import "tailwindcss"; @layer base { body { @apply bg-background; } }';
  try {
    const out = await tw.compile(css, {
      from: path.resolve('src/app/globals.css'),
      config: path.resolve('tailwind.config.js'),
    });
    console.log('OK');
    console.log(out.css.slice(0, 200));
  } catch (e) {
    console.error('FAILED');
    console.error(e);
  }
})();
