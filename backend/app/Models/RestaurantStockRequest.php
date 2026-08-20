<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantStockRequest extends Model
{
    protected $table = 'restaurant_stock_requests';
    
    protected $primaryKey = 'request_id';

    protected $fillable = [
        'request_number',
        'requested_by',
        'department_id',
        'request_date',
        'status',
        'remarks',
        'required_date',
        'urgency',
        'fulfilled_by',
        'fulfilled_at',
    ];

    protected $casts = [
        'request_date' => 'date',
        'required_date' => 'date',
        'fulfilled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by', 'id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(RestaurantDepartment::class, 'department_id', 'department_id');
    }

    public function fulfilledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'fulfilled_by', 'id');
    }

    public function details(): HasMany
    {
        return $this->hasMany(RestaurantStockRequestDetail::class, 'request_id', 'request_id');
    }
}