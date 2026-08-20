<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryTransaction extends Model
{
    protected $primaryKey = 'transaction_id';

    public $timestamps = false;

    protected $fillable = [
        'item_id',
        'warehouse_id',
        'location_id',
        'transaction_type',
        'quantity',
        'reference_no',
        'transaction_date',
        'performed_by',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(
            Item::class,
            'item_id',
            'item_id'
        );
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(
            Warehouse::class,
            'warehouse_id',
            'warehouse_id'
        );
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'performed_by',
            'id'
        );
    }

    public function storageLocation(): BelongsTo
{
    return $this->belongsTo(
        StorageLocation::class,
        'location_id',
        'location_id'
    );
}

}