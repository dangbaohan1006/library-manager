<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Disable wrapping for all API resources to match Python FastAPI format
        // Python returns data directly without "data" key wrapper
        \Illuminate\Http\Resources\Json\JsonResource::withoutWrapping();
    }
}

