<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelStockRequest extends Model
{
    protected $table = 'hotel_stock_requests';

    protected $primaryKey = 'stock_request_id';

    public $timestamps = false;

    protected $fillable = [
        'department_id',
        'requested_by',
        'request_date',
        'status',
    ];

    protected $casts = [
        'request_date' => 'date',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(
            HotelDepartment::class,
            'department_id',
            'department_id'
        );
    }

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
            HotelStockRequestDetail::class,
            'stock_request_id',
            'stock_request_id'
        );
    }
}