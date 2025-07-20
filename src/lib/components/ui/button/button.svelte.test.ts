import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Button } from './index';

describe('Button Component', () => {
	it('should render without errors', () => {
		expect(() => {
			render(Button, { children: 'Click me' });
		}).not.toThrow();
	});

	it('should render with default variant and size', async () => {
		render(Button, { children: () => 'Click me' });

		const button = page.getByRole('button', { name: 'Click me' });
		await expect.element(button).toBeInTheDocument();

		// Check for default variant class
		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('bg-primary');
		expect(classAttribute).toContain('h-10 px-4 py-2'); // Default size
	});

	it('should render with destructive variant', async () => {
		render(Button, { variant: 'destructive', children: () => 'Delete' });

		const button = page.getByRole('button', { name: 'Delete' });
		await expect.element(button).toBeInTheDocument();

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('bg-destructive');
	});

	it('should render with outline variant', async () => {
		render(Button, { variant: 'outline', children: () => 'Outline' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('border border-input');
	});

	it('should render with secondary variant', async () => {
		render(Button, { variant: 'secondary', children: () => 'Secondary' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('bg-secondary');
	});

	it('should render with ghost variant', async () => {
		render(Button, { variant: 'ghost', children: () => 'Ghost' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('hover:bg-accent');
	});

	it('should render with link variant', async () => {
		render(Button, { variant: 'link', children: () => 'Link' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('text-primary underline-offset-4');
	});

	it('should render with small size', async () => {
		render(Button, { size: 'sm', children: () => 'Small' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('h-9 rounded-md px-3');
	});

	it('should render with large size', async () => {
		render(Button, { size: 'lg', children: () => 'Large' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('h-11 rounded-md px-8');
	});

	it('should render with icon size', async () => {
		render(Button, { size: 'icon', children: () => 'Icon' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('h-10 w-10');
	});

	it('should apply additional class names', async () => {
		render(Button, { class: 'custom-class', children: () => 'Custom' });

		const buttonElement = page.locator('button');
		const classAttribute = await buttonElement.getAttribute('class');
		expect(classAttribute).toContain('custom-class');
	});

	it('should set button type attribute', async () => {
		render(Button, { type: 'submit', children: () => 'Submit' });

		const buttonElement = page.locator('button');
		const typeAttribute = await buttonElement.getAttribute('type');
		expect(typeAttribute).toBe('submit');
	});

	it('should handle click events', async () => {
		const handleClick = vi.fn();

		const { component } = render(Button, { children: () => 'Click me' });

		component.$on('click', handleClick);

		const button = page.getByRole('button', { name: 'Click me' });
		await button.click();

		expect(handleClick).toHaveBeenCalled();
	});

	it('should be disabled when disabled prop is true', async () => {
		render(Button, { disabled: true, children: () => 'Disabled' });

		const button = page.getByRole('button', { name: 'Disabled' });
		await expect.element(button).toBeDisabled();
	});
});
