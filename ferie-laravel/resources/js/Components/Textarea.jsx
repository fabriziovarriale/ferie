import { forwardRef } from 'react';

const baseClasses =
    'mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

export default forwardRef(function Textarea({ className = '', ...props }, ref) {
    return (
        <textarea
            ref={ref}
            className={`${baseClasses} ${className}`}
            {...props}
        />
    );
});
