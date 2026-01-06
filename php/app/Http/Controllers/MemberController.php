<?php

namespace App\Http\Controllers;

use App\Http\Requests\MemberCreateRequest;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = Member::query();

        // Text search filter
        if ($request->has('q')) {
            $search = $request->input('q');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Column-specific filters
        if ($request->has('full_name')) {
            $query->where('full_name', 'like', "%{$request->input('full_name')}%");
        }
        if ($request->has('email')) {
            $query->where('email', 'like', "%{$request->input('email')}%");
        }
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Sorting
        $sortBy = $request->input('sort_by');
        $sortOrder = $request->input('sort_order', 'desc');

        if ($sortBy && in_array($sortBy, ['full_name', 'email', 'joined_date', 'is_active'])) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        $skip = $request->input('skip', 0);
        $limit = $request->input('limit', 100);

        $members = $query->skip($skip)->take($limit)->get();

        // Return array directly to match Python FastAPI format (no "data" wrapper)
        $data = $members->map(function ($member) {
            return (new MemberResource($member))->resolve(request());
        })->all();

        return response()->json($data);
    }

    public function show(int $id): JsonResponse
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json(['detail' => 'Member not found'], 404);
        }

        return response()->json(new MemberResource($member));
    }

    public function store(MemberCreateRequest $request): JsonResponse
    {
        $member = Member::create([
            'email' => $request->input('email'),
            'full_name' => $request->input('full_name'),
            'phone' => $request->input('phone'),
            'is_active' => true,
        ]);

        return response()->json(new MemberResource($member), 201);
    }

    public function update(MemberCreateRequest $request, int $id): JsonResponse
    {
        $member = Member::find($id);

        if (!$member) {
            return response()->json(['detail' => 'Member not found'], 404);
        }

        $member->full_name = $request->input('full_name');
        $member->phone = $request->input('phone');
        $member->save();

        return response()->json(new MemberResource($member));
    }
}

