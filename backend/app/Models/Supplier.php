<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $table = 'suppliers';

    protected $primaryKey = 'supplier_id';

    public $timestamps = true;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'supplier_name',
        'contact_person',
        'phone',
        'email',
        'address',
        'status',
        'rating',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function quotations(): HasMany
    {
        return $this->hasMany(
            SupplierQuotation::class,
            'supplier_id',
            'supplier_id'
        );
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(
            PurchaseOrder::class,
            'supplier_id',
            'supplier_id'
        );
    }
}