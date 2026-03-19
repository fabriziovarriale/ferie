export default function InputError({ message, className = '', ...props }) {
    if (!message) return null;

    return (
        <div
            role="alert"
            {...props}
            className={`mt-2 flex gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive ${className}`}
        >
            <svg className="h-4 w-4 shrink-0 mt-px" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="flex-1">{message}</p>
        </div>
    );
}
