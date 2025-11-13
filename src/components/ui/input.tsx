import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-community-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
        error:
          'border-red-500 bg-white text-gray-900 placeholder-gray-400 focus:border-red-500 focus-visible:ring-red-500 dark:border-red-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
        success:
          'border-green-500 bg-white text-gray-900 placeholder-gray-400 focus:border-green-500 focus-visible:ring-green-500 dark:border-green-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
      },
      size: {
        default: 'h-10',
        sm: 'h-8 text-xs',
        lg: 'h-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, ...props }, ref) => {
    return (
      <input
        className={cn(
          inputVariants({
            variant: error ? 'error' : variant,
            size,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
