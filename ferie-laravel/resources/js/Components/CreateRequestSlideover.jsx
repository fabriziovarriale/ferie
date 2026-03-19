import LeaveRequestForm from '@/Components/LeaveRequestForm';
import Slideover from '@/Components/Slideover';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';

export default function CreateRequestSlideover({
    show,
    onClose,
    leaveTypes,
    employeeBalance,
    employees = [],
    employeesWithBalances = {},
    isAdmin = false,
    requests = [],
    errors = {},
}) {
    const [dateRange, setDateRange] = useState(undefined);

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

    const selectedRange = dateRange?.from
        ? {
            from: format(dateRange.from, 'yyyy-MM-dd'),
            to: format(dateRange.to || dateRange.from, 'yyyy-MM-dd'),
        }
        : null;

    const handleClose = () => {
        setDateRange(undefined);
        onClose();
    };

    return (
        <Slideover
            show={show}
            onClose={handleClose}
            title="Nuova richiesta ferie"
            size="3xl"
            compact
        >
            <div className="space-y-3">
                <section>
                    <h3 className="mb-0.5 text-sm font-medium text-foreground">Seleziona il periodo</h3>
                    <p className="mb-1.5 text-sm text-muted-foreground">
                        Scegli un intervallo di date sul calendario. I periodi con richieste sono evidenziati.
                    </p>
                    <div className="rdp-root flex justify-center overflow-x-auto">
                        <DayPicker
                            mode="range"
                            locale={it}
                            defaultMonth={new Date()}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={1}
                            modifiers={{ hasRequest: requestDates }}
                            modifiersClassNames={{ hasRequest: 'bg-primary/30 border-primary/50' }}
                            disabled={(date) => date < new Date('2020-01-01')}
                            showOutsideDays
                        />
                    </div>
                    {dateRange?.from && (
                        <div className="mt-1.5 rounded border border-border bg-muted/30 px-2 py-1 text-sm text-foreground">
                            Selezionato: {format(dateRange.from, 'd MMM yyyy', { locale: it })}
                            {dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() && (
                                <> — {format(dateRange.to, 'd MMM yyyy', { locale: it })}</>
                            )}
                        </div>
                    )}
                </section>

                <section className="border-t border-border pt-4">
                    <h3 className="mb-2 text-sm font-medium text-foreground">Dettagli richiesta</h3>
                    <LeaveRequestForm
                        leaveTypes={leaveTypes}
                        employeeBalance={employeeBalance}
                        employees={employees}
                        employeesWithBalances={employeesWithBalances}
                        isAdmin={isAdmin}
                        initialStartDate={selectedRange?.from ?? ''}
                        initialEndDate={selectedRange?.to ?? ''}
                        errors={errors}
                        onSuccess={handleClose}
                        compact
                    />
                </section>
            </div>
        </Slideover>
    );
}
