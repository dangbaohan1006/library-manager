<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class MemberResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
            'joined_date' => $this->joined_date?->format('Y-m-d'),
        ];
    }
}

