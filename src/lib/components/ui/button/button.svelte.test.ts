import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Button } from './index';
import type { Snippet } from "svelte";

const textSnippet = (s: string) => (() => s) as unknown as Snippet;

describe('Button Component', () => {
	it('should render without errors', () => {
		expect(() => {
			render(Button, { children: textSnippet('Click me')});
		}).not.toThrow();
	});

	it('should render with default variant and size', async () => {
		render(Button, { children: textSnippet('Click me') });

		const button = page.getByRole('button', { name: 'Click me' });
		await expect.element(button).toBeInTheDocument();

		await expect.element(button).toHaveAttribute('class', expect.stringContaining('bg-primary'));
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('h-10 px-4 py-2'));
	});

	it('should render with destructive variant', async () => {
		render(Button, { variant: 'destructive', children: textSnippet('Delete') });

		const button = page.getByRole('button', { name: 'Delete' });
		await expect.element(button).toBeInTheDocument();
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('bg-destructive'));
	});

	it('should render with outline variant', async () => {
		render(Button, { variant: 'outline', children: textSnippet('Outline') });

		const button = page.getByRole('button', { name: 'Outline' });
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('border border-input'));
	});

	it('should render with secondary variant', async () => {
		render(Button, { variant: 'secondary', children: textSnippet('Secondary') });

		const button = page.getByRole('button', { name: 'Secondary' });
		await expect.element(button).toHaveAttribute('class', expect.stringContaining('bg-secondary'));
	});

	it('should render with ghost variant', async () => {
		render(Button, { variant: 'ghost', children: textSnippet('Ghost') });

		const button = page.getByRole('button', { name: 'Ghost' });
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('hover:bg-accent'));
	});

	it('should render with link variant', async () => {
		render(Button, { variant: 'link', children: textSnippet('Link') });

		const button = page.getByRole('button', { name: 'Link' });
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('text-primary underline-offset-4'));
	});

	it('should render with small size', async () => {
		render(Button, { size: 'sm', children: textSnippet('Small') });

		const button = page.getByRole('button', { name: 'Small' });
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('h-9 rounded-md px-3'));
	});

	it('should render with large size', async () => {
		render(Button, { size: 'lg', children: textSnippet('Large') });

		const button = page.getByRole('button', { name: 'Large' });
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('h-11 rounded-md px-8'));
	});

	it('should render with icon size', async () => {
		render(Button, { size: 'icon', children: textSnippet('Icon') });

		const button = page.getByRole('button', { name: 'Icon' });
		await expect.element(button).toHaveAttribute('class', expect.stringContaining('h-10 w-10'));
	});

	it('should apply additional class names', async () => {
		render(Button, { class: 'custom-class', children: textSnippet('Custom') });

		const button = page.getByRole('button', { name: 'Custom' });
		await expect.element(button).toHaveAttribute('class', expect.stringContaining('custom-class'));
	});

	it('should set button type attribute', async () => {
		render(Button, { type: 'submit', children: textSnippet('Submit') });

		const button = page.getByRole('button', { name: 'Submit' });
		await expect.element(button).toHaveAttribute('type', 'submit');
	});

	it('should handle click events', async () => {
		const handleClick = vi.fn();

		render(Button, { children: textSnippet('Click me'), onclick: handleClick });

		const button = page.getByRole('button', { name: 'Click me' });
		await button.click();

		expect(handleClick).toHaveBeenCalled();
	});

	it('should be disabled when disabled prop is true', async () => {
		render(Button, { disabled: true, children: textSnippet('Disabled') });

		const button = page.getByRole('button', { name: 'Disabled' });
		await expect.element(button).toBeDisabled();
	});
});
