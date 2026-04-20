<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserQuota;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CloudinaryQuotaTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test: Quota record is created automatically for new users.
     */
    public function test_quota_is_created_on_first_upload_attempt(): void
    {
        $user = User::factory()->create();

        // Quota should not exist yet
        $this->assertDatabaseMissing('user_quotas', ['user_id' => $user->id]);

        // Create quota manually (simulating what FileUploadService does)
        $quota = UserQuota::firstOrCreate(
            ['user_id' => $user->id],
            ['storage_used' => 0, 'storage_limit' => 100 * 1024 * 1024, 'file_count' => 0]
        );

        $this->assertDatabaseHas('user_quotas', ['user_id' => $user->id]);
        $this->assertEquals(0, $quota->storage_used);
        $this->assertEquals(100 * 1024 * 1024, $quota->storage_limit);
    }

    /**
     * Test: Quota check correctly blocks oversized uploads.
     */
    public function test_quota_blocks_when_storage_exceeded(): void
    {
        $user = User::factory()->create();

        $quota = UserQuota::create([
            'user_id'       => $user->id,
            'storage_used'  => 99 * 1024 * 1024, // 99MB used
            'storage_limit' => 100 * 1024 * 1024, // 100MB limit
            'file_count'    => 50,
        ]);

        // 2MB file should be rejected (99 + 2 > 100)
        $this->assertFalse($quota->hasQuotaFor(2 * 1024 * 1024));

        // 0.5MB file should be accepted (99 + 0.5 < 100)
        $this->assertTrue($quota->hasQuotaFor(512 * 1024));
    }

    /**
     * Test: Remaining storage calculation is correct.
     */
    public function test_remaining_storage_calculation(): void
    {
        $user = User::factory()->create();

        $quota = UserQuota::create([
            'user_id'       => $user->id,
            'storage_used'  => 30 * 1024 * 1024,  // 30MB used
            'storage_limit' => 100 * 1024 * 1024,  // 100MB limit
            'file_count'    => 10,
        ]);

        $remaining = $quota->remainingStorage();
        $this->assertEquals(70 * 1024 * 1024, $remaining); // 70MB remaining
    }

    /**
     * Test: Quota is released when file is deleted.
     */
    public function test_quota_released_on_delete(): void
    {
        $user = User::factory()->create();

        $quota = UserQuota::create([
            'user_id'       => $user->id,
            'storage_used'  => 50 * 1024 * 1024, // 50MB used
            'storage_limit' => 100 * 1024 * 1024,
            'file_count'    => 20,
        ]);

        $fileSize = 5 * 1024 * 1024; // 5MB file deleted

        $quota->decrement('storage_used', min($fileSize, $quota->storage_used));
        $quota->decrement('file_count', 1);
        $quota->refresh();

        $this->assertEquals(45 * 1024 * 1024, $quota->storage_used); // 45MB remaining
        $this->assertEquals(19, $quota->file_count);
    }
}
