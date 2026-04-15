import Slideover from '@/Components/Slideover';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { format, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { useCallback, useMemo, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';

const LEAVE_TYPE_COLORS = {
    Ferie: 'bg-emerald-500',
    Malattia: 'bg-rose-500',
    Permesso: 'bg-sky-500',
};

function leaveTypeColor(type) {
    for (const [key, cls] of Object.entries(LEAVE_TYPE_COLORS)) {
        if (type?.toLowerCase().includes(key.toLowerCase())) return cls;
    }
    return 'bg-primary';
}

function parseYmd(ymd) {
    return parse(ymd, 'yyyy-MM-dd', new Date());
}

function normalizeText(value) {
    return (value ?? '').toString().trim().toLowerCase();
}

function workingDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = parseYmd(startDate);
    const end = parseYmd(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

    let total = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
        const dow = cursor.getDay();
        if (dow !== 0 && dow !== 6) total += 1;
        cursor.setDate(cursor.getDate() + 1);
    }
    return total;
}

function groupEntriesByUser(entries) {
    if (!entries?.length) return [];
    const map = new Map();
    for (const e of entries) {
        if (!map.has(e.userFullName)) {
            map.set(e.userFullName, { userFullName: e.userFullName, types: [] });
        }
        const g = map.get(e.userFullName);
        if (!g.types.includes(e.leaveType)) g.types.push(e.leaveType);
    }
    return [...map.values()].map((g) => ({
        userFullName: g.userFullName,
        leaveType: g.types.join(' · '),
        primaryType: g.types[0],
    }));
}

function buildDetailRows(entries) {
    if (!entries?.length) return [];
    const map = new Map();
    for (const e of entries) {
        if (!map.has(e.requestId)) {
            map.set(e.requestId, {
                requestId: e.requestId,
                userFullName: e.userFullName,
                leaveType: e.leaveType,
                requestedUnits: e.requestedUnits > 0 ? e.requestedUnits : workingDaysBetween(e.startDate, e.endDate),
                primaryType: e.leaveType,
                createdAt: e.createdAt ?? null,
                approvedAt: e.approvedAt ?? null,
            });
        }
    }
    return [...map.values()];
}

function formatDateTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return format(d, 'dd/MM/yyyy HH:mm');
}

function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildDayIndex(approvedEntries) {
    const byKey = {};
    for (const item of approvedEntries) {
        const start = parseYmd(item.startDate);
        const end = parseYmd(item.endDate);
        if (start > end) continue;
        const cursor = new Date(start);
        while (cursor <= end) {
            const key = format(cursor, 'yyyy-MM-dd');
            if (!byKey[key]) byKey[key] = [];
            byKey[key].push({
                requestId: item.id,
                userFullName: item.userFullName,
                leaveType: item.leaveType,
                requestedUnits: item.requestedUnits ?? 0,
                startDate: item.startDate,
                endDate: item.endDate,
                createdAt: item.createdAt ?? null,
                approvedAt: item.approvedAt ?? null,
            });
            cursor.setDate(cursor.getDate() + 1);
        }
    }
    return byKey;
}

const MAX_NAMES_IN_CELL = 3;

