<?php

namespace App\Helpers;

class ItalianNationalHolidays
{
    private const FIXED_HOLIDAYS = [
        ['month' => 1, 'day' => 1, 'description' => 'Capodanno'],
        ['month' => 1, 'day' => 6, 'description' => 'Epifania'],
        ['month' => 4, 'day' => 25, 'description' => 'Festa della Liberazione'],
        ['month' => 5, 'day' => 1, 'description' => 'Festa dei Lavoratori'],
        ['month' => 6, 'day' => 2, 'description' => 'Festa della Repubblica'],
        ['month' => 8, 'day' => 15, 'description' => 'Ferragosto'],
        ['month' => 11, 'day' => 1, 'description' => 'Tutti i Santi'],
        ['month' => 12, 'day' => 8, 'description' => 'Immacolata Concezione'],
        ['month' => 12, 'day' => 25, 'description' => 'Natale'],
        ['month' => 12, 'day' => 26, 'description' => 'Santo Stefano'],
    ];

    public static function forYear(int $year): array
    {
        $holidays = array_map(static fn (array $holiday) => [
            'date' => sprintf('%04d-%02d-%02d', $year, $holiday['month'], $holiday['day']),
            'description' => $holiday['description'],
        ], self::FIXED_HOLIDAYS);

        $easterSunday = date('Y-m-d', easter_date($year));
        $easterMonday = date('Y-m-d', strtotime($easterSunday.' +1 day'));

        $holidays[] = ['date' => $easterSunday, 'description' => 'Pasqua'];
        $holidays[] = ['date' => $easterMonday, 'description' => "Lunedì dell'Angelo"];

        usort($holidays, static fn (array $a, array $b) => strcmp($a['date'], $b['date']));

        return $holidays;
    }
}
