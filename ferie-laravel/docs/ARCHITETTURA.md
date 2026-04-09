# Piattaforma ferie — stato attuale

Documento di riferimento su stack, database e funzionalità dell’applicazione in `ferie-laravel`.

---

## Stack tecnologico

| Livello | Tecnologie |
|--------|------------|
| **Backend** | PHP **8.2+**, **Laravel 12** |
| **Frontend** | **Inertia.js** (`inertiajs/inertia-laravel` + `@inertiajs/react`), **React 18** |
| **Build / CSS** | **Vite 7**, **Tailwind CSS** (mix: `tailwind.config.js` + `@tailwindcss/vite` 4 nelle devDependencies), **PostCSS**, **Headless UI** (`@headlessui/react`) |
| **Date UI** | **date-fns**, **react-day-picker** v9 |
| **Auth / sessione** | Pattern **Laravel Breeze**, **Laravel Sanctum**; verifica email obbligatoria sulle route principali (`verified`) |
| **Route da JS** | **Ziggy** (`tightenco/ziggy`) per `route()` nei componenti React |
| **Database** | Configurabile via `.env`; lo scaffold prevede anche **SQLite** per bootstrap rapido |
| **Test** | **PHPUnit** 11 |

Script utili:

- `composer run dev` — serve + queue + pail + vite
- `npm run dev` / `npm run build` — asset frontend (nella cartella Laravel)

---

## Schema database (migrations)

### `users`

- `id`, `name`, `email` (unique), `email_verified_at`, `password`, `remember_token`, `timestamps`
- Estensioni: `first_name`, `last_name`, `role` (default `user`; valori attesi `user` \| `admin`), `active` (boolean, default `true`)

### `password_reset_tokens`, `sessions`

Tabelle standard Laravel per reset password e sessione driver database.

### `leave_types` (PK string `code`)

- `description`, `deducts_balance`, `unit` (`days` \| `hours`), `active`, `timestamps`

### `leave_balances`

- `id`, `user_id` → `users` (cascade), `year`, `allocated_days`, `used_days`, `timestamps`
- Vincolo unico `(user_id, year)`

### `leave_requests`

- `id`, `user_id`, `leave_type_code` → `leave_types.code`, `start_date`, `end_date`, `requested_units`, `status` (default `PENDING`; valori nel codice: `PENDING`, `APPROVED`, `REJECTED`; `CANCELLED` previsto nello schema ma non usato nei controller letti), `note_user`, `note_admin`, `approved_days` (nullable; non risulta popolato nei flussi attuali), `timestamps`

### `company_holidays`

- `date` (unique), `description`, `timestamps`

**Nota:** la tabella esiste nello schema; il calcolo giorni lavorativi attuale (`App\Helpers\WorkingDays`) considera solo **lun–ven / escluso weekend**, **non** i record in `company_holidays`.

### Tabelle framework

- `cache`, `jobs` (migrations Laravel standard).

### Tipi di assenza (seed `LeaveTypeSeeder`)

| Codice | Descrizione | Scala saldo | Unità |
|--------|-------------|-------------|-------|
| FERIE | Ferie | sì | days |
| MALATTIA | Malattia | no | days |
| PERMESSO | Permesso | no | hours |
| ROL | ROL | sì | hours |

---

## Funzionalità

### Autenticazione e profilo

- Registrazione, login, logout, reset password, verifica email (`routes/auth.php`).
- Profilo: modifica dati, password, eliminazione account (`ProfileController`).

### Routing principale (`/`)

Visitatore non autenticato → login; utente autenticato → dashboard.

### Dashboard (`/dashboard`) — utente verificato

- Elenco **proprie** richieste di assenza (con tipo assenza collegato).
- **Saldo ferie** anno corrente: `allocated_days`, `used_days`, residuo da `leave_balances` (se esiste riga per anno).
- **Calendario impatto**: assenze **approvate** di tutti (finestra da inizio anno precedente a fine anno successivo, max 500 record).
- **Creazione richiesta**: `POST /dashboard/request` (`LeaveRequestController@store`).
  - Tipi in validazione: `FERIE`, `MALATTIA`, `PERMESSO`, `ROL`.
  - Per tipi in **giorni**: `requested_units` = **giorni lavorativi** (solo weekend esclusi) tra inizio e fine.
  - Per **FERIE** con `deducts_balance`: controllo che i giorni richiesti non superino il residuo sul saldo dell’anno corrente alla creazione.
  - **Nessun blocco** su sovrapposizione periodi tra dipendenti diversi (comportamento esplicito nel codice).
  - Stato iniziale: `PENDING`.

### Dashboard — estensioni **admin** (stessa pagina Inertia)

- Lista dipendenti attivi non-admin per inserire richieste per conto di un utente (`userId` obbligatorio per admin nel form).
- Code **PENDING** / **APPROVED** / **REJECTED** (limiti 200 sugli ultimi due).

### Area admin (`/admin/*`, middleware `auth` + `admin`)

- **`GET /admin/users`**: anagrafica dipendenti con **anno** query `?year=`; giorni allocati da `leave_balances`; **giorni usati** = somma richieste **APPROVED** che scalano il budget in giorni (`LeaveRequest::sumDeductibleApprovedDaysByUserForYear`), allineata all’approvazione.
- **`POST /admin/users`**: creazione utente (nome, cognome, email, password, ruolo `user` o `admin`).
- **`PATCH /admin/users/{user}/balance`**: upsert budget (`allocated_days` + `year`).
- **Approvazione richiesta**: stato `APPROVED`; se il tipo scala il saldo in **giorni**, incremento `leave_balances.used_days` per l’anno della **data inizio** (creazione saldo a zero allocati se mancante).
- **Rifiuto**: stato `REJECTED` + eventuale `note_admin`.

### UI / navigazione

- Layout autenticato: **Dashboard**; per admin **Utenti** (`admin.users.index`).
- Componenti: slideover richieste/utenti, form assenze, calendario approvazioni, ecc.

### Test

- `tests/Feature/LeaveRequestConcurrentTest.php` — scenario concorrenza / richieste.

---

## Relazioni Eloquent

- `User` → `hasMany` `LeaveRequest`, `LeaveBalance`
- `LeaveRequest` → `belongsTo` `User`, `LeaveType` (chiave `leave_type_code`)
- `LeaveBalance` → `belongsTo` `User`
- `LeaveType` (PK `code`) → `hasMany` `LeaveRequest`

---

## Note operative

- **Disallineamento possibile:** la dashboard dipendente mostra `used_days` da `leave_balances`; la lista admin utenti calcola i giorni usati dalle sole richieste approvate che scalano in giorni. In condizioni normali (solo approvazione admin per scalare) dovrebbero essere coerenti; eventuali correzioni manuali sul DB andrebbero verificate.
- **`company_holidays`:** da integrare in `WorkingDays` (o equivalente) se si vogliono escludere i festivi dal conteggio.

*Ultimo allineamento al codice: aprile 2026.*
