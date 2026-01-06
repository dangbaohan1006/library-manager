<?php

namespace Database\Seeders;

use App\Models\Reservation;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        // Generate 20 reservations
        for ($i = 1; $i <= 20; $i++) {
            $memberId = (($i - 1) % 20) + 1; // Cycle through members 1-20
            $bookId = (($i - 1) % 20) + 1; // Cycle through books 1-20
            
            // 70% pending, 30% approved
            $status = rand(1, 100) <= 70 ? 'pending' : 'approved';
            $daysAgo = rand(1, 30);
            
            Reservation::create([
                'member_id' => $memberId,
                'book_id' => $bookId,
                'reservation_date' => $today->copy()->subDays($daysAgo),
                'status' => $status,
            ]);
        }
    }
}

