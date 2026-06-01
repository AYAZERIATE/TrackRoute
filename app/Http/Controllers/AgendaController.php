<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgendaController extends Controller
{
    /**
     * Agenda: liste + CRUD minimal (mock-safe).
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
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'string'],
            'priority' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
        ]);

        return response()->json([
            'message' => 'Événement créé (mock).',
            'data' => array_merge($validated, [
                'id' => now()->timestamp,
            ]),
        ], 201);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => $id,
                'title' => 'Événement (mock)',
                'description' => null,
                'date' => null,
                'priority' => 'medium',
                'status' => 'pending',
                'category' => 'reunion',
            ],
        ]);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
            'date' => ['sometimes', 'required', 'string'],
            'priority' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'nullable', 'string'],
            'category' => ['sometimes', 'nullable', 'string'],
        ]);

        return response()->json([
            'message' => 'Événement mis à jour (mock).',
            'data' => array_merge($validated, ['id' => $id]),
        ]);
    }

    public function destroy(Request $request, int|string $id): JsonResponse
    {
        return response()->json([
            'message' => 'Événement supprimé (mock).',
            'id' => $id,
        ]);
    }
}

