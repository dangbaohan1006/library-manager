<?php

namespace App\Services;

use App\Constants\FineRates;
use App\Constants\LoanLimits;
use App\Enums\FineStatus;
use App\Enums\LoanStatus;
use App\Models\Book;
use App\Models\Fine;
use App\Models\Loan;
use App\Models\Member;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class LoanService
{
    public function borrowBook(array $data): Loan
    {
        return DB::transaction(function () use ($data) {
            // Lock member row for update
            $member = Member::lockForUpdate()->find($data['member_id']);
            
            if (!$member || !$member->is_active) {
                throw new \Exception('Member invalid', 400);
            }

            // Check active loans count
            $activeLoansCount = Loan::where('member_id', $data['member_id'])
                ->where('status', LoanStatus::ACTIVE->value)
                ->count();

            if ($activeLoansCount >= LoanLimits::MAX_BOOKS_PER_MEMBER) {
                throw new \Exception('Limit reached', 400);
            }

            // Lock book row for update
            $book = Book::lockForUpdate()->find($data['book_id']);
            
            if (!$book) {
                throw new \Exception('Book not found', 404);
            }

            // Check available copies
            if ($book->available_copies < 1) {
                throw new \Exception('Out of stock', 400);
            }

            // If borrowing from reservation, check other pending reservations
            if (isset($data['reservation_id'])) {
                $pendingReservationsCount = Reservation::where('book_id', $data['book_id'])
                    ->where('status', 'pending')
                    ->where('id', '!=', $data['reservation_id'])
                    ->count();

                if ($book->available_copies <= $pendingReservationsCount) {
                    throw new \Exception(
                        "Not enough copies available. There are {$pendingReservationsCount} other pending reservations for this book.",
                        400
                    );
                }
            }

            // Decrement available copies
            $book->available_copies -= 1;
            $book->save();

            // Update reservation status if reservation_id is provided
            if (isset($data['reservation_id'])) {
                $reservation = Reservation::find($data['reservation_id']);
                
                if ($reservation) {
                    if ($reservation->book_id == $data['book_id'] && $reservation->member_id == $data['member_id']) {
                        $reservation->status = 'approved';
                        $reservation->save();
                    } else {
                        throw new \Exception('Reservation does not match the loan details', 400);
                    }
                }
            }

            // Create new loan
            $days = $data['days'] ?? LoanLimits::LOAN_DURATION_DAYS;
            $dueDate = Carbon::today()->addDays($days);

            $loan = Loan::create([
                'member_id' => $data['member_id'],
                'book_id' => $data['book_id'],
                'loan_date' => Carbon::today(),
                'due_date' => $dueDate,
                'status' => LoanStatus::ACTIVE->value,
            ]);

            return $loan->load(['book', 'member', 'fines']);
        });
    }

    public function returnBook(int $loanId): Loan
    {
        $loan = Loan::with(['book', 'fines'])->find($loanId);

        if (!$loan) {
            throw new \Exception('Loan not found', 404);
        }

        if ($loan->status === LoanStatus::RETURNED->value) {
            throw new \Exception('This loan is already returned', 400);
        }

        return DB::transaction(function () use ($loan) {
            $today = Carbon::today();
            $loan->return_date = $today;
            $loan->status = LoanStatus::RETURNED->value;

            // Calculate fine if overdue
            if ($today->gt($loan->due_date)) {
                $overdueDays = $today->diffInDays($loan->due_date);
                $fineAmount = $overdueDays * FineRates::FINE_PER_DAY;

                Fine::create([
                    'loan_id' => $loan->id,
                    'amount' => $fineAmount,
                    'status' => FineStatus::PENDING->value,
                ]);
            }

            // Increment available copies
            if ($loan->book && $loan->book->available_copies < $loan->book->total_copies) {
                $loan->book->available_copies += 1;
                $loan->book->save();
            }

            $loan->save();

            return $loan->load(['book', 'member', 'fines']);
        });
    }

    public function payFine(int $fineId): Loan
    {
        $fine = Fine::find($fineId);

        if (!$fine) {
            throw new \Exception('Fine not found', 404);
        }

        if ($fine->status === FineStatus::PAID->value) {
            throw new \Exception('Fine is already paid', 400);
        }

        $fine->status = FineStatus::PAID->value;
        $fine->save();

        return Loan::with(['book', 'member', 'fines'])->find($fine->loan_id);
    }
}

