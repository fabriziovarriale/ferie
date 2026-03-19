import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

const inputClasses =
    'mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring';

export default function Select({ value, onChange, options, optionValue = 'value', optionLabel = 'label', id, className = '', disabled }) {
    const selected = options.find((o) => (typeof o === 'object' ? o[optionValue] : o) === value);
    const displayValue = selected
        ? typeof selected === 'object'
            ? selected[optionLabel]
            : selected
        : '';

    return (
        <Listbox value={value} onChange={onChange} disabled={disabled}>
            <ListboxButton
                id={id}
                className={`${inputClasses} flex w-full items-center justify-between text-left ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
            >
                <span className="block truncate text-foreground">{displayValue}</span>
                <span className="pointer-events-none ml-2">
                    <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </span>
            </ListboxButton>
            <ListboxOptions
                anchor="bottom start"
                className="z-50 mt-1 max-h-60 min-w-[var(--button-width)] overflow-auto rounded-md border border-border bg-popover py-1 shadow-lg"
            >
                {options.map((option) => {
                    const val = typeof option === 'object' ? option[optionValue] : option;
                    const label = typeof option === 'object' ? option[optionLabel] : option;
                    return (
                        <ListboxOption
                            key={val}
                            value={val}
                            className="group flex cursor-pointer items-center gap-2 px-3 py-2 text-popover-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[selected]:bg-accent/50"
                        >
                            {({ selected }) => (
                                <>
                                    <span className={`block size-4 shrink-0 ${selected ? 'text-primary' : 'invisible'}`}>
                                        <svg viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span className="block truncate">{label}</span>
                                </>
                            )}
                        </ListboxOption>
                    );
                })}
            </ListboxOptions>
        </Listbox>
    );
}
