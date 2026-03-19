<?php

namespace App\Helpers;

use Carbon\Carbon;

class WorkingDays
{
    /**
     * Conta i giorni lavorativi tra due date (esclusi sabato e domenica).
     */
    public static function between(string $startDate, string $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($start->gt($end)) {
            return 0;
        }

        $count = 0;
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            if (! $cursor->isWeekend()) {
                $count++;
            }
            $cursor->addDay();
        }

        return $count;
    }
}
