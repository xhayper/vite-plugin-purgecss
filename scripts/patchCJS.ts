/**
MIT License

Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

It converts

```ts
exports.default = vuePlugin;
exports.parseVueRequest = parseVueRequest;
```

to

```ts
module.exports = vuePlugin;
module.exports.default = vuePlugin;
module.exports.parseVueRequest = parseVueRequest;
```
*/

import { readFileSync, writeFileSync } from 'node:fs';
import colors from 'picocolors';

const indexPath = 'dist/index.cjs';
let code = readFileSync(indexPath, 'utf-8');

const matchMixed = code.match(/\nexports.default = (\w+);/);
if (matchMixed) {
  const name = matchMixed[1];

  const lines = code.trimEnd().split('\n');

  // search from the end to prepend `modules.` to `export[xxx]`
  for (let i = lines.length - 1; i > 0; i--) {
    if (lines[i].startsWith('exports')) lines[i] = 'module.' + lines[i];
    else {
      // at the beginning of exports, export the default function
      lines[i] += `\nmodule.exports = ${name};`;
      break;
    }
  }

  writeFileSync(indexPath, lines.join('\n'));

  console.log(colors.bold(`${indexPath} CJS patched`));
  process.exit(0);
}

const matchDefault = code.match(/\nmodule.exports = (\w+);/);

if (matchDefault) {
  code += `module.exports.default = ${matchDefault[1]};\n`;
  writeFileSync(indexPath, code);
  console.log(colors.bold(`${indexPath} CJS patched`));
  process.exit(0);
}

console.error(colors.red(`${indexPath} CJS patch failed`));
process.exit(1);
