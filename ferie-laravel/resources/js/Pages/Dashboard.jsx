import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateRequestSlideover from '@/Components/CreateRequestSlideover';
import RequestDetailSlideover from '@/Components/RequestDetailSlideover';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Dashboard({
    user,
    leaveTypes,
    employeeBalance,
    employeeRequests,
    employees = [],
    employeesWithBalances = {},
    calendarRequests = [],
    isAdmin = false,
    pendingRequests = [],
    approvedRequests = [],
    rejectedRequests = [],
}) {
    const { errors = {} } = usePage().props;
    const userFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Utente';
    const [createSlideoverOpen, setCreateSlideoverOpen] = useState(false);

    const hasLeaveErrors = ['leaveType', 'startDate', 'endDate', 'requestedUnits', 'note', 'userId'].some((k) => errors?.[k]);
    useEffect(() => {
        if (hasLeaveErrors) setCreateSlideoverOpen(true);
    }, [hasLeaveErrors]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-foreground">
                            Ferie MVP
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {userFullName}
                            <span className="ml-2 rounded border px-2 py-0.5 text-xs">
                                {isAdmin ? 'Admin' : 'Dipendente'}
                            </span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setCreateSlideoverOpen(true)}
                        className="inline-flex shrink-0 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        Crea richiesta
                    </button>
                </div>
            }
        >
            <Head title="Dashboard - Ferie" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    {isAdmin ? (
                        <AdminView
                            pendingRequests={pendingRequests}
                            approvedRequests={approvedRequests}
                            rejectedRequests={rejectedRequests}
                        />
                    ) : (
                        <EmployeeView
                            balance={employeeBalance}
                            requests={employeeRequests}
                        />
                    )}
                </div>
            </div>

            <CreateRequestSlideover
                show={createSlideoverOpen}
                onClose={() => setCreateSlideoverOpen(false)}
                leaveTypes={leaveTypes}
                employeeBalance={employeeBalance}
                employees={employees}
                employeesWithBalances={employeesWithBalances}
                isAdmin={isAdmin}
                requests={calendarRequests}
                errors={errors}
            />
        </AuthenticatedLayout>
    );
}

function EmployeeView({ balance, requests }) {
    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border-l-4 border-l-primary bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">Giorni totali</p>
                    <p className="text-2xl font-semibold text-foreground">{balance?.total ?? '-'}</p>
                </div>
                <div className="rounded-lg border-l-4 border-l-amber-500 bg-amber-500/10 p-4">
                    <p className="text-sm text-muted-foreground">Giorni usati</p>
                    <p className="text-2xl font-semibold text-foreground">{balance?.used ?? '-'}</p>
                </div>
                <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-500/10 p-4">
                    <p className="text-sm text-muted-foreground">Giorni residui</p>
                    <p className="text-2xl font-semibold text-foreground">{balance?.remaining ?? '-'}</p>
                </div>
            </section>

            <div className="rounded-lg bg-card border border-border p-6 shadow">
                <h3 className="text-lg font-medium text-foreground">Storico richieste</h3>
                <p className="mb-4 text-sm text-muted-foreground">Elenco richieste con stato</p>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Tipo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Inizio</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Fine</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Stato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {requests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        Nessuna richiesta
                                    </td>
                                </tr>
                            ) : (
                                requests.map((r) => (
                                    <tr key={r.id}>
                                        <td className="px-4 py-2 text-foreground">{r.leaveType}</td>
                                        <td className="px-4 py-2 text-foreground">{r.startDate}</td>
                                        <td className="px-4 py-2 text-foreground">{r.endDate}</td>
                                        <td className="px-4 py-2">
                                            <StatusBadge status={r.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function AdminView({ pendingRequests, approvedRequests, rejectedRequests }) {
    const { flash = {} } = usePage().props;
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailSlideoverOpen, setDetailSlideoverOpen] = useState(false);

    const allRequests = [...pendingRequests, ...approvedRequests, ...rejectedRequests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const openDetail = (r) => {
        setSelectedRequest(r);
        setDetailSlideoverOpen(true);
    };

    const closeDetail = () => {
        setDetailSlideoverOpen(false);
        setSelectedRequest(null);
    };

    useEffect(() => {
        const s = flash?.status;
        if (s && (s.includes('approvata') || s.includes('rifiutata'))) {
            setDetailSlideoverOpen(false);
            setSelectedRequest(null);
        }
    }, [flash?.status]);

    return (
        <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border-l-4 border-l-primary bg-primary/10 p-4">
                    <p className="text-sm text-muted-foreground">Richieste in attesa</p>
                    <p className="text-2xl font-semibold text-foreground">{pendingRequests.length}</p>
                </div>
                <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-500/10 p-4">
                    <p className="text-sm text-muted-foreground">Richieste approvate</p>
                    <p className="text-2xl font-semibold text-foreground">{approvedRequests.length}</p>
                </div>
                <div className="rounded-lg border-l-4 border-l-destructive bg-destructive/10 p-4">
                    <p className="text-sm text-muted-foreground">Richieste rifiutate</p>
                    <p className="text-2xl font-semibold text-foreground">{rejectedRequests.length}</p>
                </div>
            </section>

            <div className="rounded-lg bg-card border border-border p-6 shadow">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-foreground">Richieste</h3>
                    <p className="text-sm text-muted-foreground">Elenco di tutte le richieste con stato</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Dipendente</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Tipo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Periodo</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Stato</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {allRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        Nessuna richiesta
                                    </td>
                                </tr>
                            ) : (
                                allRequests.map((r) => (
                                    <tr
                                        key={r.id}
                                        onClick={() => openDetail(r)}
                                        className="cursor-pointer transition-colors hover:bg-accent/50"
                                    >
                                        <td className="px-4 py-2 text-foreground">{r.userFullName}</td>
                                        <td className="px-4 py-2 text-foreground">{r.leaveType}</td>
                                        <td className="px-4 py-2 text-foreground">{r.startDate} - {r.endDate}</td>
                                        <td className="px-4 py-2">
                                            <StatusBadge status={r.status} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <RequestDetailSlideover
                request={selectedRequest}
                show={detailSlideoverOpen}
                onClose={closeDetail}
            />
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        PENDING: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
        APPROVED: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
        REJECTED: 'bg-destructive/20 text-destructive',
        CANCELLED: 'bg-muted text-muted-foreground',
    };
    const labels = {
        PENDING: 'In attesa',
        APPROVED: 'Approvata',
        REJECTED: 'Rifiutata',
        CANCELLED: 'Annullata',
    };
    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
            {labels[status] || status}
        </span>
    );
}
