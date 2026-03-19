import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Select from '@/Components/Select';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';

function workingDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) return 0;
    let count = 0;
    const cursor = new Date(start);
    while (cursor <= end) {
        const day = cursor.getDay();
        if (day !== 0 && day !== 6) count++;
        cursor.setDate(cursor.getDate() + 1);
    }
    return count;
}

export default function LeaveRequestForm({
    leaveTypes,
    employeeBalance,
    employees = [],
    employeesWithBalances = {},
    isAdmin = false,
    errors: externalErrors = {},
    onSuccess,
    initialStartDate = '',
    initialEndDate = '',
    compact = false,
}) {
    const { auth, adminEmployees = [], adminEmployeesWithBalances = {} } = usePage().props;
    const employeesFromProps = Array.isArray(employees) ? employees : Object.values(employees || {});
    const employeesList = employeesFromProps.length > 0 ? employeesFromProps : (Array.isArray(adminEmployees) ? adminEmployees : Object.values(adminEmployees || {}));
    const hasEmployees = employeesList.length > 0;
    const balancesMap = Object.keys(employeesWithBalances).length > 0 ? employeesWithBalances : adminEmployeesWithBalances;
    const isAdminUser = auth?.user?.role === 'admin';
    const showEmployeeSelect = hasEmployees || isAdmin || isAdminUser;

    const { data, setData, post, processing, errors: formErrors } = useForm(
        {
            userId: showEmployeeSelect && hasEmployees ? String(employeesList[0].id) : '',
            leaveType: 'FERIE',
            startDate: initialStartDate,
            endDate: initialEndDate,
            requestedUnits: '0',
            note: '',
        },
        {
            preserveScroll: true,
            onSuccess: () => onSuccess?.(),
        }
    );

    const errors = Object.keys(formErrors).length > 0 ? formErrors : externalErrors;

    useEffect(() => {
        if (initialStartDate || initialEndDate) {
            if (initialStartDate) setData('startDate', initialStartDate);
            if (initialEndDate) setData('endDate', initialEndDate);
        }
    }, [initialStartDate, initialEndDate]);

    const selectedType = useMemo(
        () => leaveTypes.find((lt) => lt.code === data.leaveType),
        [leaveTypes, data.leaveType]
    );

    const displayBalance = useMemo(() => {
        if (showEmployeeSelect && data.userId) {
            return balancesMap[data.userId] ?? null;
        }
        return employeeBalance;
    }, [showEmployeeSelect, data.userId, balancesMap, employeeBalance]);

    const estimatedDays = useMemo(() => {
        if (data.startDate && data.endDate) {
            return workingDaysBetween(data.startDate, data.endDate);
        }
        return null;
    }, [data.startDate, data.endDate]);

    const submit = (e) => {
        e.preventDefault();
        const payload = { ...data };
        if (selectedType?.unit !== 'hours') {
            payload.requestedUnits = '0';
        }
        if (!showEmployeeSelect) {
            delete payload.userId;
        }
        post(route('leave-request.store'), {
            data: payload,
            onSuccess: () => onSuccess?.(),
        });
    };

    return (
        <form onSubmit={submit} className={compact ? 'space-y-2' : 'space-y-4'}>
            {showEmployeeSelect && (
                <div>
                    <InputLabel htmlFor="userId" value="Dipendente" />
                    {hasEmployees ? (
                        <>
                            <Select
                                id="userId"
                                value={data.userId}
                                onChange={(v) => setData('userId', v)}
                                options={employeesList}
                                optionValue="id"
                                optionLabel="label"
                            />
                            <InputError message={errors.userId} className="mt-2" />
                        </>
                    ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                            Nessun dipendente disponibile. Aggiungi utenti dalla pagina Utenti.
                        </p>
                    )}
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                In MVP i giorni lavorativi saranno ricalcolati lato database in fase di approvazione.
            </p>

            <div>
                <InputLabel htmlFor="leaveType" value="Tipo assenza" />
                <Select
                    id="leaveType"
                    value={data.leaveType}
                    onChange={(v) => setData('leaveType', v)}
                    options={leaveTypes}
                    optionValue="code"
                    optionLabel="label"
                />
                <InputError message={errors.leaveType} className="mt-2" />
            </div>

            {selectedType?.unit === 'hours' && (
                <div>
                    <InputLabel htmlFor="requestedUnits" value="Ore richieste" />
                    <TextInput
                        id="requestedUnits"
                        type="number"
                        min={1}
                        value={data.requestedUnits}
                        onChange={(e) => setData('requestedUnits', e.target.value)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.requestedUnits} className="mt-2" />
                </div>
            )}

            {selectedType?.deductsBalance &&
                selectedType?.unit === 'days' &&
                data.startDate &&
                data.endDate && (
                    <p className="text-sm text-muted-foreground">
                        Giorni lavorativi stimati: <strong>{estimatedDays}</strong>
                        {displayBalance != null && (
                            <> • Residui: {displayBalance.remaining}</>
                        )}
                    </p>
                )}

            <div className={`grid sm:grid-cols-2 ${compact ? 'gap-2' : 'gap-4'}`}>
                <div>
                    <InputLabel htmlFor="startDate" value="Data inizio" />
                    <TextInput
                        id="startDate"
                        type="date"
                        value={data.startDate}
                        onChange={(e) => setData('startDate', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.startDate} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="endDate" value="Data fine" />
                    <TextInput
                        id="endDate"
                        type="date"
                        value={data.endDate}
                        onChange={(e) => setData('endDate', e.target.value)}
                        className="mt-1 block w-full"
                        required
                    />
                    <InputError message={errors.endDate} className="mt-2" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="note" value="Note opzionali" />
                <Textarea
                    id="note"
                    value={data.note}
                    onChange={(e) => setData('note', e.target.value)}
                    rows={compact ? 2 : 3}
                    placeholder="Es. visita medica"
                />
                <InputError message={errors.note} className="mt-2" />
            </div>

            <div className={`flex gap-3 ${compact ? 'pt-1' : 'pt-2'}`}>
                <PrimaryButton disabled={processing}>
                    {processing ? 'Invio...' : 'Invia richiesta'}
                </PrimaryButton>
                <SecondaryButton type="button" onClick={onSuccess}>
                    Annulla
                </SecondaryButton>
            </div>
        </form>
    );
}
