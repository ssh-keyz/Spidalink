<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frames', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->text('svg_template');
            $table->json('supported_features');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frames');
    }
};
