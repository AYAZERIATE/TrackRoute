<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoiFinanceController extends Controller
{
    /**
     * CRUD minimal (mock-safe) pour le front.
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [],
            'total' => 0,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'loiFinance' => ['required', 'string'],
            'numeroDepense' => ['nullable', 'string'],
            'rubrique' => ['nullable', 'string'],
            'beneficiaire' => ['nullable', 'string'],
            'objet' => ['nullable', 'string'],
            'montantGlobal' => ['nullable', 'numeric'],
            'montantCaution' => ['nullable', 'numeric'],
            'montantRetenueGarantie' => ['nullable', 'numeric'],
            'dernierDecompte' => ['nullable', 'numeric'],
            'cp2026' => ['nullable', 'numeric'],
            'ce2027' => ['nullable', 'numeric'],
            'montantOrdonnance' => ['nullable', 'numeric'],
            'resteAOrdonnancer' => ['nullable', 'numeric'],
            'tauxEmission' => ['nullable', 'numeric'],
            'dateAttribution' => ['nullable', 'string'],
            'dateVisa' => ['nullable', 'string'],
            'dateApprobation' => ['nullable', 'string'],
            'dateNotificationApprobation' => ['nullable', 'string'],
            'dateCommencement' => ['nullable', 'string'],
            'datePVRD' => ['nullable', 'string'],
            'dateApprobationDD' => ['nullable', 'string'],
            'dateLiberationCautions' => ['nullable', 'string'],
        ]);

        return response()->json([
            'message' => 'Loi de finance créée (mock).',
            'data' => array_merge($validated, ['id' => now()->timestamp]),
        ], 201);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => $id,
                'loiFinance' => '—',
            ],
        ]);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $validated = $request->validate([
            'loiFinance' => ['sometimes', 'required', 'string'],
            'numeroDepense' => ['sometimes', 'nullable', 'string'],
            'rubrique' => ['sometimes', 'nullable', 'string'],
            'beneficiaire' => ['sometimes', 'nullable', 'string'],
            'objet' => ['sometimes', 'nullable', 'string'],
            'montantGlobal' => ['sometimes', 'nullable', 'numeric'],
            'montantCaution' => ['sometimes', 'nullable', 'numeric'],
            'montantRetenueGarantie' => ['sometimes', 'nullable', 'numeric'],
            'dernierDecompte' => ['sometimes', 'nullable', 'numeric'],
            'cp2026' => ['sometimes', 'nullable', 'numeric'],
            'ce2027' => ['sometimes', 'nullable', 'numeric'],
            'montantOrdonnance' => ['sometimes', 'nullable', 'numeric'],
            'resteAOrdonnancer' => ['sometimes', 'nullable', 'numeric'],
            'tauxEmission' => ['sometimes', 'nullable', 'numeric'],
            'dateAttribution' => ['sometimes', 'nullable', 'string'],
            'dateVisa' => ['sometimes', 'nullable', 'string'],
            'dateApprobation' => ['sometimes', 'nullable', 'string'],
            'dateNotificationApprobation' => ['sometimes', 'nullable', 'string'],
            'dateCommencement' => ['sometimes', 'nullable', 'string'],
            'datePVRD' => ['sometimes', 'nullable', 'string'],
            'dateApprobationDD' => ['sometimes', 'nullable', 'string'],
            'dateLiberationCautions' => ['sometimes', 'nullable', 'string'],
        ]);

        return response()->json([
            'message' => 'Loi de finance mise à jour (mock).',
            'data' => array_merge($validated, ['id' => $id]),
        ]);
    }

    public function destroy(Request $request, int|string $id): JsonResponse
    {
        return response()->json([
            'message' => 'Loi de finance supprimée (mock).',
            'id' => $id,
        ]);
    }
}

