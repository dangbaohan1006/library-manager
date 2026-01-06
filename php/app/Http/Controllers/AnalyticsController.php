<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Fine;
use App\Models\Loan;
use App\Models\Member;
use App\Enums\LoanStatus;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalBooks = Book::count();
        $totalMembers = Member::count();

        $activeLoans = Loan::where('status', LoanStatus::ACTIVE->value)->count();

        $overdueLoans = Loan::whereNull('return_date')
            ->where('due_date', '<', Carbon::today())
            ->count();

        $pendingFines = Fine::where('status', 'pending')->sum('amount');

        return response()->json([
            'total_books' => $totalBooks,
            'total_members' => $totalMembers,
            'active_loans' => $activeLoans,
            'overdue_loans' => $overdueLoans,
            'pending_fines' => (float) $pendingFines,
        ]);
    }

    public function topBooks(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);

        // Match Python query: join Loan with Book, group by Book.id
        $results = DB::table('loans')
            ->join('books', 'loans.book_id', '=', 'books.id')
            ->select('books.*', DB::raw('count(loans.id) as total_loans'))
            ->groupBy('books.id')
            ->orderByDesc('total_loans')
            ->limit($limit)
            ->get();

        $response = [];
        foreach ($results as $book) {
            $response[] = [
                'book_title' => $book->title ?? 'Unknown Book',
                'author' => $book->author ?? 'Unknown Author',
                'isbn' => $book->isbn ?? '',
                'total_loans' => (int) $book->total_loans,
                'available_copies' => (int) $book->available_copies ?? 0,
            ];
        }

        return response()->json($response);
    }

    public function overdueList(): JsonResponse
    {
        $today = Carbon::today();

        $overdueLoans = Loan::with(['book', 'member'])
            ->whereNull('return_date')
            ->where('due_date', '<', $today)
            ->orderByDesc('id')
            ->get();

        $response = [];
        foreach ($overdueLoans as $loan) {
            // Match Python: (today - loan.due_date).days
            $daysOverdue = $today->diffInDays($loan->due_date);
            $response[] = [
                'loan_id' => $loan->id,
                'member_name' => $loan->member->full_name ?? 'Unknown',
                'member_email' => $loan->member->email ?? 'Unknown',
                'book_title' => $loan->book->title ?? 'Unknown Book',
                'due_date' => $loan->due_date->format('Y-m-d'), // Python date serializes to YYYY-MM-DD
                'days_overdue' => $daysOverdue,
                'estimated_fine' => $daysOverdue * 5000,
            ];
        }

        return response()->json($response);
    }
}

