<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mappage extends Model
{
    protected $table = 'mappage';

    protected $fillable = [
        'nom',
        'latitude',
        'longitude',
        'region',
        'type',
        'status',
        'budget',
    ];
}