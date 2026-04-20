<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key'    => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Upload Settings
    |--------------------------------------------------------------------------
    | folder: All ProFlow uploads will be stored under this Cloudinary folder.
    | max_file_size: Maximum file size in bytes (10MB).
    | user_quota: Maximum total upload size per user in bytes (100MB).
    */
    'folder'        => 'proflow',
    'max_file_size'  => 10 * 1024 * 1024,  // 10MB per file
    'user_quota'     => 100 * 1024 * 1024,  // 100MB per user
];
