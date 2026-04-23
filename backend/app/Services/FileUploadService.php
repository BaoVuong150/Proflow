<?php

namespace App\Services;

use App\Models\UserQuota;
use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class FileUploadService
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv',
        'application/zip',
    ];

    private Cloudinary $cloudinary;

    public function __construct()
    {
        // Instantiated lazily
    }

    private function getCloudinary(): Cloudinary
    {
        if (! isset($this->cloudinary)) {
            $this->cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => config('cloudinary.cloud_name') ?? 'demo',
                    'api_key'    => config('cloudinary.api_key') ?? '123',
                    'api_secret' => config('cloudinary.api_secret') ?? 'abc',
                ],
                'url' => [
                    'secure' => true,
                ],
            ]);
        }
        return $this->cloudinary;
    }

    /**
     * Validate, check quota, upload to Cloudinary, and update quota atomically.
     *
     * @return array{original_name: string, file_path: string, file_size: int, mime_type: string}
     */
    public function upload(UploadedFile $file, int $userId, string $directory = 'attachments'): array
    {
        $maxFileSize = config('cloudinary.max_file_size');

        if ($file->getSize() > $maxFileSize) {
            throw new BadRequestHttpException('File size exceeds the maximum allowed size of 10MB.');
        }

        if (! in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            throw new BadRequestHttpException('File type is not allowed.');
        }

        // ── Atomic Quota Check (prevents concurrency bypass) ──
        return DB::transaction(function () use ($file, $userId, $directory) {
            $quota = UserQuota::lockForUpdate()->firstOrCreate(
                ['user_id' => $userId],
                ['storage_used' => 0, 'storage_limit' => config('cloudinary.user_quota'), 'file_count' => 0]
            );

            if (! $quota->hasQuotaFor($file->getSize())) {
                $remainingMB = round($quota->remainingStorage() / 1024 / 1024, 2);
                throw new BadRequestHttpException(
                    "Storage quota exceeded. You have {$remainingMB}MB remaining."
                );
            }

            // ── Upload to Cloudinary ──
            $folder = config('cloudinary.folder') . '/' . $directory;
            $result = $this->getCloudinary()->uploadApi()->upload(
                $file->getRealPath(),
                [
                    'folder'          => $folder,
                    'resource_type'   => 'auto',
                    'use_filename'    => true,
                    'unique_filename' => true,
                ]
            );

            // ── Update quota after successful upload ──
            $quota->increment('storage_used', $file->getSize());
            $quota->increment('file_count');

            return [
                'original_name' => $file->getClientOriginalName(),
                'file_path'     => $result['secure_url'],
                'file_size'     => $file->getSize(),
                'mime_type'     => $file->getMimeType(),
            ];
        });
    }

    /**
     * Delete a file from Cloudinary and release quota.
     */
    public function delete(string $fileUrl, int $userId, int $fileSize = 0): void
    {
        // Extract public_id from Cloudinary URL
        $publicId = $this->extractPublicId($fileUrl);

        if ($publicId) {
            try {
                $this->getCloudinary()->uploadApi()->destroy($publicId);
            } catch (\Exception $e) {
                // Log but don't block deletion from DB
                \Log::warning('Cloudinary delete failed: ' . $e->getMessage());
            }
        }

        // ── Release quota ──
        if ($fileSize > 0) {
            $quota = UserQuota::where('user_id', $userId)->first();
            if ($quota) {
                $quota->decrement('storage_used', min($fileSize, $quota->storage_used));
                $quota->decrement('file_count', min(1, $quota->file_count));
            }
        }
    }

    /**
     * Extract Cloudinary public_id from a secure URL.
     */
    private function extractPublicId(string $url): ?string
    {
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v123/proflow/attachments/filename.ext
        if (! str_contains($url, 'cloudinary.com')) {
            return null;
        }

        $path = parse_url($url, PHP_URL_PATH);
        // Remove /image/upload/v{version}/ or /raw/upload/v{version}/ prefix
        $path = preg_replace('#^/[^/]+/(image|video|raw)/upload/v\d+/#', '', $path);
        // Remove file extension
        $publicId = preg_replace('#\.[^.]+$#', '', $path);

        return $publicId ?: null;
    }
}
