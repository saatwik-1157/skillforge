import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-105 hover:-translate-y-0.5',
        navy: 'bg-navy text-navy-foreground hover:opacity-90',
        outline: 'border border-border bg-transparent hover:bg-secondary',
        ghost: 'hover:bg-secondary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, the styles are applied to the single child element instead of a
   * <button>. Lets you style a <Link> like a button without nesting <a> in
   * <button>. (Minimal Slot — merges className onto the child.)
   */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
        // forward the ref/props onto the child element
        ...props,
        ref,
      } as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<unknown> });
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
