/** @type {import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions} */
const config = {
	entryPoints: ['./src/index.ts'],
	plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
	out: 'docs/references',
	docsRoot: './docs',
	readme: 'none',
	hideBreadcrumbs: true,
	parametersFormat: 'table',
};

export default config;
