<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    // Afficher tous les événements
    public function index(): JsonResponse
    {
        $agenda = Agenda::all();

        return response()->json([
            'data' => $agenda,
            'total' => $agenda->count(),
        ]);
    }

    // Ajouter un événement
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $agenda = Agenda::create($validated);

        return response()->json([
            'message' => 'Événement créé avec succès.',
            'data' => $agenda,
        ], 201);
    }

    // Afficher un événement
    public function show($id): JsonResponse
    {
        $agenda = Agenda::findOrFail($id);

        return response()->json($agenda);
    }

    // Modifier un événement
    public function update(Request $request, $id): JsonResponse
    {
        $agenda = Agenda::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|date',
            'priority' => 'nullable|string',
            'status' => 'nullable|string',
            'category' => 'nullable|string',
        ]);

        $agenda->update($validated);

        return response()->json([
            'message' => 'Événement modifié avec succès.',
            'data' => $agenda,
        ]);
    }

    // Supprimer un événement
    public function destroy($id): JsonResponse
    {
        $agenda = Agenda::findOrFail($id);

        $agenda->delete();

        return response()->json([
            'message' => 'Événement supprimé avec succès.',
        ]);
    }
}