<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HotelDepartment extends Model
{
    protected $table = 'hotel_departments';

    protected $primaryKey = 'department_id';

    public $timestamps = false;

    protected $fillable = [
        'department_name',
    ];

    public function stockRequests(): HasMany
    {
        return $this->hasMany(
            HotelStockRequest::class,
            'department_id',
            'department_id'
        );
    }
}