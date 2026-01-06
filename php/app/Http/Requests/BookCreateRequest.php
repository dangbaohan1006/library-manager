<?php

namespace App\Http\Requests;

use App\Services\BookService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $bookService = new BookService();
        $isbn = $this->input('isbn');
        $cleanIsbn = $isbn ? $bookService->cleanIsbn($isbn) : null;

        return [
            'title' => ['required', 'string', 'min:1'],
            'author' => ['required', 'string', 'min:1'],
            'edition' => ['nullable', 'string'],
            'publication_year' => ['nullable', 'integer'],
            'isbn' => [
                'required',
                'string',
                'min:10',
                'max:17',
                function ($attribute, $value, $fail) use ($bookService) {
                    try {
                        $bookService->validateIsbn($value);
                    } catch (\Exception $e) {
                        $fail($e->getMessage());
                    }
                },
                Rule::unique('books', 'isbn')->ignore($this->route('book')),
            ],
            'total_copies' => ['required', 'integer', 'min:0'],
            'image_path' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('isbn')) {
            $bookService = new BookService();
            $this->merge([
                'isbn' => $bookService->cleanIsbn($this->input('isbn')),
            ]);
        }
    }
}

