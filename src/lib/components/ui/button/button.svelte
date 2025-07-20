<script lang="ts">
	/**
	 * Button component with various styles and sizes.
	 *
	 * @component
	 * @example
	 * ```svelte
	 * <Button>Default Button</Button>
	 * <Button variant="destructive">Destructive Button</Button>
	 * <Button variant="outline" size="sm">Small Outline Button</Button>
	 * <Button variant="ghost" size="lg">Large Ghost Button</Button>
	 * <Button variant="link">Link Button</Button>
	 * ```
	 */
	import { cva, type VariantProps } from 'class-variance-authority';
	import { cn } from '$lib/utils';

	/**
	 * Defines the available button variants and sizes using class-variance-authority
	 */
	const buttonVariants = cva(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		{
			variants: {
				variant: {
					default: 'bg-primary text-primary-foreground hover:bg-primary/90',
					destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
					outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
					secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
					ghost: 'hover:bg-accent hover:text-accent-foreground',
					link: 'text-primary underline-offset-4 hover:underline'
				},
				size: {
					default: 'h-10 px-4 py-2',
					sm: 'h-9 rounded-md px-3',
					lg: 'h-11 rounded-md px-8',
					icon: 'h-10 w-10'
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
	 * @property {string} [variant='default'] - Button style variant: 'default', 'destructive', 'outline', 'secondary', 'ghost', or 'link'
	 * @property {string} [size='default'] - Button size: 'default', 'sm', 'lg', or 'icon'
	 * @property {string} [type='button'] - HTML button type: 'button', 'submit', or 'reset'
	 */
	let {
		class: className,
		variant,
		size,
		children,
		...props
	} = $props<
		VariantProps<typeof buttonVariants> & {
			class?: string;
			type?: 'button' | 'submit' | 'reset';
		}
	>();

	let _class = $derived(cn(buttonVariants({ variant, size }), className));
</script>

<button class={_class} {...props}>
	{@render children?.()}
</button>
