# Ferie MVP - Laravel + Inertia + React

Port dell'applicazione Ferie da Next.js/Supabase a Laravel con Inertia.js e React.

## Stack

- **Backend**: Laravel 12
- **Frontend**: Inertia.js + React
- **Auth**: Laravel Breeze
- **Database**: SQLite (default) / MySQL / PostgreSQL

## Setup

```bash
# Installa dipendenze PHP
composer install

# Installa dipendenze Node
npm install

# Copia .env e genera chiave
cp .env.example .env
php artisan key:generate

# Database (SQLite di default)
touch database/database.sqlite
php artisan migrate --seed

# Build frontend
npm run build
```

## Avvio

```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - Vite (dev)
npm run dev
```

Apri http://localhost:8000

## Utenti di test (dopo seed)

| Email | Password | Ruolo |
|-------|----------|-------|
| admin@example.com | password | Admin |
| fabrizio@example.com | password | Dipendente |

## Struttura

- **Models**: User, LeaveType, LeaveBalance, LeaveRequest
- **Controller**: DashboardController (dati per dashboard)
- **Pagine React**: Dashboard.jsx (EmployeeView / AdminView)

## Da completare

1. **Form nuova richiesta** - Pagina e route per creare richieste
2. **API approve/reject** - Controller e route per admin
3. **Salva budget** - Endpoint per gestione budget ferie
4. **Calcolo giorni lavorativi** - Helper working_days_between
5. **Migrazione componenti UI** - Tailwind/shadcn styling dal progetto Next.js
