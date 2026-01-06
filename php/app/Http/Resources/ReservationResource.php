<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ReservationResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'book_id' => $this->book_id,
            'reservation_date' => $this->reservation_date?->format('Y-m-d'),
            'status' => $this->status,
            'book' => $this->whenLoaded('book', fn() => new BookResource($this->book)),
            'member' => $this->whenLoaded('member', fn() => new MemberResource($this->member)),
        ];
    }
}

