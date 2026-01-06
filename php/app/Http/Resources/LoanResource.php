<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class LoanResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'book_id' => $this->book_id,
            'loan_date' => $this->loan_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'return_date' => $this->return_date?->format('Y-m-d'),
            'status' => $this->status,
            'book' => $this->whenLoaded('book', fn() => new BookResource($this->book)),
            'member' => $this->whenLoaded('member', fn() => new MemberResource($this->member)),
            'fines' => $this->whenLoaded('fines', fn() => FineResource::collection($this->fines)),
        ];
    }
}

