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

	it('should render with default styling', async () => {
		render(Button, { children: textSnippet('Click me') });

		const button = page.getByRole('button', { name: 'Click me' });
		await expect.element(button).toBeInTheDocument();

		await expect.element(button).toHaveAttribute('class', expect.stringContaining('bg-primary'));
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('h-10 px-4 py-2'));
	});

	it('should render with outline styling via variant', async () => {
		render(Button, { variant: 'outline', children: textSnippet('Outline') });

		const button = page.getByRole('button', { name: 'Outline' });
		await expect
			.element(button)
			.toHaveAttribute('class', expect.stringContaining('border border-input'));
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
