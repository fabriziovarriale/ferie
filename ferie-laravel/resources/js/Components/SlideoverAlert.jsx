const VARIANTS = {
    warning: {
        wrapper: 'border-amber-500/30 bg-amber-500/10',
        icon:    'text-amber-600 dark:text-amber-400',
        title:   'text-amber-700 dark:text-amber-400',
        body:    'text-amber-600/90 dark:text-amber-400/80',
        action:  'bg-amber-500 text-white hover:bg-amber-600',
    },
    error: {
        wrapper: 'border-destructive/30 bg-destructive/10',
        icon:    'text-destructive',
        title:   'text-destructive',
        body:    'text-destructive/80',
        action:  'bg-destructive text-destructive-foreground hover:opacity-90',
    },
    info: {
        wrapper: 'border-primary/30 bg-primary/10',
        icon:    'text-primary',
        title:   'text-primary',
        body:    'text-primary/80',
        action:  'bg-primary text-primary-foreground hover:opacity-90',
    },
};

const TriangleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
);

const ChevronIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

/**
 * Alert banner per slideoveres.
 *
 * @param {'warning'|'error'|'info'} variant
 * @param {string} title
 * @param {string} [body]
 * @param {{ label: string, href?: string, onClick?: () => void }} [action]
 */
export default function SlideoverAlert({ variant = 'warning', title, body, action }) {
    const c = VARIANTS[variant] ?? VARIANTS.warning;

    return (
        <div className={`rounded-lg border p-3 ${c.wrapper}`}>
            <div className="flex items-start gap-2.5">
                <TriangleIcon className={`mt-0.5 h-4 w-4 shrink-0 ${c.icon}`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${c.title}`}>{title}</p>
                    {body && (
                        <p className={`mt-0.5 text-xs ${c.body}`}>{body}</p>
                    )}
                    {action && (
                        action.href ? (
                            <a
                                href={action.href}
                                className={`mt-2 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity ${c.action}`}
                            >
                                {action.label}
                                <ChevronIcon className="h-3 w-3" />
                            </a>
                        ) : (
                            <button
                                type="button"
                                onClick={action.onClick}
                                className={`mt-2 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity ${c.action}`}
                            >
                                {action.label}
                                <ChevronIcon className="h-3 w-3" />
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
