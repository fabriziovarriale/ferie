<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['code' => 'FERIE', 'description' => 'Ferie', 'deducts_balance' => true, 'unit' => 'days'],
            ['code' => 'MALATTIA', 'description' => 'Malattia', 'deducts_balance' => false, 'unit' => 'days'],
            ['code' => 'PERMESSO', 'description' => 'Permesso', 'deducts_balance' => false, 'unit' => 'hours'],
            ['code' => 'ROL', 'description' => 'ROL', 'deducts_balance' => true, 'unit' => 'hours'],
        ];

        foreach ($types as $type) {
            DB::table('leave_types')->updateOrInsert(
                ['code' => $type['code']],
                array_merge($type, ['active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
