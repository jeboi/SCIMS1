<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    protected $table = 'warehouses';

    protected $primaryKey = 'warehouse_id';

    public $timestamps = false;

    protected $fillable = [
        'warehouse_name',
        'location',
        'capacity',
        'status',
    ];

    public function storageLocations(): HasMany
    {
        return $this->hasMany(
            StorageLocation::class,
            'warehouse_id',
            'warehouse_id'
        );
    }

    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(
            InventoryTransaction::class,
            'warehouse_id',
            'warehouse_id'
        );
    }

    public function receivingRecords(): HasMany
    {
        return $this->hasMany(
            ReceivingRecord::class,
            'warehouse_id',
            'warehouse_id'
        );
    }
}