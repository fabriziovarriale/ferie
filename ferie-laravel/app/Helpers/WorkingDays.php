<?php

namespace App\Helpers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class WorkingDays
{
    /**
     * Conta i giorni lavorativi tra due date, escludendo sabato, domenica
     * e le festività aziendali presenti in company_holidays.
     */
    public static function between(string $startDate, string $endDate): int
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        if ($start->gt($end)) {
            return 0;
        }

        $holidays = DB::table('company_holidays')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->pluck('date')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip()
            ->all();

        $count = 0;
        $cursor = $start->copy();

        while ($cursor->lte($end)) {
            if (! $cursor->isWeekend() && ! isset($holidays[$cursor->toDateString()])) {
                $count++;
            }
            $cursor->addDay();
        }

        return $count;
    }
}
