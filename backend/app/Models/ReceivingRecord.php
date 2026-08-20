<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceivingRecord extends Model
{
    protected $table = 'receiving_records';

    protected $primaryKey = 'receiving_id';

    public $timestamps = false;

    protected $fillable = [
        'delivery_id',
        'warehouse_id',
        'received_by',
        'received_date',
        'remarks',
    ];

    protected $casts = [
        'received_date' => 'date',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(
            Delivery::class,
            'delivery_id',
            'delivery_id'
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
}