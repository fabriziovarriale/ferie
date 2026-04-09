<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmitted extends Notification implements ShouldQueue
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
        $employee = $req->user;
        $name = $employee
            ? trim(($employee->first_name ?? '').' '.($employee->last_name ?? '')) ?: $employee->email
            : 'Dipendente';

        return (new MailMessage)
            ->subject("Nuova richiesta ferie da {$name}")
            ->line("**{$name}** ha inviato una nuova richiesta.")
            ->line("Tipo: **{$req->leave_type_code}**")
            ->line("Periodo: **{$req->start_date->format('d/m/Y')}** — **{$req->end_date->format('d/m/Y')}**")
            ->line("Giorni/Ore richieste: **{$req->requested_units}**")
            ->action('Gestisci richiesta', url('/dashboard'))
            ->line('Accedi alla dashboard per approvare o rifiutare.');
    }
}
