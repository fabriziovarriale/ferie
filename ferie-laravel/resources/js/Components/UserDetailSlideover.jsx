import ConfirmDialog from '@/Components/ConfirmDialog';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Slideover from '@/Components/Slideover';
import TextInput from '@/Components/TextInput';
import { router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function UserDetailSlideover({ user, year, onClose }) {
    const { data, setData, patch, processing, errors } = useForm({
        allocated_days: user?.allocatedDays ?? 0,
        year: year ?? new Date().getFullYear(),
    });
    const [deleting, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setData({
                allocated_days: user.allocatedDays ?? 0,
                year: year ?? new Date().getFullYear(),
            });
        }
    }, [user?.id, year]);

    const fullName = user
        ? [user.firstName, user.lastName].filter(Boolean).join(' ') || '—'
        : '';
    const used = user?.usedDays ?? 0;
    const allocated = parseInt(String(data.allocated_days), 10);
    const remaining =
        user && !isNaN(allocated) ? Math.max(0, allocated - used) : user?.remaining ?? 0;

    const submit = (e) => {
        e.preventDefault();
        if (!user) return;
        patch(route('admin.users.balance', user.id), {
            preserveScroll: true,
            onSuccess: () => onClose(),
        });
    };

    const handleDelete = () => {
        if (!user) return;
        setDeleting(true);
        router.delete(route('admin.users.destroy', user.id), {
            onSuccess: () => { setDeleting(false); setConfirmOpen(false); onClose(); },
            onError: () => setDeleting(false),
        });
    };

    return (
        <Slideover
            show={Boolean(user)}
            onClose={onClose}
            title={fullName || 'Dettaglio utente'}
        >
            <div className="space-y-4">
                {user && (
                    <>
                        <dl className="space-y-2 text-sm">
                            <div>
                                <dt className="text-muted-foreground">Email</dt>
                                <dd className="font-medium text-foreground">{user.email}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Ruolo</dt>
                                <dd className="font-medium text-foreground">
                                    {user.jobRole || '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Anno di riferimento</dt>
                                <dd className="font-medium text-foreground">{year}</dd>
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                                <div>
                                    <dt className="text-muted-foreground">Giorni usati</dt>
                                    <dd className="font-medium text-foreground">{used}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Residui (stima)</dt>
                                    <dd className="font-medium text-foreground">{remaining}</dd>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                I giorni usati sono la somma dei giorni lavorativi delle richieste{' '}
                                <strong className="font-medium text-foreground">approvate</strong> con tipologia che
                                scala il budget ferie (es. ferie), per l&apos;anno {year}.
                            </p>
                        </dl>

                        <form onSubmit={submit} className="space-y-3 border-t border-border pt-4">
                            <div>
                                <InputLabel htmlFor="allocated_days" value={`Giorni ferie assegnati (${year})`} />
                                <TextInput
                                    id="allocated_days"
                                    type="number"
                                    min={0}
                                    max={365}
                                    value={data.allocated_days}
                                    onChange={(e) => setData('allocated_days', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.allocated_days} className="mt-2" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'Salvataggio...' : 'Salva budget'}
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={onClose}>
                                    Chiudi
                                </SecondaryButton>
                            </div>
                        </form>

                        <div className="border-t border-destructive/30 pt-4">
                            <p className="mb-3 text-xs text-muted-foreground">
                                L&apos;eliminazione è permanente e rimuove anche tutte le richieste associate.
                            </p>
                            <button
                                type="button"
                                onClick={() => setConfirmOpen(true)}
                                className="inline-flex items-center rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
                            >
                                Elimina utente
                            </button>
                        </div>

                        <ConfirmDialog
                            show={confirmOpen}
                            title="Elimina utente"
                            message={`Eliminare definitivamente "${fullName}"? Tutte le sue richieste saranno rimosse.`}
                            confirmLabel="Elimina"
                            cancelLabel="Annulla"
                            destructive
                            processing={deleting}
                            onConfirm={handleDelete}
                            onCancel={() => setConfirmOpen(false)}
                        />
                    </>
                )}
            </div>
        </Slideover>
    );
}
