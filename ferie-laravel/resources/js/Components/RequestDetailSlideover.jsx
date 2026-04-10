import ConfirmDialog from '@/Components/ConfirmDialog';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Slideover from '@/Components/Slideover';
import Textarea from '@/Components/Textarea';
import { router } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_LABELS = {
    PENDING: 'In attesa',
    APPROVED: 'Approvata',
    REJECTED: 'Rifiutata',
    CANCELLED: 'Annullata',
};

export default function RequestDetailSlideover({ request: req, show, onClose }) {
    const [rejectNote, setRejectNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!req) return null;

    const canApprove = req.status === 'PENDING';
    const canRevoke = req.status === 'APPROVED';

    const handleApprove = () => {
        setProcessing(true);
        router.patch(route('admin.requests.approve', req.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: onClose,
        });
    };

    const handleReject = () => {
        setProcessing(true);
        router.patch(route('admin.requests.reject', req.id), {
            note_admin: rejectNote,
        }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: onClose,
        });
    };

    const handleRevoke = () => {
        setProcessing(true);
        router.patch(route('admin.requests.revoke', req.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => { setRevokeConfirmOpen(false); onClose(); },
        });
    };

    const handleDelete = () => {
        setProcessing(true);
        router.delete(route('admin.requests.destroy', req.id), {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onSuccess: () => { setDeleteConfirmOpen(false); onClose(); },
        });
    };

    return (
        <Slideover show={show} onClose={onClose} title="Dettaglio richiesta">
            <div className="space-y-4">
                {req.roleConflictWarning && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                        <div className="flex items-start gap-2.5">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Conflitto di ruolo</p>
                                <p className="mt-0.5 text-xs text-amber-600/90 dark:text-amber-400/80">{req.roleConflictWarning}</p>
                            </div>
                        </div>
                    </div>
                )}
                <dl className="space-y-3">
                    <div>
                        <dt className="text-sm text-muted-foreground">Dipendente</dt>
                        <dd className="font-medium text-foreground">{req.userFullName}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Tipo</dt>
                        <dd className="text-foreground">{req.leaveType}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Periodo</dt>
                        <dd className="text-foreground">{req.startDate} — {req.endDate}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Giorni/Ore richieste</dt>
                        <dd className="text-foreground">{req.requestedUnits}</dd>
                    </div>
                    <div>
                        <dt className="text-sm text-muted-foreground">Stato</dt>
                        <dd>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                req.status === 'PENDING' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' :
                                req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                req.status === 'REJECTED' ? 'bg-destructive/20 text-destructive' :
                                'bg-muted text-muted-foreground'
                            }`}>
                                {STATUS_LABELS[req.status] || req.status}
                            </span>
                        </dd>
                    </div>
                    {req.noteUser && (
                        <div>
                            <dt className="text-sm text-muted-foreground">Note dipendente</dt>
                            <dd className="text-foreground">{req.noteUser}</dd>
                        </div>
                    )}
                    {req.noteAdmin && (
                        <div>
                            <dt className="text-sm text-muted-foreground">Note admin</dt>
                            <dd className="text-foreground">{req.noteAdmin}</dd>
                        </div>
                    )}
                </dl>

                {canApprove && (
                    <>
                        <div>
                            <label htmlFor="rejectNote" className="block text-sm font-medium text-muted-foreground mb-1">
                                Motivo rifiuto (opzionale)
                            </label>
                            <Textarea
                                id="rejectNote"
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                placeholder="Es. periodo non disponibile"
                                rows={2}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <PrimaryButton
                                onClick={handleApprove}
                                disabled={processing}
                                className="!bg-emerald-600 hover:!bg-emerald-500"
                            >
                                Approva
                            </PrimaryButton>
                            <SecondaryButton
                                onClick={handleReject}
                                disabled={processing}
                                className="!border-destructive !text-destructive hover:!bg-destructive/10"
                            >
                                Rifiuta
                            </SecondaryButton>
                        </div>
                    </>
                )}

                {canRevoke && (
                    <div className="border-t border-border pt-4">
                        <p className="mb-3 text-xs text-muted-foreground">
                            La revoca riporta la richiesta in stato "In attesa" per una nuova valutazione.
                        </p>
                        <button
                            type="button"
                            onClick={() => setRevokeConfirmOpen(true)}
                            disabled={processing}
                            className="inline-flex items-center rounded-md border border-amber-500 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-500/10 disabled:opacity-50 dark:text-amber-400"
                        >
                            Revoca approvazione
                        </button>
                    </div>
                )}

                <div className="border-t border-border pt-4">
                    <button
                        type="button"
                        onClick={() => setDeleteConfirmOpen(true)}
                        disabled={processing}
                        className="inline-flex items-center rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                    >
                        Elimina richiesta
                    </button>
                </div>
            </div>

            <ConfirmDialog
                show={revokeConfirmOpen}
                title="Revoca approvazione"
                message="La richiesta tornerà in stato «In attesa» e il saldo verrà aggiornato automaticamente. Continuare?"
                confirmLabel="Revoca"
                cancelLabel="Annulla"
                processing={processing}
                onConfirm={handleRevoke}
                onCancel={() => setRevokeConfirmOpen(false)}
            />
            <ConfirmDialog
                show={deleteConfirmOpen}
                title="Elimina richiesta"
                message="La richiesta verrà eliminata definitivamente. Questa operazione non può essere annullata."
                confirmLabel="Elimina"
                cancelLabel="Annulla"
                destructive
                processing={processing}
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
            />
        </Slideover>
    );
}
