<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $table = 'items';

    protected $primaryKey = 'item_id';

    public $timestamps = false;

    protected $fillable = [
        'category_id',
        'barcode',
        'item_name',
        'unit',
        'reorder_level',
        'current_stock',
        'status',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(
            Category::class,
            'category_id',
            'category_id'
        );
    }

    public function inventoryTransactions(): HasMany
    {
        return $this->hasMany(
            InventoryTransaction::class,
            'item_id',
            'item_id'
        );
    }

    public function purchaseRequestDetails(): HasMany
    {
        return $this->hasMany(
            PurchaseRequestDetail::class,
            'item_id',
            'item_id'
        );
    }

    public function purchaseOrderDetails(): HasMany
    {
        return $this->hasMany(
            PurchaseOrderDetail::class,
            'item_id',
            'item_id'
        );
    }

    public function deliveryItems(): HasMany
    {
        return $this->hasMany(
            DeliveryItem::class,
            'item_id',
            'item_id'
        );
    }

    public function restaurantStockRequestDetails(): HasMany
    {
        return $this->hasMany(
            RestaurantStockRequestDetail::class,
            'item_id',
            'item_id'
        );
    }

    public function hotelStockRequestDetails(): HasMany
    {
        return $this->hasMany(
            HotelStockRequestDetail::class,
            'item_id',
            'item_id'
        );
    }
}