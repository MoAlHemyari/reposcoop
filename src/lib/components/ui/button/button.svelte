<script lang="ts">
	/**
	 * Button component with minimal styles.
	 *
	 * @component
	 * @example
	 * ```svelte
	 * <Button>Default Button</Button>
	 * <Button variant="outline">Outline Button</Button>
	 * ```
	 */
    import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	/**
	 * Defines the available button variants and sizes using class-variance-authority
	 */
	const buttonVariants = cva(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		{
			variants: {
				variant: {
					default: 'bg-primary text-primary-foreground hover:bg-primary/90',
					outline: 'border border-input hover:bg-accent hover:text-accent-foreground'
				},
				size: {
					default: 'h-10 px-4 py-2'
				}
			},
			defaultVariants: {
				variant: 'default',
				size: 'default'
			}
		}
	);

	/**
	 * Component props
	 * @property {string} [class] - Additional CSS classes to apply to the button
	 * @property {string} [variant='default'] - Button style variant: 'default' or 'outline'
	 * @property {string} [size='default'] - Button size: 'default'
	 * @property {string} [type='button'] - HTML button type: 'button', 'submit', or 'reset'
	 */
	let {
		class: className,
		variant,
		size,
		children,
		...props
	} = $props<
		VariantProps<typeof buttonVariants> &
		HTMLButtonAttributes
	>();

	let _class = $derived(cn(buttonVariants({ variant, size }), className));
</script>

<button class={_class} {...props}>
	{@render children?.()}
</button>
