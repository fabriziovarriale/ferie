import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LeaveRequestForm from '@/Components/LeaveRequestForm';
import Slideover from '@/Components/Slideover';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';

export default function Calendar({ leaveTypes, employeeBalance, requests, employees = [], employeesWithBalances = {}, isAdmin = false }) {
    const [dateRange, setDateRange] = useState(undefined);
    const [slideoverOpen, setSlideoverOpen] = useState(false);

    const requestDates = requests.flatMap((r) => {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const dates = [];
        const cursor = new Date(start);
        while (cursor <= end) {
            dates.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        return dates;
    });

    const modifiers = {
        hasRequest: requestDates,
    };

    const modifiersClassNames = {
        hasRequest: 'bg-primary/30 border-primary/50',
    };

    const handleCreateFromRange = () => {
        if (dateRange?.from) setSlideoverOpen(true);
    };

    const selectedRange = slideoverOpen && dateRange?.from
        ? {
            from: format(dateRange.from, 'yyyy-MM-dd'),
            to: format(dateRange.to || dateRange.from, 'yyyy-MM-dd'),
        }
        : null;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-foreground">
                    Calendario richieste
                </h2>
            }
        >
            <Head title="Calendario" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-lg bg-card border border-border p-6 shadow">
                        <p className="mb-4 text-sm text-muted-foreground">
                            Seleziona un intervallo di date per creare una nuova richiesta. I periodi con richieste sono evidenziati.
                        </p>

                        <div className="rdp-root flex justify-center overflow-x-auto pb-4">
                            <DayPicker
                                mode="range"
                                locale={it}
                                defaultMonth={new Date()}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={1}
                                modifiers={modifiers}
                                modifiersClassNames={modifiersClassNames}
                                disabled={(date) => date < new Date('2020-01-01')}
                                showOutsideDays
                            />
                        </div>

                        {dateRange?.from && (
                            <div className="mt-6 flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-3">
                                <span className="text-sm text-foreground">
                                    Selezionato: {format(dateRange.from, 'd MMM yyyy', { locale: it })}
                                    {dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() && (
                                        <> — {format(dateRange.to, 'd MMM yyyy', { locale: it })}</>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCreateFromRange}
                                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                >
                                    Crea richiesta
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Slideover
                show={slideoverOpen}
                onClose={() => {
                    setSlideoverOpen(false);
                    setDateRange(undefined);
                }}
                title="Nuova richiesta ferie"
            >
                <LeaveRequestForm
                    leaveTypes={leaveTypes}
                    employeeBalance={employeeBalance}
                    employees={employees}
                    employeesWithBalances={employeesWithBalances}
                    isAdmin={isAdmin}
                    initialStartDate={selectedRange?.from ?? ''}
                    initialEndDate={selectedRange?.to ?? ''}
                    onSuccess={() => {
                        setSlideoverOpen(false);
                        setDateRange(undefined);
                    }}
                />
            </Slideover>
        </AuthenticatedLayout>
    );
}
