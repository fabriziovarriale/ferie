<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(LeaveTypeSeeder::class);

        if (! User::where('email', 'admin@ferie.it')->exists()) {
            User::create([
                'first_name' => 'Admin',
                'last_name'  => 'Bitboss',
                'email'      => 'admin@ferie.it',
                'password'   => Hash::make('Admin1234!'),
                'role'       => 'admin',
                'job_role'   => 'Socio',
                'active'     => true,
            ]);
        }
    }
}
