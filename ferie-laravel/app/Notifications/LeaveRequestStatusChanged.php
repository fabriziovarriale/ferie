<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly LeaveRequest $leaveRequest) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $req = $this->leaveRequest;
        $isApproved = $req->status === 'APPROVED';
        $label = $isApproved ? 'approvata' : 'rifiutata';
        $subject = "La tua richiesta di ferie è stata {$label}";

        $mail = (new MailMessage)
            ->subject($subject)
            ->line("La tua richiesta di **{$req->leave_type_code}** dal **{$req->start_date->format('d/m/Y')}** al **{$req->end_date->format('d/m/Y')}** è stata **{$label}**.");

        if (! $isApproved && $req->note_admin) {
            $mail->line("Motivazione: {$req->note_admin}");
        }

        return $mail
            ->action('Vai alla dashboard', url('/dashboard'))
            ->line('Accedi per visualizzare il dettaglio.');
    }
}
