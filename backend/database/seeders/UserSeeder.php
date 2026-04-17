<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin User
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@proflow.test',
            'password' => Hash::make('password'),
        ]);

        // Demo User
        User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@proflow.test',
            'password' => Hash::make('password'),
        ]);

        // Create 10 random users
        User::factory(10)->create();
    }
}
