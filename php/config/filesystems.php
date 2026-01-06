<?php

return [
    'disks' => [
        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_REGION'),
            'bucket' => env('S3_BUCKET_NAME'),
        ],
    ],
];

