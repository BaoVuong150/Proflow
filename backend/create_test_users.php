<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$users = [
    ['name' => 'Test Admin', 'email' => 'admin@test.com'],
    ['name' => 'Test Member', 'email' => 'member@test.com'],
    ['name' => 'Test Viewer', 'email' => 'viewer@test.com'],
];

foreach ($users as $u) {
    User::firstOrCreate(
        ['email' => $u['email']],
        [
            'name' => $u['name'],
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]
    );
}

echo "Created 3 test users: admin@test.com, member@test.com, viewer@test.com (Password: password123)\n";
