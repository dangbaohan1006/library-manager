<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoanCreateRequest;
use App\Http\Resources\LoanResource;
use App\Models\Loan;
use App\Services\LoanService;
use App\Enums\LoanStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function __construct(
        private LoanService $loanService
    ) {}

    public function index(Request $request)
    {
        $query = Loan::with(['book', 'member', 'fines']);

        // Text search filter
        if ($request->has('q')) {
            $search = $request->input('q');
            $query->whereHas('book', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%");
            })->orWhereHas('member', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Sorting
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'desc');

        if ($sortBy && in_array($sortBy, ['loan_date', 'due_date', 'return_date', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $skip = $request->input('skip', 0);
        $limit = $request->input('limit', 100);

        $loans = $query->skip($skip)->take($limit)->get();

        // Return array directly to match Python FastAPI format (no "data" wrapper)
        $data = $loans->map(function ($loan) {
            return (new LoanResource($loan))->resolve(request());
        })->all();

        return response()->json($data);
    }

    public function borrow(LoanCreateRequest $request): JsonResponse
    {
        try {
            $loan = $this->loanService->borrowBook($request->validated());

            return response()->json(new LoanResource($loan), 201);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['detail' => $e->getMessage()], $statusCode);
        }
    }

    public function return(int $id): JsonResponse
    {
        try {
            $loan = $this->loanService->returnBook($id);

            return response()->json(new LoanResource($loan));
        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['detail' => $e->getMessage()], $statusCode);
        }
    }

    public function payFine(int $fineId): JsonResponse
    {
        try {
            $loan = $this->loanService->payFine($fineId);

            return response()->json(new LoanResource($loan));
        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['detail' => $e->getMessage()], $statusCode);
        }
    }

    public function checkAccess(Request $request): JsonResponse
    {
        $request->validate([
            'book_id' => ['required', 'integer'],
            'member_id' => ['required', 'integer'],
        ]);

        $loan = Loan::where('book_id', $request->input('book_id'))
            ->where('member_id', $request->input('member_id'))
            ->where('status', LoanStatus::ACTIVE->value)
            ->first();

        return response()->json(['has_access' => $loan !== null]);
    }
}