export default function ApprovedLeaveImpactCalendar({ approvedEntries = [], holidays = [] }) {
    const [detailDay, setDetailDay] = useState(null);
    const [nameFilter, setNameFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [nameDialogOpen, setNameDialogOpen] = useState(false);
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);

    const holidaySet = useMemo(() => new Set(holidays), [holidays]);

    const allNames = useMemo(() => {
        const s = new Set(
            approvedEntries
                .map((e) => (e.userFullName ?? '').trim())
                .filter(Boolean)
        );
        return [...s].sort();
    }, [approvedEntries]);

    const allTypes = useMemo(() => {
        const s = new Set(
            approvedEntries
                .map((e) => (e.leaveType ?? '').trim())
                .filter(Boolean)
        );
        return [...s].sort();
    }, [approvedEntries]);

    const filteredEntries = useMemo(() => {
        const normalizedNameFilter = normalizeText(nameFilter);
        const normalizedTypeFilter = normalizeText(typeFilter);
        return approvedEntries.filter((e) => {
            if (normalizedNameFilter && normalizeText(e.userFullName) !== normalizedNameFilter) return false;
            if (normalizedTypeFilter && normalizeText(e.leaveType) !== normalizedTypeFilter) return false;
            return true;
        });
    }, [approvedEntries, nameFilter, typeFilter]);

    const byDateKey = useMemo(() => buildDayIndex(filteredEntries), [filteredEntries]);
    const byDateKeyRef = useRef(byDateKey);
    byDateKeyRef.current = byDateKey;

    const holidaySetRef = useRef(holidaySet);
    holidaySetRef.current = holidaySet;

    const detailKey = detailDay ? format(detailDay, 'yyyy-MM-dd') : null;
    const detailRaw = detailKey ? byDateKey[detailKey] ?? [] : [];
    const detailRows = buildDetailRows(detailRaw);

    const closeDetail = () => setDetailDay(null);

    const ImpactDay = useCallback((props) => {
        const { day, children, className, ...tdProps } = props;
        const key = format(day.date, 'yyyy-MM-dd');
        const raw = byDateKeyRef.current[key] ?? [];
        const entries = groupEntriesByUser(raw);
        const has = entries.length > 0;
        const tdClass = [className, '!align-top p-1'].filter(Boolean).join(' ');

        const dow = day.date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isHoliday = holidaySetRef.current.has(key);
        const isNonWorking = isWeekend || isHoliday;

        const hatchStyle = isNonWorking ? {
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(128,128,128,0.12) 5px, rgba(128,128,128,0.12) 10px)',
        } : {};

        return (
            <td {...tdProps} className={tdClass}>
                <div
                    className={[
                        'flex h-[7.5rem] min-h-[7.5rem] cursor-pointer flex-col gap-1 overflow-hidden rounded-sm border sm:h-[8.5rem] sm:min-h-[8.5rem]',
                        has && !isNonWorking ? 'border-emerald-500/40 bg-emerald-500/15' : '',
                        has && isNonWorking ? 'border-amber-500/40' : '',
                        !has ? 'border-transparent' : '',
                    ].filter(Boolean).join(' ')}
                    style={hatchStyle}
                    onClick={() => setDetailDay(day.date)}
                >
                    <div className="flex shrink-0 justify-start">{children}</div>
                    {has ? (
                        <div className="hide-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-0.5 pb-1">
                            {entries.slice(0, MAX_NAMES_IN_CELL).map((e, i) => (
                                <div
                                    key={`${e.userFullName}-${i}`}
                                    className="flex min-w-0 items-start gap-1 rounded-md border border-border/80 bg-card/95 px-1 py-0.5 shadow-sm"
                                    title={`${e.userFullName} — ${e.leaveType}`}
                                >
                                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white ${leaveTypeColor(e.primaryType)}`}>
                                        {initials(e.userFullName)}
                                    </span>
                                    <span className="hidden min-w-0 flex-1 leading-tight sm:block">
                                        <span className="block truncate text-[11px] font-semibold text-foreground">
                                            {e.userFullName}
                                        </span>
                                        <span className="block truncate text-[10px] text-muted-foreground">
                                            {e.leaveType}
                                        </span>
                                    </span>
                                </div>
                            ))}
                            {entries.length > MAX_NAMES_IN_CELL ? (
                                <span className="pl-0.5 text-[10px] font-medium text-muted-foreground">
                                    +{entries.length - MAX_NAMES_IN_CELL} altri
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </td>
        );
    }, []);

    return (
        <section className="rounded-lg border border-border bg-card p-6 shadow">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-foreground">Calendario assenze approvate</h3>
                <p className="text-sm text-muted-foreground">
                    Clic su un giorno per aprire il dettaglio nel pannello laterale.
                </p>
            </div>

            {approvedEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna richiesta approvata da mostrare.</p>
            ) : (
                <>
                    {/* Filtri */}
                    <div className="mb-4 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => setNameDialogOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent/50"
                        >
                            <span className="text-muted-foreground">Dipendente:</span>
                            <span className="font-medium">{nameFilter || 'Tutti'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTypeDialogOpen(true)}
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground hover:bg-accent/50"
                        >
                            <span className="text-muted-foreground">Tipo assenza:</span>
                            <span className="font-medium">{typeFilter || 'Tutti'}</span>
                        </button>
                        {(nameFilter || typeFilter) && (
                            <button
                                type="button"
                                onClick={() => { setNameFilter(''); setTypeFilter(''); }}
                                className="text-sm text-muted-foreground hover:text-foreground underline"
                            >
                                Azzera filtri
                            </button>
                        )}
                    </div>

                    {/* Legenda */}
                    <div className="mb-4 flex flex-wrap gap-3">
                        {Object.entries(LEAVE_TYPE_COLORS).map(([label, cls]) => (
                            <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className={`inline-block h-3 w-3 rounded-full ${cls}`} />
                                {label}
                            </span>
                        ))}
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                                className="inline-block h-3 w-3 rounded-sm border border-border"
                                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(128,128,128,0.3) 2px, rgba(128,128,128,0.3) 4px)' }}
                            />
                            Weekend / festività
                        </span>
                    </div>

                    <div className="w-full min-w-0 overflow-x-auto">
                        <DayPicker
                            mode="single"
                            locale={it}
                            defaultMonth={new Date()}
                            selected={detailDay ?? undefined}
                            onSelect={(date) => {
                                if (!date) { closeDetail(); return; }
                                setDetailDay(date);
                            }}
                            numberOfMonths={1}
                            showOutsideDays
                            className="rdp-root rdp-impact-calendar w-full max-w-none"
                            classNames={{
                                months: 'flex w-full flex-col justify-center gap-8',
                                month: 'w-full min-w-0 space-y-3',
                                month_grid: 'w-full table-fixed',
                                weekdays: 'w-full',
                                week: 'w-full',
                                day: 'w-[14.28%]',
                                day_button: '!h-8 !w-8 !min-h-0 shrink-0 rounded-md text-sm font-semibold sm:!h-9 sm:!w-9',
                            }}
                            components={{ Day: ImpactDay }}
                        />
                    </div>

                    <Slideover
                        show={Boolean(detailDay)}
                        onClose={closeDetail}
                        title={detailDay ? format(detailDay, 'd MMMM yyyy', { locale: it }) : ''}
                    >
                        {detailDay && detailRows.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nessuna assenza approvata in questa data.
                            </p>
                        ) : null}
                        {detailDay && detailRows.length > 0 ? (
                            <ul className="space-y-3 text-sm">
                                {detailRows.map((row, idx) => (
                                    <li
                                        key={`${row.requestId}-${idx}`}
                                        className="flex gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                                    >
                                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${leaveTypeColor(row.primaryType)}`}>
                                            {initials(row.userFullName)}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground">{row.userFullName}</p>
                                            <p className="text-muted-foreground">{row.leaveType}</p>
                                            <p className="text-muted-foreground">Giorni richiesti: {row.requestedUnits}</p>
                                            <p className="text-muted-foreground">Richiesto il {formatDateTime(row.createdAt)}</p>
                                            <p className="text-muted-foreground">Approvato il {formatDateTime(row.approvedAt)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </Slideover>

                    <RadioFilterDialog
                        show={nameDialogOpen}
                        title="Filtra per dipendente"
                        allLabel="Tutti"
                        options={allNames}
                        value={nameFilter}
                        onChange={setNameFilter}
                        onClose={() => setNameDialogOpen(false)}
                    />

                    <RadioFilterDialog
                        show={typeDialogOpen}
                        title="Filtra per tipo assenza"
                        allLabel="Tutti"
                        options={allTypes}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        onClose={() => setTypeDialogOpen(false)}
                    />
                </>
            )}
        </section>
    );
}

function RadioFilterDialog({ show, title, allLabel, options, value, onChange, onClose }) {
    return (
        <Transition show={show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClose={onClose}>
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-black/50" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="relative w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl">
                        <h3 className="mb-4 text-base font-semibold text-foreground">{title}</h3>
                        <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50">
                                <input
                                    type="radio"
                                    name={title}
                                    checked={value === ''}
                                    onChange={() => onChange('')}
                                    className="h-4 w-4 border-border bg-card text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-foreground">{allLabel}</span>
                            </label>
                            {options.map((option) => (
                                <label key={option} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/50">
                                    <input
                                        type="radio"
                                        name={title}
                                        checked={value === option}
                                        onChange={() => onChange(option)}
                                        className="h-4 w-4 border-border bg-card text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-foreground">{option}</span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                            >
                                Chiudi
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
