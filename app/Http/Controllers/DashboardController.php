<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\Marche;
use App\Models\LoiFinance;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'totalAgenda' => Agenda::count(),

            'totalMarches' => Marche::count(),

            'totalLoiFinance' => LoiFinance::count(),

            'montantGlobal' => LoiFinance::sum('montantGlobal'),

            'montantCaution' => LoiFinance::sum('montantCaution'),

            'updated_at' => now()->toISOString(),
        ]);
    }
}