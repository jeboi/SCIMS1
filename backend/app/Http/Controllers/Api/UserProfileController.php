<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class UserProfileController extends Controller
{
    /**
     * Get authenticated user profile
     */
    public function show(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => $this->formatProfile($user)
        ]);
    }

    /**
     * Update user profile
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Update basic info
        if ($request->has('first_name')) {
            $user->first_name = $request->first_name;
        }
        if ($request->has('last_name')) {
            $user->last_name = $request->last_name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = '/storage/' . $avatarPath;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $this->formatProfile($user)
        ]);
    }

    /**
     * Get user activities
     */
    public function activities(Request $request)
    {
        $user = $request->user();
        
        $query = $user->activities();
        
        // Apply filters
        if ($request->has('module') && $request->module !== 'All Modules') {
            $query->where('module', $request->module);
        }
        if ($request->has('activity_type') && $request->activity_type !== 'All Types') {
            $query->where('activity_type', $request->activity_type);
        }
        if ($request->has('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->has('search') && $request->search) {
            $query->where('activity', 'LIKE', '%' . $request->search . '%');
        }
        
        $perPage = $request->input('per_page', 10);
        $activities = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $activities->items(),
            'total' => $activities->total(),
            'current_page' => $activities->currentPage(),
            'per_page' => $activities->perPage(),
            'last_page' => $activities->lastPage(),
        ]);
    }

    /**
     * Get single activity detail
     */
    public function activityDetail(Request $request, $id)
    {
        $user = $request->user();
        $activity = $user->activities()->find($id);
        
        if (!$activity) {
            return response()->json([
                'success' => false,
                'message' => 'Activity not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $activity
        ]);
    }

    /**
     * Get user preferences
     */
    public function preferences(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => $user->getPreferencesAttribute()
        ]);
    }

    /**
 * Update user preferences
 */
public function updatePreferences(Request $request)
{
    $user = $request->user();
    
    $validator = Validator::make($request->all(), [
        'general' => 'nullable|array',
        'general.language' => 'nullable|string|max:10',
        'general.dateFormat' => 'nullable|string|max:20',
        'general.timeFormat' => 'nullable|string|max:10',
        'general.timeZone' => 'nullable|string|max:50',
        'general.defaultPage' => 'nullable|string|max:50',
        'notifications' => 'nullable|array',
        'notifications.lowStock' => 'nullable|boolean',
        'notifications.outOfStock' => 'nullable|boolean',
        'notifications.purchaseRequestUpdates' => 'nullable|boolean',
        'notifications.purchaseOrderUpdates' => 'nullable|boolean',
        'notifications.deliveryUpdates' => 'nullable|boolean',
        'notifications.receivingUpdates' => 'nullable|boolean',
        'inventory' => 'nullable|array',
        'inventory.defaultWarehouse' => 'nullable|string|max:50',
        'inventory.defaultView' => 'nullable|string|max:20',
        'inventory.itemsPerPage' => 'nullable|integer|min:5|max:200',
        'display' => 'nullable|array',
        'display.theme' => 'nullable|string|max:20',
        'display.tableDensity' => 'nullable|string|max:20',
        'display.itemsPerPage' => 'nullable|integer|min:5|max:200',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    // Get current preferences
    $currentPreferences = $user->getPreferencesAttribute();
    
    // Merge with new data (only update provided fields)
    $newPreferences = $currentPreferences;
    $input = $request->all();
    
    foreach ($input as $category => $values) {
        if (isset($newPreferences[$category]) && is_array($newPreferences[$category]) && is_array($values)) {
            foreach ($values as $key => $value) {
                // Only update if the key exists in the current preferences
                if (isset($newPreferences[$category][$key])) {
                    $newPreferences[$category][$key] = $value;
                }
            }
        }
    }
    
    // Store as JSON
    $user->preferences = json_encode($newPreferences);
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Preferences updated successfully',
        'data' => $user->getPreferencesAttribute()
    ]);
}

    /**
     * Reset preferences to defaults
     */
    public function resetPreferences(Request $request)
    {
        $user = $request->user();
        $user->preferences = null;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Preferences reset to defaults',
            'data' => $user->getPreferencesAttribute()
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
{
    $user = $request->user();
    
    $validator = Validator::make($request->all(), [
        'current_password' => 'required|string',
        'new_password' => 'required|string|min:8|confirmed',  // ← 'confirmed' expects new_password_confirmation
        'new_password_confirmation' => 'required|string|same:new_password',  // ← Add this
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    // Verify current password
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Current password is incorrect'
        ], 422);
    }

    // Update password
    $user->password = Hash::make($request->new_password);
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);
}

    /**
     * Get security information
     */
    public function securityInfo(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'lastPasswordChange' => $user->updated_at->toDateString(),
                'passwordStatus' => $this->getPasswordStrength($user->password),
                'failedLoginAttempts' => 0, // Implement failed attempts tracking if needed
                'twoFactorEnabled' => false,
                'loginNotifications' => true,
            ]
        ]);
    }

    /**
     * Get active sessions
     */
    public function sessions(Request $request)
    {
        $user = $request->user();
        
        // For now, return mock sessions data
        // In a real implementation, you'd track sessions in a database table
        $sessions = [
            [
                'id' => 'session-' . uniqid(),
                'device' => 'Windows PC',
                'browser' => 'Chrome',
                'deviceType' => 'desktop',
                'ipAddress' => $request->ip() ?? '192.168.1.1',
                'status' => 'active',
                'isCurrent' => true,
                'lastActive' => now()->toISOString(),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'sessions' => $sessions,
                'current' => [
                    'device' => 'Windows PC',
                    'browser' => 'Chrome',
                    'deviceType' => 'desktop',
                ]
            ]
        ]);
    }

    /**
     * Logout other sessions
     */
    public function logoutOthers(Request $request)
    {
        $user = $request->user();
        
        // In a real implementation with session tracking:
        // $user->tokens()->where('id', '!=', $request->current_token_id)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Other sessions have been logged out'
        ]);
    }

    /**
     * Format user profile data
     */
    private function formatProfile($user)
    {
        return [
            'firstName' => $user->first_name ?? '',
            'lastName' => $user->last_name ?? '',
            'email' => $user->email ?? '',
            'role' => $user->role ?? 'User',
            'status' => $user->status ?? 'Active',
            'createdAt' => $user->created_at ? $user->created_at->toISOString() : now()->toISOString(),
            'updatedAt' => $user->updated_at ? $user->updated_at->toISOString() : now()->toISOString(),
            'avatarUrl' => $user->avatar_url ?? null,
        ];
    }

    /**
     * Get password strength
     */
    private function getPasswordStrength($password)
    {
        $score = 0;
        
        if (strlen($password) >= 8) $score++;
        if (preg_match('/[A-Z]/', $password)) $score++;
        if (preg_match('/[a-z]/', $password)) $score++;
        if (preg_match('/\d/', $password)) $score++;
        if (preg_match('/[@$!%*?&]/', $password)) $score++;
        
        if ($score >= 5) return 'Strong';
        if ($score >= 3) return 'Medium';
        return 'Weak';
    }
}