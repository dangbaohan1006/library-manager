<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoanCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'book_id' => ['required', 'integer', 'exists:books,id'],
            'days' => ['nullable', 'integer', 'min:1', 'max:30'],
            'reservation_id' => ['nullable', 'integer', 'exists:reservations,id'],
        ];
    }
}

