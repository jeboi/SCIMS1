<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Activity;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'first_name',
        'last_name',
        'role',
        'status',
        'avatar_url',
        'preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Get default preferences
     */
    public static function getDefaultPreferences()
    {
        return [
            'general' => [
                'language' => 'en-US',
                'dateFormat' => 'MM/DD/YYYY',
                'timeFormat' => '12-hour',
                'timeZone' => 'Asia/Manila',
                'defaultPage' => 'dashboard',
            ],
            'notifications' => [
                'lowStock' => true,
                'outOfStock' => true,
                'purchaseRequestUpdates' => true,
                'purchaseOrderUpdates' => true,
                'deliveryUpdates' => false,
                'receivingUpdates' => true,
            ],
            'inventory' => [
                'defaultWarehouse' => null,
                'defaultView' => 'list',
                'itemsPerPage' => 25,
            ],
            'display' => [
                'theme' => 'light',
                'tableDensity' => 'standard',
                'itemsPerPage' => 25,
            ],
        ];
    }

    /**
     * Get user preferences
     */
    public function getPreferencesAttribute()
    {
        $defaults = self::getDefaultPreferences();
        $raw = $this->attributes['preferences'] ?? null;
        
        if (empty($raw)) {
            return $defaults;
        }
        
        $preferences = json_decode($raw, true);
        
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($preferences)) {
            return $defaults;
        }
        
        // Merge preferences with defaults
        return $this->deepMerge($defaults, $preferences);
    }

    /**
     * Deep merge two arrays without creating nested arrays
     */
    private function deepMerge($defaults, $preferences)
    {
        $result = $defaults;
        
        foreach ($preferences as $key => $value) {
            // If both are arrays, merge recursively
            if (isset($result[$key]) && is_array($result[$key]) && is_array($value)) {
                $result[$key] = $this->deepMerge($result[$key], $value);
            } else {
                // Otherwise, replace with the new value
                $result[$key] = $value;
            }
        }
        
        return $result;
    }

    /**
     * Set user preferences
     */
    public function setPreferencesAttribute($value)
    {
        if ($value === null) {
            $this->attributes['preferences'] = null;
            return;
        }
        
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->attributes['preferences'] = json_encode($decoded);
                return;
            }
            $this->attributes['preferences'] = $value;
            return;
        }
        
        if (is_array($value)) {
            $this->attributes['preferences'] = json_encode($value);
            return;
        }
        
        $this->attributes['preferences'] = null;
    }

    /**
 * Get user activities
 */
public function activities()
{
    // Define the relationship to the Activity model
    return $this->hasMany(Activity::class, 'user_id');
}
}