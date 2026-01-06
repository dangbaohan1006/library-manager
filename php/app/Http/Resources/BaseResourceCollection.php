<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

class BaseResourceCollection extends ResourceCollection
{
    /**
     * Disable wrapping to match Python FastAPI response format
     * Python returns data directly without "data" key wrapper
     */
    public static $wrap = null;

    public function toArray($request): array
    {
        // Return collection directly without wrapping
        return $this->collection->map(function ($resource) {
            return $resource instanceof \Illuminate\Http\Resources\Json\JsonResource
                ? $resource->resolve($request)
                : $resource;
        })->all();
    }
}

