<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('loifinance', function (Blueprint $table) {
        $table->id();

        $table->string('numero_marche');
        $table->string('beneficiaire');
        $table->decimal('montant_global',15,2);

        $table->decimal('cp2026',15,2)->default(0);
        $table->decimal('ce2027',15,2)->default(0);

        $table->decimal('montant_ordonnance',15,2)->default(0);
        $table->decimal('reste_ordonnancer',15,2)->default(0);
        $table->decimal('taux_emission',5,2)->default(0);

        $table->date('date_attribution')->nullable();
        $table->date('date_visa')->nullable();
        $table->date('date_approbation')->nullable();
        $table->date('date_notification')->nullable();
        $table->date('date_commencement')->nullable();
        $table->date('date_pvrd')->nullable();
        $table->date('date_approbation_dd')->nullable();
        $table->date('date_liberation_cautions')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loifinance');
    }
};
