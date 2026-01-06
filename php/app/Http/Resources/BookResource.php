<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class BookResource extends BaseResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'edition' => $this->edition,
            'publication_year' => $this->publication_year,
            'isbn' => $this->isbn,
            'total_copies' => $this->total_copies,
            'available_copies' => $this->available_copies,
            'image_path' => $this->image_path,
        ];
    }
}

