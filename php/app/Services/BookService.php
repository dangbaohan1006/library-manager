<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Loan;
use App\Models\Reservation;
use App\Enums\LoanStatus;
use Illuminate\Support\Facades\DB;

class BookService
{
    public function cleanIsbn(string $isbn): string
    {
        return preg_replace('/[-\s]/', '', $isbn);
    }

    public function validateIsbn(string $isbn): void
    {
        $cleanIsbn = $this->cleanIsbn($isbn);
        
        if (!in_array(strlen($cleanIsbn), [10, 13])) {
            throw new \Exception('ISBN phải là 10 hoặc 13 số', 400);
        }
    }

    public function checkIsbnExists(string $isbn, ?int $excludeId = null): bool
    {
        $cleanIsbn = $this->cleanIsbn($isbn);
        $query = Book::where('isbn', $cleanIsbn);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    public function canDeleteBook(int $bookId): array
    {
        $activeLoans = Loan::where('book_id', $bookId)
            ->where('status', LoanStatus::ACTIVE->value)
            ->count();

        if ($activeLoans > 0) {
            return ['can_delete' => false, 'reason' => 'Không thể xóa: Sách đang được mượn!'];
        }

        $pendingReservations = Reservation::where('book_id', $bookId)
            ->where('status', 'pending')
            ->count();

        if ($pendingReservations > 0) {
            return ['can_delete' => false, 'reason' => 'Không thể xóa: Sách đang được đặt trước (Reservation)!'];
        }

        return ['can_delete' => true];
    }

    public function updateTotalCopies(Book $book, int $newTotalCopies): void
    {
        $diff = $newTotalCopies - $book->total_copies;
        
        if ($book->available_copies + $diff < 0) {
            throw new \Exception(
                "Không thể giảm tổng số lượng xuống {$newTotalCopies} vì đang có sách cho mượn!",
                400
            );
        }

        $book->available_copies += $diff;
        $book->total_copies = $newTotalCopies;
    }
}

