<?php

namespace App\Http\Controllers;

use App\Models\Mappage;
use Illuminate\Http\JsonResponse;

class MapController extends Controller
{
    /**
     * Afficher tous les projets sur la carte.
     */
    public function locations(): JsonResponse
    {
        $projects = Mappage::all();

        return response()->json([
            'data' => $projects,
            'total' => $projects->count(),
        ]);
    }
}