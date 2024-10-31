import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';
import typedocSidebar from '../references/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Sheethuahua',
	description:
		'Type-safe CSV and Google Sheets parser for TypeScript and JavaScript',
	head: [['link', { rel: 'icon', href: '/favicon.png' }]],
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: '/favicon.png',
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Docs', link: '/introduction' },
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
		search: {
			provider: 'local',
		},
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2024-present Punch Up',
		},
	},
});
