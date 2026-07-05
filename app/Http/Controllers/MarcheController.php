<?php

namespace App\Http\Controllers;

use App\Models\Marche;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MarcheController extends Controller
{
    // Afficher tous les marchés
    public function index(): JsonResponse
    {
        $marches = Marche::all();

        return response()->json([
            'data' => $marches,
            'total' => $marches->count(),
        ]);
    }

    // Ajouter un marché
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'objet' => 'nullable|string',
            'montant' => 'nullable|numeric',
            'avancement' => 'nullable|string|max:255',
            'statut' => 'nullable|string|max:255',
        ]);

        $marche = Marche::create($validated);

        return response()->json([
            'message' => 'Marché créé avec succès.',
            'data' => $marche,
        ], 201);
    }

    // Afficher un marché
    public function show($id): JsonResponse
    {
        $marche = Marche::findOrFail($id);

        return response()->json($marche);
    }

    // Modifier un marché
    public function update(Request $request, $id): JsonResponse
    {
        $marche = Marche::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|nullable|string|max:255',
            'objet' => 'sometimes|nullable|string',
            'montant' => 'sometimes|nullable|numeric',
            'avancement' => 'sometimes|nullable|string|max:255',
            'statut' => 'sometimes|nullable|string|max:255',
        ]);

        $marche->update($validated);

        return response()->json([
            'message' => 'Marché mis à jour avec succès.',
            'data' => $marche,
        ]);
    }

    // Supprimer un marché
    public function destroy($id): JsonResponse
    {
        $marche = Marche::findOrFail($id);

        $marche->delete();

        return response()->json([
            'message' => 'Marché supprimé avec succès.',
        ]);
    }
}