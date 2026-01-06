<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        $members = [
            ['email' => 'nguyen.van.a@example.com', 'full_name' => 'Nguyễn Văn A', 'phone' => '0901234567', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(12)],
            ['email' => 'tran.thi.b@example.com', 'full_name' => 'Trần Thị B', 'phone' => '0902345678', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(10)],
            ['email' => 'le.van.c@example.com', 'full_name' => 'Lê Văn C', 'phone' => '0903456789', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(8)],
            ['email' => 'pham.thi.d@example.com', 'full_name' => 'Phạm Thị D', 'phone' => '0904567890', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(6)],
            ['email' => 'hoang.van.e@example.com', 'full_name' => 'Hoàng Văn E', 'phone' => '0905678901', 'is_active' => false, 'joined_date' => Carbon::now()->subMonths(8)],
            ['email' => 'vu.thi.f@example.com', 'full_name' => 'Vũ Thị F', 'phone' => '0906789012', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(5)],
            ['email' => 'dang.van.g@example.com', 'full_name' => 'Đặng Văn G', 'phone' => '0907890123', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(4)],
            ['email' => 'bui.thi.h@example.com', 'full_name' => 'Bùi Thị H', 'phone' => '0908901234', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(3)],
            ['email' => 'do.van.i@example.com', 'full_name' => 'Đỗ Văn I', 'phone' => '0909012345', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(2)],
            ['email' => 'nguyen.thi.j@example.com', 'full_name' => 'Nguyễn Thị J', 'phone' => '0910123456', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(1)],
            ['email' => 'tran.van.k@example.com', 'full_name' => 'Trần Văn K', 'phone' => '0911234567', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(9)],
            ['email' => 'le.thi.l@example.com', 'full_name' => 'Lê Thị L', 'phone' => '0912345678', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(7)],
            ['email' => 'pham.van.m@example.com', 'full_name' => 'Phạm Văn M', 'phone' => '0913456789', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(5)],
            ['email' => 'hoang.thi.n@example.com', 'full_name' => 'Hoàng Thị N', 'phone' => '0914567890', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(4)],
            ['email' => 'vu.van.o@example.com', 'full_name' => 'Vũ Văn O', 'phone' => '0915678901', 'is_active' => false, 'joined_date' => Carbon::now()->subMonths(6)],
            ['email' => 'dang.thi.p@example.com', 'full_name' => 'Đặng Thị P', 'phone' => '0916789012', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(3)],
            ['email' => 'bui.van.q@example.com', 'full_name' => 'Bùi Văn Q', 'phone' => '0917890123', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(2)],
            ['email' => 'do.thi.r@example.com', 'full_name' => 'Đỗ Thị R', 'phone' => '0918901234', 'is_active' => true, 'joined_date' => Carbon::now()->subMonths(1)],
            ['email' => 'nguyen.van.s@example.com', 'full_name' => 'Nguyễn Văn S', 'phone' => '0919012345', 'is_active' => true, 'joined_date' => Carbon::now()->subWeeks(2)],
            ['email' => 'tran.thi.t@example.com', 'full_name' => 'Trần Thị T', 'phone' => '0920123456', 'is_active' => true, 'joined_date' => Carbon::now()->subWeeks(1)],
        ];

        foreach ($members as $member) {
            Member::create($member);
        }
    }
}

