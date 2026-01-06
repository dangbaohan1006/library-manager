<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BaseResource extends JsonResource
{
    /**
     * Disable wrapping to match Python FastAPI response format
     * Python returns data directly without "data" key wrapper
     */
    public static $wrap = null;
}

