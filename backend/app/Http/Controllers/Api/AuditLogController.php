<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    /**
     * Display all audit logs.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user')->orderBy('created_at', 'desc');

        // Filter by module
        if ($request->has('module')) {
            $query->where('module', $request->module);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get unique modules for filtering.
     */
    public function modules()
    {
        $modules = AuditLog::select('module')->distinct()->pluck('module');

        return response()->json([
            'success' => true,
            'data' => $modules,
        ]);
    }

    /**
     * Get unique actions for filtering.
     */
    public function actions()
    {
        $actions = AuditLog::select('action')->distinct()->pluck('action');

        return response()->json([
            'success' => true,
            'data' => $actions,
        ]);
    }

    /**
     * Get audit log summary statistics.
     */
    public function summary()
    {
        $total = AuditLog::count();
        $today = AuditLog::whereDate('created_at', today())->count();
        $thisWeek = AuditLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();

        $byAction = AuditLog::select('action', \DB::raw('count(*) as total'))
            ->groupBy('action')
            ->get();

        $byModule = AuditLog::select('module', \DB::raw('count(*) as total'))
            ->groupBy('module')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'today' => $today,
                'this_week' => $thisWeek,
                'by_action' => $byAction,
                'by_module' => $byModule,
            ],
        ]);
    }
}