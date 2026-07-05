<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agenda extends Model
{
    protected $table = 'agenda';

    protected $fillable = [
        'title',
        'description',
        'event_date',
        'priority',
        'status',
        'category',
    ];
}

