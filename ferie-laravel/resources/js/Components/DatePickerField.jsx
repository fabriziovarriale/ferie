import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';

/** Converte yyyy-MM-dd in Date locale (mezzanotte), senza shift UTC. */
export function parseYmdToLocalDate(value) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export default function DatePickerField({
    id,
    value,
    onChange,
    disabled = false,
    required = false,
    placeholder = 'Seleziona data',
    className = '',
    minDate,
    maxDate,
}) {
    const selected = parseYmdToLocalDate(value);
    const display = selected
        ? format(selected, 'd MMM yyyy', { locale: it })
        : placeholder;

    const isDateDisabled = (date) => {
        const day = startOfDay(date);
        if (minDate && isBefore(day, startOfDay(minDate))) return true;
        if (maxDate && isAfter(day, startOfDay(maxDate))) return true;
        return false;
    };

    return (
        <Popover className={`relative ${className}`}>
            <PopoverButton
                id={id}
                type="button"
                disabled={disabled}
                className={
                    'mt-1 flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm ' +
                    'text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring ' +
                    'disabled:cursor-not-allowed disabled:opacity-60'
                }
            >
                <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>{display}</span>
                <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                >
                    <path
                        fillRule="evenodd"
                        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                        clipRule="evenodd"
                    />
                </svg>
            </PopoverButton>

            {required && (
                <input
                    type="text"
                    required
                    value={value || ''}
                    readOnly
                    tabIndex={-1}
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
                />
            )}

            <PopoverPanel
                anchor={{ to: 'bottom start', gap: 4 }}
                className="z-[100] mt-1 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg"
            >
                {({ close }) => (
                    <DayPicker
                        mode="single"
                        locale={it}
                        selected={selected}
                        defaultMonth={selected ?? new Date()}
                        onSelect={(date) => {
                            if (date) {
                                onChange(format(date, 'yyyy-MM-dd'));
                                close();
                            }
                        }}
                        disabled={isDateDisabled}
                        showOutsideDays
                        className="rdp-root"
                    />
                )}
            </PopoverPanel>
        </Popover>
    );
}
