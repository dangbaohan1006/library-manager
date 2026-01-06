<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReservationCreateRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function __construct(
        private ReservationService $reservationService
    ) {}

    public function index(Request $request)
    {
        $query = Reservation::with(['book', 'member']);

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

        if ($sortBy && in_array($sortBy, ['reservation_date', 'status'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $skip = $request->input('skip', 0);
        $limit = $request->input('limit', 100);

        $reservations = $query->skip($skip)->take($limit)->get();

        // Return array directly to match Python FastAPI format (no "data" wrapper)
        $data = $reservations->map(function ($reservation) {
            return (new ReservationResource($reservation))->resolve(request());
        })->all();

        return response()->json($data);
    }

    public function store(ReservationCreateRequest $request): JsonResponse
    {
        try {
            $reservation = $this->reservationService->createReservation($request->validated());

            return response()->json(new ReservationResource($reservation), 201);
        } catch (\Exception $e) {
            $statusCode = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['detail' => $e->getMessage()], $statusCode);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['detail' => 'Reservation not found'], 404);
        }

        $reservation->delete();

        return response()->json(null, 204);
    }
}

