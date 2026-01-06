<?php

use Illuminate\Support\Facades\Facade;

return [
    'name' => env('APP_NAME', 'Library Manager'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => env('APP_TIMEZONE', 'UTC'),
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
];

