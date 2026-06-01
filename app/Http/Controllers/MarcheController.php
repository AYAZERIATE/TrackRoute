<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MarcheController extends Controller
{
    /**
     * CRUD minimal en JSON (données mock/safe).
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
            'nom' => ['required', 'string'],
            'type' => ['nullable', 'string'],
            'objet' => ['nullable', 'string'],
            'montant' => ['nullable', 'numeric'],
            'avancement' => ['nullable', 'string'],
            'statut' => ['nullable', 'string'],
        ]);

        return response()->json([
            'message' => 'Marché créé (mock).',
            'data' => array_merge($validated, [
                'id' => now()->timestamp,
                'statut' => $validated['statut'] ?? 'En cours',
            ]),
        ], 201);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => $id,
                'nom' => 'Marché (mock)',
                'type' => null,
                'objet' => null,
                'montant' => 0,
                'avancement' => null,
                'statut' => 'En cours',
            ],
        ]);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $validated = $request->validate([
            'nom' => ['sometimes', 'required', 'string'],
            'type' => ['sometimes', 'nullable', 'string'],
            'objet' => ['sometimes', 'nullable', 'string'],
            'montant' => ['sometimes', 'nullable', 'numeric'],
            'avancement' => ['sometimes', 'nullable', 'string'],
            'statut' => ['sometimes', 'nullable', 'string'],
        ]);

        return response()->json([
            'message' => 'Marché mis à jour (mock).',
            'data' => array_merge($validated, ['id' => $id]),
        ]);
    }

    public function destroy(Request $request, int|string $id): JsonResponse
    {
        return response()->json([
            'message' => 'Marché supprimé (mock).',
            'id' => $id,
        ]);
    }
}

