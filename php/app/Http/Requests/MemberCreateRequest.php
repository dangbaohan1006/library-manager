<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MemberCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                Rule::unique('members', 'email')->ignore($this->route('member')),
            ],
            'full_name' => ['required', 'string', 'min:1'],
            'phone' => ['nullable', 'string'],
        ];
    }
}

