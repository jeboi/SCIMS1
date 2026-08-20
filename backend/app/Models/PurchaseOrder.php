<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $table = 'purchase_orders';

    protected $primaryKey = 'po_id';

    public $timestamps = true;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'supplier_id',
        'request_id',
        'po_number',
        'po_date',
        'status',
        'expected_delivery',
    ];

    protected $casts = [
        'po_date' => 'date',
        'expected_delivery' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(
            Supplier::class,
            'supplier_id',
            'supplier_id'
        );
    }

    public function purchaseRequest(): BelongsTo
    {
        return $this->belongsTo(
            PurchaseRequest::class,
            'request_id',
            'request_id'
        );
    }

    public function details(): HasMany
    {
        return $this->hasMany(
            PurchaseOrderDetail::class,
            'po_id',
            'po_id'
        );
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(
            Delivery::class,
            'po_id',
            'po_id'
        );
    }
}