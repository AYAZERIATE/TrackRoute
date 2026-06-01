<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MapController extends Controller
{
    /**
     * Locations simples et stables (mock statique).
     */
    public function locations(Request $request): JsonResponse
    {
        $projects = [
            [
                'id' => 1,
                'name' => 'Marché M-2025-001',
                'lat' => 34.0209,
                'lng' => -6.8416,
                'status' => 'En cours',
                'budget' => 12000000,
                'region' => 'Rabat',
                'type' => 'Infrastructure',
            ],
            [
                'id' => 2,
                'name' => 'Marché M-2025-002',
                'lat' => 33.5731,
                'lng' => -7.5898,
                'status' => 'Clôturé',
                'budget' => 8500000,
                'region' => 'Casablanca',
                'type' => 'Bâtiment',
            ],
        ];

        return response()->json([
            'data' => $projects,
            'total' => count($projects),
        ]);
    }
}

