import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-lg text-base font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md active:scale-95',
	{
		variants: {
			variant: {
				default: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-500 hover:shadow-lg border border-yellow-400/20',
				destructive:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm',
				outline:
          'border-2 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-amber-500',
        luxury: 
          'bg-slate-900 text-amber-500 border border-amber-500/30 hover:bg-slate-800 hover:text-amber-400',
				secondary:
          'bg-slate-100 text-slate-900 hover:bg-slate-200',
				ghost: 'hover:bg-slate-100 hover:text-slate-900 shadow-none',
				link: 'text-amber-600 underline-offset-4 hover:underline shadow-none',
			},
			size: {
				default: 'h-12 px-6 py-3',
				sm: 'h-10 rounded-md px-4',
				lg: 'h-14 rounded-lg px-10 text-lg',
				icon: 'h-12 w-12',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };