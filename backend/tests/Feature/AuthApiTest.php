<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('can register a new user', function () {
    $response = $this->withSession([])->postJson('/api/v1/auth/register', [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'John Doe')
        ->assertJsonPath('data.email', 'john@example.com');

    $this->assertDatabaseHas('users', [
        'email' => 'john@example.com',
    ]);
});

it('can login an existing user', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->withSession([])->postJson('/api/v1/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.email', 'test@example.com');
        
    $this->assertAuthenticatedAs($user);
});

it('fails to login with invalid credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->withSession([])->postJson('/api/v1/auth/login', [
        'email' => 'test@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
        
    $this->assertGuest();
});

it('can fetch the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/v1/auth/user');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.email', $user->email);
});

it('fails to fetch user if unauthenticated', function () {
    $response = $this->getJson('/api/v1/auth/user');

    $response->assertStatus(401)
        ->assertJsonPath('success', false)
        ->assertJsonPath('message', 'Unauthenticated.');
});

it('can logout an authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->withSession([])->postJson('/api/v1/auth/logout');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('message', 'Logged out successfully');
});

it('enforces rate limiting on login', function () {
    // 5 attempts allowed per minute
    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'wrong',
        ])->assertStatus(422);
    }

    // 6th attempt should be rate limited (429)
    $this->postJson('/api/v1/auth/login', [
        'email' => 'ratelimit@example.com',
        'password' => 'wrong',
    ])->assertStatus(429);
});

// --- EDGE CASES ---

it('fails to register if email already exists', function () {
    User::factory()->create([
        'email' => 'duplicate@example.com',
    ]);

    $response = $this->withSession([])->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'duplicate@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('fails to register if password is too short', function () {
    $response = $this->withSession([])->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'short', // less than 8 chars
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

it('fails to register if password confirmation does not match', function () {
    $response = $this->withSession([])->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password456', // mismatch
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

it('fails to login with missing fields', function () {
    $response = $this->withSession([])->postJson('/api/v1/auth/login', [
        // completely empty body
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'password']);
});

it('fails to login with non-existent email', function () {
    $response = $this->withSession([])->postJson('/api/v1/auth/login', [
        'email' => 'nobody@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});
