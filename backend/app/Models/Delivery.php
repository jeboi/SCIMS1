<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Delivery extends Model
{
    protected $table = 'deliveries';

    protected $primaryKey = 'delivery_id';

    public $timestamps = false;

    protected $fillable = [
        'po_id',
        'tracking_number',
        'vehicle',
        'delivery_date',
        'status',
    ];

    protected $casts = [
        'delivery_date' => 'date',
    ];

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(
            PurchaseOrder::class,
            'po_id',
            'po_id'
        );
    }

    public function deliveryItems(): HasMany
    {
        return $this->hasMany(
            DeliveryItem::class,
            'delivery_id',
            'delivery_id'
        );
    }

    public function receivingRecord(): HasOne
    {
        return $this->hasOne(
            ReceivingRecord::class,
            'delivery_id',
            'delivery_id'
        );
    }
}