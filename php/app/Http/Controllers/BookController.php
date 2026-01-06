<?php

namespace App\Http\Controllers;

use App\Http\Requests\BookCreateRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Services\BookService;
use App\Services\S3Service;
use App\Enums\LoanStatus;
use App\Models\Loan;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookController extends Controller
{
    public function __construct(
        private BookService $bookService,
        private S3Service $s3Service
    ) {}

    public function index(Request $request)
    {
        $query = Book::query();

        // Text search filter
        if ($request->has('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%");
            });
        }

        // Column-specific filters
        if ($request->has('title')) {
            $query->where('title', 'like', "%{$request->input('title')}%");
        }
        if ($request->has('author')) {
            $query->where('author', 'like', "%{$request->input('author')}%");
        }
        if ($request->has('isbn')) {
            $query->where('isbn', 'like', "%{$request->input('isbn')}%");
        }

        // Sorting
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'desc');

        if ($sortBy && in_array($sortBy, ['title', 'author', 'isbn', 'publication_year', 'total_copies', 'available_copies'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $skip = $request->input('skip', 0);
        $limit = $request->input('limit', 100);

        $books = $query->skip($skip)->take($limit)->get();

        // Return array directly to match Python FastAPI format (no "data" wrapper)
        $data = $books->map(function ($book) {
            return (new BookResource($book))->resolve(request());
        })->all();

        return response()->json($data);
    }

    public function show(int $id): JsonResponse
    {
        $book = Book::find($id);

        if (!$book) {
            return response()->json(['detail' => 'Book not found'], 404);
        }

        return response()->json(new BookResource($book));
    }

    public function store(BookCreateRequest $request): JsonResponse
    {
        try {
            $bookService = new BookService();

            if ($bookService->checkIsbnExists($request->input('isbn'))) {
                $cleanIsbn = $bookService->cleanIsbn($request->input('isbn'));
                return response()->json(['detail' => "Sách với ISBN {$cleanIsbn} đã tồn tại!"], 400);
            }

            $book = Book::create([
                'title' => $request->input('title'),
                'author' => $request->input('author'),
                'isbn' => $bookService->cleanIsbn($request->input('isbn')),
                'total_copies' => $request->input('total_copies'),
                'available_copies' => $request->input('total_copies'),
                'edition' => $request->input('edition'),
                'publication_year' => $request->input('publication_year'),
                'image_path' => $request->input('image_path'),
            ]);

            return response()->json(new BookResource($book), 201);
        } catch (\Exception $e) {
            return response()->json(['detail' => 'Lỗi Database: ' . $e->getMessage()], 500);
        }
    }

    public function update(BookCreateRequest $request, int $id): JsonResponse
    {
        $book = Book::lockForUpdate()->find($id);

        if (!$book) {
            return response()->json(['detail' => 'Book not found'], 404);
        }

        try {
            $bookService = new BookService();

            // Handle total_copies change
            if ($request->input('total_copies') != $book->total_copies) {
                $bookService->updateTotalCopies($book, $request->input('total_copies'));
            }

            $book->title = $request->input('title');
            $book->author = $request->input('author');
            $book->edition = $request->input('edition');
            $book->publication_year = $request->input('publication_year');

            if ($request->has('image_path')) {
                $book->image_path = $request->input('image_path');
            }

            // Handle ISBN change
            $cleanIsbn = $bookService->cleanIsbn($request->input('isbn'));
            if ($cleanIsbn !== $book->isbn) {
                if ($bookService->checkIsbnExists($cleanIsbn, $id)) {
                    return response()->json(['detail' => "ISBN {$cleanIsbn} đã thuộc về sách khác"], 400);
                }
                $book->isbn = $cleanIsbn;
            }

            $book->save();

            return response()->json(new BookResource($book));
        } catch (\Exception $e) {
            return response()->json(['detail' => $e->getMessage()], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $book = Book::lockForUpdate()->find($id);

        if (!$book) {
            return response()->json(['detail' => 'Book not found'], 404);
        }

        try {
            $canDelete = $this->bookService->canDeleteBook($id);

            if (!$canDelete['can_delete']) {
                return response()->json(['detail' => $canDelete['reason']], 400);
            }

            $book->delete();

            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['detail' => $e->getMessage()], 500);
        }
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image'],
        ]);

        try {
            $imageUrl = $this->s3Service->uploadImage($request->file('file'));

            return response()->json(['image_path' => $imageUrl]);
        } catch (\Exception $e) {
            return response()->json(['detail' => $e->getMessage()], $e->getCode() ?: 500);
        }
    }
}

