import { PurgeCSS, UserDefinedOptions } from 'purgecss';
import { PluginOption } from 'vite';

export type Options = Omit<UserDefinedOptions, 'content' | 'css'>;

export default function purgecss(options?: Options): PluginOption {
  let htmlContent = '';
  return {
    name: 'purgecss',
    enforce: 'post',
    transformIndexHtml(html) {
      htmlContent += html;
    },
    async generateBundle(_, bundle) {
      const cssFiles = Object.keys(bundle).filter((key) => key.endsWith('.css'));
      if (!cssFiles) return;

      for (const file of cssFiles) {
        const bundleFile = bundle[file];

        const purgeCSSResult = await new PurgeCSS().purge({
          content: [
            {
              raw: htmlContent,
              extension: 'html'
            }
          ],
          css: [{ raw: bundleFile.type === 'asset' ? bundleFile.source.toString() : bundleFile.code }],
          ...(options ?? {})
        });

        if (bundleFile.type === 'asset') {
          bundleFile.source = purgeCSSResult[0].css;
        } else {
          bundleFile.code = purgeCSSResult[0].css;
        }
      }
    }
  };
}
