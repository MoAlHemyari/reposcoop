import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Button } from './index';

describe('Button Component', () => {
	it('should render without errors', () => {
		expect(() => {
			render(Button);
		}).not.toThrow();
	});

	it('should render with default styling', async () => {
		render(Button);

		const button = page.getByRole('button');
		await expect.element(button).toBeInTheDocument();

		await expect.element(button).toHaveAttribute('class', expect.stringContaining('bg-primary'));
		await expect.element(button).toHaveAttribute('class', expect.stringContaining('h-10 px-4 py-2'));
	});

	it('should render with outline styling via variant', async () => {
		render(Button, { variant: 'outline' });

		const button = page.getByRole('button');
		await expect.element(button).toHaveAttribute('class', expect.stringContaining('border border-input'));
	});

	it('should apply additional class names', async () => {
		render(Button, { class: 'custom-class' });

		const button = page.getByRole('button');
		await expect.element(button).toHaveAttribute('class', expect.stringContaining('custom-class'));
	});

	it('should set button type attribute', async () => {
		render(Button, { type: 'submit' });

		const button = page.getByRole('button');
		await expect.element(button).toHaveAttribute('type', 'submit');
	});

	it('should handle click events', async () => {
		const handleClick = vi.fn();

		render(Button, { onclick: handleClick });

		const button = page.getByRole('button');
		await button.click();

		expect(handleClick).toHaveBeenCalled();
	});

	it('should be disabled when disabled prop is true', async () => {
		render(Button, { disabled: true });

		const button = page.getByRole('button');
		await expect.element(button).toBeDisabled();
	});
});
