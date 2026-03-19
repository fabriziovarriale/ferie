<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call(LeaveTypeSeeder::class);

        User::factory()->create([
            'name' => 'Admin Bitboss',
            'first_name' => 'Admin',
            'last_name' => 'Bitboss',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Fabrizio Bitboss',
            'first_name' => 'Fabrizio',
            'last_name' => 'Bitboss',
            'email' => 'fabrizio@example.com',
            'role' => 'user',
        ]);
    }
}
