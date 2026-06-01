<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Statistics simples et sûres (comptes uniquement).
     */
    public function stats(Request $request): JsonResponse
    {
        return response()->json([
            'dotation' => 0,
            'engage' => 0,
            'txEngage' => 0,
            'txPaye' => 0,
            'actifs' => 0,
            'total' => 0,
            'top5' => [],
            'updated_at' => now()->toISOString(),
        ]);
    }
}

