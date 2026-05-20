import type { Theme } from 'vitepress';
import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue';
import DefaultTheme from 'vitepress/theme';

export default {
	extends: DefaultTheme,
	enhanceApp({ app }) {
		app.component(
			'CopyOrDownloadAsMarkdownButtons',
			CopyOrDownloadAsMarkdownButtons,
		);
	},
} satisfies Theme;
