<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentTracking extends Model
{
    protected $table = 'document_tracking';
    
    protected $primaryKey = 'tracking_id';

    protected $fillable = [
        'document_id',
        'status',
        'location',
        'remarks',
        'tracking_number',
        'status_date',
        'updated_by',
    ];

    protected $casts = [
        'status_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(LogisticsDocument::class, 'document_id', 'document_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by', 'id');
    }
}