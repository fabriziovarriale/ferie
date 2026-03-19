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

    if (!req) return null;

    const canApprove = req.status === 'PENDING';

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

    return (
        <Slideover show={show} onClose={onClose} title="Dettaglio richiesta">
            <div className="space-y-4">
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
            </div>
        </Slideover>
    );
}
