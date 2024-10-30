<?php

// database/migrations/[timestamp]_create_qr_codes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_codes', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->text('content');
            $table->json('configuration');
            $table->string('output_format');
            $table->string('file_path');
            $table->timestamps();
        });

        Schema::create('patterns', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->enum('type', ['data', 'eye_inner', 'eye_outer']);
            $table->text('svg_template');
            $table->timestamps();
        });

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
        Schema::dropIfExists('qr_codes');
        Schema::dropIfExists('patterns');
        Schema::dropIfExists('frames');
    }
};
