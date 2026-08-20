<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogisticsDocument extends Model
{
    protected $table = 'logistics_documents';
    
    protected $primaryKey = 'document_id';

    protected $fillable = [
        'title',
        'document_number',
        'category',
        'description',
        'status',
        'document_date',
        'reference_id',
        'supplier',
        'items',
        'file_path',
        'created_by',
        'location',
    ];

    protected $casts = [
        'document_date' => 'date',
        'items' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by', 'id');
    }
}