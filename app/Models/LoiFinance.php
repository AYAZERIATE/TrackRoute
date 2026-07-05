<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoiFinance extends Model
{
    protected $table = 'loifinance';

    protected $fillable = [
        'numero_marche',
        'beneficiaire',
        'montant_global',
        'cp2026',
        'ce2027',
        'montant_ordonnance',
        'reste_ordonnancer',
        'taux_emission',
        'date_attribution',
        'date_visa',
        'date_approbation',
        'date_notification',
        'date_commencement',
        'date_pvrd',
        'date_approbation_dd',
        'date_liberation_cautions',
    ];
}