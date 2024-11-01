<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QrCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'content',
        'configuration',
        'output_format',
        'file_path'
    ];

    protected $casts = [
        'configuration' => 'array'
    ];
}
