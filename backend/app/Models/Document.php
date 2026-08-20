<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $table = 'documents';

    protected $primaryKey = 'document_id';

    public $timestamps = false;

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'document_type',
        'reference_id',
        'file_name',
        'status',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}