<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelStockRequestDetail extends Model
{
    protected $table = 'hotel_stock_request_details';

    protected $primaryKey = 'stock_request_detail_id';

    public $timestamps = false;

    protected $fillable = [
        'stock_request_id',
        'item_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function stockRequest(): BelongsTo
    {
        return $this->belongsTo(
            HotelStockRequest::class,
            'stock_request_id',
            'stock_request_id'
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