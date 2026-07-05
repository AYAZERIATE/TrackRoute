<?php

namespace App\Http\Controllers;

use App\Models\LoiFinance;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LoiFinanceController extends Controller
{
    // Afficher toutes les lois de finance
    public function index(): JsonResponse
    {
        $lois = LoiFinance::all();

        return response()->json([
            'data' => $lois,
            'total' => $lois->count(),
        ]);
    }

    // Ajouter une loi de finance
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'loiFinance' => 'required|string',
            'numeroDepense' => 'nullable|string',
            'rubrique' => 'nullable|string',
            'beneficiaire' => 'nullable|string',
            'objet' => 'nullable|string',
            'montantGlobal' => 'nullable|numeric',
            'montantCaution' => 'nullable|numeric',
            'montantRetenueGarantie' => 'nullable|numeric',
            'dernierDecompte' => 'nullable|numeric',
            'cp2026' => 'nullable|numeric',
            'ce2027' => 'nullable|numeric',
            'montantOrdonnance' => 'nullable|numeric',
            'resteAOrdonnancer' => 'nullable|numeric',
            'tauxEmission' => 'nullable|numeric',
            'dateAttribution' => 'nullable|date',
            'dateVisa' => 'nullable|date',
            'dateApprobation' => 'nullable|date',
            'dateNotificationApprobation' => 'nullable|date',
            'dateCommencement' => 'nullable|date',
            'datePVRD' => 'nullable|date',
            'dateApprobationDD' => 'nullable|date',
            'dateLiberationCautions' => 'nullable|date',
        ]);

        $loi = LoiFinance::create($validated);

        return response()->json([
            'message' => 'Loi de finance créée avec succès.',
            'data' => $loi,
        ], 201);
    }

    // Afficher une loi de finance
    public function show($id): JsonResponse
    {
        $loi = LoiFinance::findOrFail($id);

        return response()->json($loi);
    }

    // Modifier une loi de finance
    public function update(Request $request, $id): JsonResponse
    {
        $loi = LoiFinance::findOrFail($id);

        $validated = $request->validate([
            'loiFinance' => 'sometimes|string',
            'numeroDepense' => 'nullable|string',
            'rubrique' => 'nullable|string',
            'beneficiaire' => 'nullable|string',
            'objet' => 'nullable|string',
            'montantGlobal' => 'nullable|numeric',
            'montantCaution' => 'nullable|numeric',
            'montantRetenueGarantie' => 'nullable|numeric',
            'dernierDecompte' => 'nullable|numeric',
            'cp2026' => 'nullable|numeric',
            'ce2027' => 'nullable|numeric',
            'montantOrdonnance' => 'nullable|numeric',
            'resteAOrdonnancer' => 'nullable|numeric',
            'tauxEmission' => 'nullable|numeric',
            'dateAttribution' => 'nullable|date',
            'dateVisa' => 'nullable|date',
            'dateApprobation' => 'nullable|date',
            'dateNotificationApprobation' => 'nullable|date',
            'dateCommencement' => 'nullable|date',
            'datePVRD' => 'nullable|date',
            'dateApprobationDD' => 'nullable|date',
            'dateLiberationCautions' => 'nullable|date',
        ]);

        $loi->update($validated);

        return response()->json([
            'message' => 'Loi de finance mise à jour.',
            'data' => $loi,
        ]);
    }

    // Supprimer une loi de finance
    public function destroy($id): JsonResponse
    {
        $loi = LoiFinance::findOrFail($id);

        $loi->delete();

        return response()->json([
            'message' => 'Loi de finance supprimée.',
        ]);
    }
}