<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Marche extends Model
{
    protected $table = 'marche';

    protected $fillable = [
        'nom',
        'type',
        'objet',
        'montant',
        'avancement',
        'statut',
    ];
}