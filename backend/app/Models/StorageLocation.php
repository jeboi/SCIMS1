<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StorageLocation extends Model
{
    protected $primaryKey = 'location_id';

    public $timestamps = false;

    protected $fillable = [
        'warehouse_id',
        'location_code',
        'location_name',
        'zone',
        'aisle',
        'shelf',
        'bin',
        'rack',
        'capacity',
        'status',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'warehouse_id',
            'warehouse_id'
        );
    }
}