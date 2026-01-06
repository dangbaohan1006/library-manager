<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Member;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReservationService
{
    public function createReservation(array $data): Reservation
    {
        return DB::transaction(function () use ($data) {
            $book = Book::find($data['book_id']);
            if (!$book) {
                throw new \Exception('Book not found', 404);
            }

            $member = Member::find($data['member_id']);
            if (!$member) {
                throw new \Exception('Member not found', 404);
            }

            // Check for duplicate pending reservation
            $existingReservation = Reservation::where('book_id', $data['book_id'])
                ->where('member_id', $data['member_id'])
                ->where('status', 'pending')
                ->first();

            if ($existingReservation) {
                throw new \Exception('Member already has a pending reservation for this book', 400);
            }

            $reservation = Reservation::create([
                'book_id' => $data['book_id'],
                'member_id' => $data['member_id'],
                'reservation_date' => $data['reservation_date'] ?? Carbon::today(),
                'status' => 'pending',
            ]);

            return $reservation->load(['book', 'member']);
        });
    }
}

