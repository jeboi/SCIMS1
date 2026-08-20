<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\StorageLocationController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\InventoryTransactionController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\SupplierQuotationController;
use App\Http\Controllers\Api\PurchaseRequestController;
use App\Http\Controllers\Api\PurchaseRequestDetailController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\PurchaseOrderDetailController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DeliveryItemController;
use App\Http\Controllers\Api\ReceivingRecordController;
use App\Http\Controllers\Api\RestaurantDepartmentController;
use App\Http\Controllers\Api\RestaurantStockRequestController;
use App\Http\Controllers\Api\RestaurantStockRequestDetailController;
use App\Http\Controllers\Api\HotelDepartmentController;
use App\Http\Controllers\Api\HotelStockRequestController;
use App\Http\Controllers\Api\HotelStockRequestDetailController;
use App\Http\Controllers\Api\ForecastController;
use App\Http\Controllers\Api\LogisticsDocumentController;
use App\Http\Controllers\Api\DocumentTrackingController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\UserProfileController;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'success',
        'message' => 'API is running'
    ]);
});

// Public Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

    // ==================== USER PROFILE & SETTINGS ====================
    Route::prefix('user')->group(function () {
        // Profile
        Route::get('/profile', [UserProfileController::class, 'show']);
        Route::put('/profile', [UserProfileController::class, 'update']);
        
        // Activities
        Route::get('/activities', [UserProfileController::class, 'activities']);
        Route::get('/activities/{id}', [UserProfileController::class, 'activityDetail']);
        
        // Preferences
        Route::get('/preferences', [UserProfileController::class, 'preferences']);
        Route::put('/preferences', [UserProfileController::class, 'updatePreferences']);
        Route::post('/preferences/reset', [UserProfileController::class, 'resetPreferences']);
        
        // Security
        Route::post('/change-password', [UserProfileController::class, 'changePassword']);
        Route::get('/security', [UserProfileController::class, 'securityInfo']);
        Route::get('/sessions', [UserProfileController::class, 'sessions']);
        Route::post('/sessions/logout-others', [UserProfileController::class, 'logoutOthers']);
    });

    // ==================== AI FORECASTING ====================
    Route::get('/forecast/health', [ForecastController::class, 'health']);
    Route::post('/forecast', [ForecastController::class, 'forecast']);
    Route::post('/seasonal', [ForecastController::class, 'seasonal']);

    // ==================== LOGISTICS DOCUMENTS ====================
    Route::apiResource('logistics-documents', LogisticsDocumentController::class);
    Route::patch('logistics-documents/{logisticsDocument}/status', [LogisticsDocumentController::class, 'updateStatus']);

    // ==================== DOCUMENT TRACKING ====================
    Route::apiResource('document-tracking', DocumentTrackingController::class);
    Route::get('document-tracking/by-document/{documentId}', [DocumentTrackingController::class, 'getByDocument']);

    // ==================== AUDIT TRAIL ====================
    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::get('audit-logs/modules', [AuditLogController::class, 'modules']);
    Route::get('audit-logs/actions', [AuditLogController::class, 'actions']);
    Route::get('audit-logs/summary', [AuditLogController::class, 'summary']);

    // ==================== WAREHOUSES ====================
    Route::apiResource('warehouses', WarehouseController::class);
    Route::apiResource('storage-locations', StorageLocationController::class);

    // ==================== INVENTORY ====================
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('items', ItemController::class);
    Route::apiResource('inventory-transactions', InventoryTransactionController::class);

    // ==================== SUPPLIERS ====================
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('supplier-quotations', SupplierQuotationController::class);

    // ==================== PROCUREMENT ====================
    Route::apiResource('purchase-requests', PurchaseRequestController::class);
    Route::apiResource('purchase-request-details', PurchaseRequestDetailController::class);
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('purchase-order-details', PurchaseOrderDetailController::class);

    // ==================== LOGISTICS ====================
    Route::apiResource('deliveries', DeliveryController::class);
    Route::apiResource('delivery-items', DeliveryItemController::class);
    Route::apiResource('receiving-records', ReceivingRecordController::class);

    // ==================== HOTEL ====================
    Route::apiResource('hotel-departments', HotelDepartmentController::class);
    Route::apiResource('hotel-stock-requests', HotelStockRequestController::class);
    Route::apiResource('hotel-stock-request-details', HotelStockRequestDetailController::class);

    // ==================== RESTAURANT ====================
    Route::apiResource('restaurant-departments', RestaurantDepartmentController::class);
    Route::apiResource('restaurant-stock-requests', RestaurantStockRequestController::class);
    Route::apiResource('restaurant-stock-request-details', RestaurantStockRequestDetailController::class);
});