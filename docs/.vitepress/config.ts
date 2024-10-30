import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';
import typedocSidebar from '../references/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Sheethuahua',
	description:
		'Type-safe Google Sheets and CSV parser for TypeScript and JavaScript',
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Examples', link: '/markdown-examples' },
		],
		sidebar: [
			// @ts-ignore
			...(generateSidebar({
				excludePattern: ['references'],
				documentRootPath: 'docs',
				useTitleFromFileHeading: true,
				capitalizeEachWords: true,
				hyphenToSpace: true,
				keepMarkdownSyntaxFromTitle: true,
				sortFolderTo: 'bottom',
			}) ?? []),
			{
				text: 'References',
				items: typedocSidebar,
				link: '/references',
			},
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/punchupworld/sheethuahua' },
		],
	},
});
