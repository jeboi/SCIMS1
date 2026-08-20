<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseRequest extends Model
{
    protected $table = 'purchase_requests';

    protected $primaryKey = 'request_id';

    public $timestamps = true;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'requested_by',
        'request_date',
        'status',
        'remarks',
    ];

    protected $casts = [
        'request_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'requested_by',
            'id'
        );
    }

    public function details(): HasMany
    {
        return $this->hasMany(
            PurchaseRequestDetail::class,
            'request_id',
            'request_id'
        );
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(
            PurchaseOrder::class,
            'request_id',
            'request_id'
        );
    }
}