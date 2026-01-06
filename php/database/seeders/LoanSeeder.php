<?php

namespace Database\Seeders;

use App\Models\Loan;
use App\Models\Fine;
use App\Models\Book;
use App\Enums\LoanStatus;
use App\Enums\FineStatus;
use App\Constants\FineRates;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class LoanSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();
        $createdLoans = 0;
        $maxLoans = 20;

        // Generate 20 loans with various statuses
        while ($createdLoans < $maxLoans) {
            $memberId = rand(1, 20);
            $bookId = rand(1, 20);
            $book = Book::find($bookId);
            
            if (!$book) continue;

            $daysAgo = rand(1, 30);
            $loanDate = $today->copy()->subDays($daysAgo);
            $dueDate = $loanDate->copy()->addDays(14);
            
            // Determine loan status
            $isReturned = rand(1, 100) <= 60; // 60% chance of being returned
            $isOverdue = !$isReturned && $dueDate < $today;
            
            if ($isReturned) {
                $returnDate = $dueDate->copy()->addDays(rand(-5, 10)); // Returned -5 to +10 days from due date
                $status = LoanStatus::RETURNED->value;
                
                // If returned after due date, create fine
                if ($returnDate > $dueDate) {
                    $overdueDays = $returnDate->diffInDays($dueDate);
                    $fineAmount = $overdueDays * FineRates::FINE_PER_DAY;
                    $fineStatus = rand(1, 100) <= 70 ? FineStatus::PAID->value : FineStatus::PENDING->value;
                    
                    $loan = Loan::create([
                        'member_id' => $memberId,
                        'book_id' => $bookId,
                        'loan_date' => $loanDate,
                        'due_date' => $dueDate,
                        'return_date' => $returnDate,
                        'status' => $status,
                    ]);
                    
                    Fine::create([
                        'loan_id' => $loan->id,
                        'amount' => $fineAmount,
                        'status' => $fineStatus,
                    ]);
                } else {
                    Loan::create([
                        'member_id' => $memberId,
                        'book_id' => $bookId,
                        'loan_date' => $loanDate,
                        'due_date' => $dueDate,
                        'return_date' => $returnDate,
                        'status' => $status,
                    ]);
                }
                $createdLoans++;
            } else {
                // Active loan - check available copies
                if ($book->available_copies > 0) {
                    // Check member's active loans count (skip limit check in seeder for variety)
                    $loan = Loan::create([
                        'member_id' => $memberId,
                        'book_id' => $bookId,
                        'loan_date' => $loanDate,
                        'due_date' => $dueDate,
                        'return_date' => null,
                        'status' => LoanStatus::ACTIVE->value,
                    ]);
                    
                    $book->available_copies -= 1;
                    $book->save();
                    
                    // If overdue, create pending fine
                    if ($isOverdue) {
                        $overdueDays = $today->diffInDays($dueDate);
                        $fineAmount = $overdueDays * FineRates::FINE_PER_DAY;
                        
                        Fine::create([
                            'loan_id' => $loan->id,
                            'amount' => $fineAmount,
                            'status' => FineStatus::PENDING->value,
                        ]);
                    }
                    $createdLoans++;
                }
            }
        }
    }
}

