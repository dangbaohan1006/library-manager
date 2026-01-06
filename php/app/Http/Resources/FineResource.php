<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class FineResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'status' => $this->status,
        ];
    }
}

