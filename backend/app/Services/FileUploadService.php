<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class FileUploadService
{
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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

    /**
     * Validate and store an uploaded file.
     *
     * @return array{original_name: string, file_path: string, file_size: int, mime_type: string}
     */
    public function upload(UploadedFile $file, string $directory = 'attachments'): array
    {
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new BadRequestHttpException('File size exceeds the maximum allowed size of 10MB.');
        }

        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            throw new BadRequestHttpException('File type is not allowed.');
        }

        $path = $file->store($directory, 'public');

        return [
            'original_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Delete a file from storage.
     */
    public function delete(string $filePath): void
    {
        Storage::disk('public')->delete($filePath);
    }
}
