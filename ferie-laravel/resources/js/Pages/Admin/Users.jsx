import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateUserSlideover from '@/Components/CreateUserSlideover';
import InputError from '@/Components/InputError';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function BudgetCell({ user, year }) {
    const { errors = {} } = usePage().props;
    const [editing, setEditing] = useState(false);
    const [localValue, setLocalValue] = useState(String(user.allocatedDays));
    const [saving, setSaving] = useState(false);

    const handleSave = () => {
        const val = parseInt(localValue, 10);
        if (isNaN(val) || val < 0) {
            setLocalValue(String(user.allocatedDays));
            setEditing(false);
            return;
        }
        setSaving(true);
        router.patch(route('admin.users.balance', user.id), {
            allocated_days: val,
            year,
        }, {
            preserveScroll: true,
            onFinish: () => setSaving(false),
            onSuccess: () => setEditing(false),
        });
    };

    const handleBlur = () => {
        if (saving) return;
        handleSave();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            setLocalValue(String(user.allocatedDays));
            setEditing(false);
        }
    };

    const showError = errors.allocated_days && editing;

    if (editing) {
        return (
            <div className="flex flex-col gap-0.5">
                <input
                    type="number"
                    min={0}
                    max={365}
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    disabled={saving}
                    className="w-16 rounded-md border border-input bg-background px-2 py-1 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                />
                {showError && <InputError message={errors.allocated_days} className="mt-0" />}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={saving}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-left hover:bg-accent disabled:opacity-50"
        >
            <span className="font-medium">{user.allocatedDays}</span>
            <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
            </svg>
        </button>
    );
}

const CREATE_USER_ERROR_KEYS = ['firstName', 'lastName', 'email', 'password', 'password_confirmation', 'role'];

export default function Users({ users, year }) {
    const { flash = {}, errors = {} } = usePage().props;
    const hasCreateErrors = CREATE_USER_ERROR_KEYS.some((k) => errors?.[k]);
    const [createSlideoverOpen, setCreateSlideoverOpen] = useState(hasCreateErrors);
    const status = flash?.status;

    useEffect(() => {
        if (hasCreateErrors) setCreateSlideoverOpen(true);
    }, [hasCreateErrors]);

    useEffect(() => {
        if (status === 'Utente creato.') setCreateSlideoverOpen(false);
    }, [status]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-foreground">
                        Utenti
                    </h2>
                    <button
                        type="button"
                        onClick={() => setCreateSlideoverOpen(true)}
                        className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        Aggiungi utente
                    </button>
                </div>
            }
        >
            <Head title="Utenti" />

            <div className="py-6">
                <div className="mx-auto max-w-6xl">
                    <div className="rounded-lg bg-card border border-border p-6 shadow">
                        {status && (
                            <p className="mb-4 rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
                                {status}
                            </p>
                        )}
                        <p className="mb-4 text-sm text-muted-foreground">
                            Imposta il budget di giorni ferie per ogni dipendente per l&apos;anno {year}.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Nome</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Email</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Ruolo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Budget {year}</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Usati</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Residui</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                Nessun dipendente
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.id}>
                                                <td className="px-4 py-2 text-foreground">
                                                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                                                </td>
                                                <td className="px-4 py-2 text-foreground">{u.email}</td>
                                                <td className="px-4 py-2 text-foreground">{u.role === 'admin' ? 'Admin' : 'Dipendente'}</td>
                                                <td className="px-4 py-2">
                                                    <BudgetCell user={u} year={year} />
                                                </td>
                                                <td className="px-4 py-2 text-foreground">{u.usedDays}</td>
                                                <td className="px-4 py-2 text-foreground">{u.remaining}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <CreateUserSlideover
                show={createSlideoverOpen}
                onClose={() => setCreateSlideoverOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
