<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RestaurantDepartment extends Model
{
    protected $table = 'restaurant_departments';

    protected $primaryKey = 'department_id';

    public $timestamps = false;

    protected $fillable = [
        'department_name',
    ];

    public function stockRequests(): HasMany
    {
        return $this->hasMany(
            RestaurantStockRequest::class,
            'department_id',
            'department_id'
        );
    }
}