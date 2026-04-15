<?php

use App\Helpers\ItalianNationalHolidays;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('holidays:seed-it {--year=} {--from=} {--to=} {--dry-run}', function () {
    $singleYear = $this->option('year');
    $from = $this->option('from');
    $to = $this->option('to');
    $dryRun = (bool) $this->option('dry-run');

    if ($singleYear !== null && ($from !== null || $to !== null)) {
        $this->error('Usa --year oppure --from/--to, non insieme.');
        return self::FAILURE;
    }

    if ($singleYear !== null) {
        $fromYear = (int) $singleYear;
        $toYear = (int) $singleYear;
    } else {
        $fromYear = $from !== null ? (int) $from : (int) now()->year;
        $toYear = $to !== null ? (int) $to : $fromYear;
    }

    if ($fromYear < 1900 || $toYear > 2100 || $fromYear > $toYear) {
        $this->error('Intervallo anni non valido. Usa valori tra 1900 e 2100.');
        return self::FAILURE;
    }

    $rows = [];
    for ($year = $fromYear; $year <= $toYear; $year++) {
        foreach (ItalianNationalHolidays::forYear($year) as $holiday) {
            $rows[] = [
                'date' => $holiday['date'],
                'description' => $holiday['description'],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
    }

    $total = count($rows);
    if ($total === 0) {
        $this->warn('Nessuna festività da elaborare.');
        return self::SUCCESS;
    }

    if ($dryRun) {
        $this->info("Dry-run: verrebbero elaborate {$total} festività ({$fromYear}-{$toYear}).");
        return self::SUCCESS;
    }

    $inserted = DB::table('company_holidays')->insertOrIgnore($rows);
    $skipped = $total - $inserted;

    $this->info("Completato: {$inserted} aggiunte, {$skipped} già presenti ({$fromYear}-{$toYear}).");
    return self::SUCCESS;
})->purpose('Pre-carica festività nazionali italiane su uno o più anni');
