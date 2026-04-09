import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ConfirmDialog from '@/Components/ConfirmDialog';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Holidays({ holidays, year }) {
    const { flash = {}, errors = {} } = usePage().props;
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);

    const { data, setData, post, processing, errors: formErrors, reset } = useForm({
        date: '',
        description: '',
    });

    const allErrors = Object.keys(formErrors).length > 0 ? formErrors : errors;

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.holidays.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleDelete = () => {
        if (!pendingDeleteId) return;
        setDeleteProcessing(true);
        router.delete(route('admin.holidays.destroy', pendingDeleteId), {
            preserveScroll: true,
            onSuccess: () => { setDeleteProcessing(false); setPendingDeleteId(null); },
            onError: () => setDeleteProcessing(false),
        });
    };

    const changeYear = (delta) => {
        router.get(route('admin.holidays.index'), { year: year + delta }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-foreground">
                    Gestione festività aziendali
                </h2>
            }
        >
            <Head title="Festività — Admin" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash.status && (
                        <div className="rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                            {flash.status}
                        </div>
                    )}

                    {/* Aggiunta festività */}
                    <div className="rounded-lg border border-border bg-card p-6 shadow">
                        <h3 className="mb-4 text-base font-medium text-foreground">Aggiungi festività</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="date" value="Data" />
                                    <TextInput
                                        id="date"
                                        type="date"
                                        value={data.date}
                                        onChange={(e) => setData('date', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={allErrors.date} className="mt-1" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="description" value="Descrizione (opzionale)" />
                                    <TextInput
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Es. Natale"
                                    />
                                </div>
                            </div>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Salvataggio...' : 'Aggiungi'}
                            </PrimaryButton>
                        </form>
                    </div>

                    {/* Lista festività per anno */}
                    <div className="rounded-lg border border-border bg-card p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base font-medium text-foreground">Festività {year}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => changeYear(-1)}
                                    className="rounded border px-2 py-1 text-sm hover:bg-accent"
                                >
                                    ‹ {year - 1}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => changeYear(1)}
                                    className="rounded border px-2 py-1 text-sm hover:bg-accent"
                                >
                                    {year + 1} ›
                                </button>
                            </div>
                        </div>

                        {holidays.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                Nessuna festività per il {year}.
                            </p>
                        ) : (
                            <table className="min-w-full divide-y divide-border">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Data</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium uppercase text-muted-foreground">Descrizione</th>
                                        <th className="px-4 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {holidays.map((h) => (
                                        <tr key={h.id}>
                                            <td className="px-4 py-2 text-foreground">{h.date}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{h.description || '—'}</td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setPendingDeleteId(h.id)}
                                                    className="text-xs text-destructive hover:underline"
                                                >
                                                    Rimuovi
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                show={pendingDeleteId !== null}
                title="Rimuovi festività"
                message="Rimuovere questa festività? Il giorno tornerà ad essere conteggiato come lavorativo."
                confirmLabel="Rimuovi"
                cancelLabel="Annulla"
                destructive
                processing={deleteProcessing}
                onConfirm={handleDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </AuthenticatedLayout>
    );
}
