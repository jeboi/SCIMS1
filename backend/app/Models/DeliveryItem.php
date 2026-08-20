<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryItem extends Model
{
    protected $table = 'delivery_items';

    protected $primaryKey = 'delivery_item_id';

    public $timestamps = false;

    protected $fillable = [
        'delivery_id',
        'item_id',
        'quantity_received',
    ];

    protected $casts = [
        'quantity_received' => 'integer',
    ];

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(
            Delivery::class,
            'delivery_id',
            'delivery_id'
        );
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(
            Item::class,
            'item_id',
            'item_id'
        );
    }
}