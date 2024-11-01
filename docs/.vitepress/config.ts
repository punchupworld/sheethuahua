import { defineConfig } from 'vitepress';
import { generateSidebar } from 'vitepress-sidebar';
import typedocSidebar from '../references/typedoc-sidebar.json';

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'Sheethuahua',
	description:
		'Type-safe CSV and Google Sheets parser for TypeScript and JavaScript',
	base: process.env.BASE_PATH,
	head: [
		[
			'link',
			{ rel: 'icon', href: `${process.env.BASE_PATH ?? '/'}favicon.png` },
		],
		[
			'meta',
			{
				property: 'og:image',
				content: 'https://punchupworld.github.io/sheethuahua/og.png',
			},
		],
		['meta', { property: 'twitter:card', content: 'summary_large_image' }],
	],
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: '/favicon.png',
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Guide', link: '/guide/1-getting-started.html' },
			{ text: 'References', link: '/references.html' },
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
				items: typedocSidebar
					.sort((a, z) => a.text.localeCompare(z.text))
					.map((item) =>
						item.text === 'Functions' ? { ...item, collapsed: false } : item,
					),
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
		outline: {
			level: [2, 3],
		},
	},
});
