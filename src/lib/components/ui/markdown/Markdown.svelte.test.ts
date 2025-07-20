import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Markdown } from './index';

describe('Markdown Component', () => {
	it('should render without errors', () => {
		expect(() => {
			render(Markdown, { content: '# Test Heading' });
		}).not.toThrow();
	});

	it('should render Markdown content as HTML', async () => {
		render(Markdown, { content: '# Test Heading' });

		const heading = page.getByRole('heading', { level: 1, name: 'Test Heading' });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render paragraphs correctly', async () => {
		render(Markdown, { content: 'This is a paragraph.' });

		const paragraph = page.getByText('This is a paragraph.');
		await expect.element(paragraph).toBeInTheDocument();
	});

	it('should render lists correctly', async () => {
		render(Markdown, {
			content: `
- Item 1
- Item 2
- Item 3
      `
		});

		const listItems = page.getByRole('listitem');
		await expect.element(listItems).toBeInTheDocument();
		expect(await listItems.count()).toBe(3);
	});

	it('should render code blocks correctly', async () => {
		render(Markdown, {
			content: '```\nconst test = "code block";\n```'
		});

		const codeBlock = page.locator('pre code');
		await expect.element(codeBlock).toBeInTheDocument();
	});

	it('should render links correctly', async () => {
		render(Markdown, {
			content: '[Test Link](https://example.com)'
		});

		const link = page.getByRole('link', { name: 'Test Link' });
		await expect.element(link).toBeInTheDocument();
		await expect.element(link).toHaveAttribute('href', 'https://example.com');
	});

	it('should apply custom class to container', async () => {
		render(Markdown, {
			content: 'Test content',
			class: 'custom-class'
		});

		const container = page.locator('.markdown-content.custom-class');
		await expect.element(container).toBeInTheDocument();
	});

	it('should sanitize HTML to prevent XSS', async () => {
		render(Markdown, {
			content: '<script>alert("XSS")</script>'
		});

		const script = page.locator('script');
		await expect.element(script).not.toBeInTheDocument();
	});
});
