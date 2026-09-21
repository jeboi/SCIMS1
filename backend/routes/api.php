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
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\RolePermissionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Debug log
Log::info('=== API ROUTE HIT ===', [
    'url' => request()->fullUrl(),
    'method' => request()->method(),
    'has_bearer' => request()->bearerToken() ? 'yes' : 'no',
]);

Route::get('/debug-token', function (Request $request) {
    $token = $request->bearerToken();
    if (!$token) {
        return response()->json(['error' => 'No token provided']);
    }

    $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

    if (!$accessToken) {
        return response()->json([
            'error' => 'Token not found in database',
            'token_prefix' => substr($token, 0, 15),
        ]);
    }

    return response()->json([
        'token_found' => true,
        'token_id' => $accessToken->id,
        'tokenable_type' => $accessToken->tokenable_type,
        'tokenable_id' => $accessToken->tokenable_id,
        'user_exists' => $accessToken->tokenable ? true : false,
        'user_name' => $accessToken->tokenable?->name,
        'expires_at' => $accessToken->expires_at,
        'created_at' => $accessToken->created_at,
    ]);
});

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
Route::middleware('api.auth')->group(function () {

    // ==================== AUTH ====================
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ==================== ADMIN ONLY ====================
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class);

        Route::prefix('roles')->group(function () {
            Route::get('/{roleId}/permissions', [RolePermissionController::class, 'getPermissions']);
            Route::put('/{roleId}/permissions', [RolePermissionController::class, 'updatePermissions']);
            Route::post('/{roleId}/permissions/give', [RolePermissionController::class, 'givePermission']);
            Route::delete('/{roleId}/permissions/revoke', [RolePermissionController::class, 'revokePermission']);
        });

        Route::get('/permissions/available', [RolePermissionController::class, 'getAllAvailablePermissions']);
        Route::get('/permissions/grouped', [RolePermissionController::class, 'getPermissionsGrouped']);
    });

    // ==================== DASHBOARD ====================
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics'])
        ->middleware('permission:dashboard.view');

    // ==================== USER PROFILE & SETTINGS ====================
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserProfileController::class, 'show']);
        Route::put('/profile', [UserProfileController::class, 'update']);
        Route::get('/activities', [UserProfileController::class, 'activities']);
        Route::get('/activities/{id}', [UserProfileController::class, 'activityDetail']);
        Route::get('/preferences', [UserProfileController::class, 'preferences']);
        Route::put('/preferences', [UserProfileController::class, 'updatePreferences']);
        Route::post('/preferences/reset', [UserProfileController::class, 'resetPreferences']);
        Route::post('/change-password', [UserProfileController::class, 'changePassword']);
        Route::get('/security', [UserProfileController::class, 'securityInfo']);
        Route::get('/sessions', [UserProfileController::class, 'sessions']);
        Route::post('/sessions/logout-others', [UserProfileController::class, 'logoutOthers']);
    });

    // ==================== AI FORECASTING ====================
    Route::get ('/forecast/health', [ForecastController::class, 'health'])
        ->middleware('permission:inventory.view');
    Route::post('/forecast', [ForecastController::class, 'forecast'])
        ->middleware('permission:inventory.view');
    Route::post('/seasonal', [ForecastController::class, 'seasonal'])
        ->middleware('permission:inventory.view');

    // ==================== LOGISTICS DOCUMENTS ====================
    Route::get   ('logistics-documents',                          [LogisticsDocumentController::class, 'index'])  ->middleware('permission:logistics.view');
    Route::post  ('logistics-documents',                          [LogisticsDocumentController::class, 'store'])  ->middleware('permission:logistics.create');
    Route::get   ('logistics-documents/{logisticsDocument}',      [LogisticsDocumentController::class, 'show'])   ->middleware('permission:logistics.view');
    Route::put   ('logistics-documents/{logisticsDocument}',      [LogisticsDocumentController::class, 'update']) ->middleware('permission:logistics.edit');
    Route::delete('logistics-documents/{logisticsDocument}',      [LogisticsDocumentController::class, 'destroy'])->middleware('permission:logistics.delete');
    Route::patch ('logistics-documents/{logisticsDocument}/status',[LogisticsDocumentController::class, 'updateStatus'])->middleware('permission:logistics.edit');

    // ==================== DOCUMENT TRACKING ====================
    Route::get   ('document-tracking',                        [DocumentTrackingController::class, 'index'])  ->middleware('permission:logistics.view');
    Route::post  ('document-tracking',                        [DocumentTrackingController::class, 'store'])  ->middleware('permission:logistics.create,logistics.edit');
    Route::get   ('document-tracking/{documentTracking}',     [DocumentTrackingController::class, 'show'])   ->middleware('permission:logistics.view');
    Route::put   ('document-tracking/{documentTracking}',     [DocumentTrackingController::class, 'update']) ->middleware('permission:logistics.edit');
    Route::delete('document-tracking/{documentTracking}',     [DocumentTrackingController::class, 'destroy'])->middleware('permission:logistics.delete');
    Route::get   ('document-tracking/by-document/{documentId}',[DocumentTrackingController::class, 'getByDocument'])->middleware('permission:logistics.view');

    // ==================== AUDIT TRAIL ====================
    Route::get('audit-logs',           [AuditLogController::class, 'index'])  ->middleware('permission:reports.view');
    Route::get('audit-logs/modules',   [AuditLogController::class, 'modules'])->middleware('permission:reports.view');
    Route::get('audit-logs/actions',   [AuditLogController::class, 'actions'])->middleware('permission:reports.view');
    Route::get('audit-logs/summary',   [AuditLogController::class, 'summary'])->middleware('permission:reports.view');

    // ==================== WAREHOUSES ====================
    Route::get   ('warehouses',                 [WarehouseController::class, 'index'])  ->middleware('permission:warehousing.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('warehouses',                 [WarehouseController::class, 'store'])  ->middleware('permission:warehousing.create');
    Route::get   ('warehouses/{warehouse}',     [WarehouseController::class, 'show'])   ->middleware('permission:warehousing.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('warehouses/{warehouse}',     [WarehouseController::class, 'update']) ->middleware('permission:warehousing.edit');
    Route::delete('warehouses/{warehouse}',     [WarehouseController::class, 'destroy'])->middleware('permission:warehousing.delete');

    Route::get   ('storage-locations',                 [StorageLocationController::class, 'index'])  ->middleware('permission:warehousing.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('storage-locations',                 [StorageLocationController::class, 'store'])  ->middleware('permission:warehousing.create');
    Route::get   ('storage-locations/{storage_location}', [StorageLocationController::class, 'show']) ->middleware('permission:warehousing.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('storage-locations/{storage_location}', [StorageLocationController::class, 'update'])->middleware('permission:warehousing.edit');
    Route::delete('storage-locations/{storage_location}', [StorageLocationController::class, 'destroy'])->middleware('permission:warehousing.delete');

    // ==================== INVENTORY ====================
    Route::get   ('categories',            [CategoryController::class, 'index'])  ->middleware('permission:inventory.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('categories',            [CategoryController::class, 'store'])  ->middleware('permission:inventory.create');
    Route::get   ('categories/{category}', [CategoryController::class, 'show'])   ->middleware('permission:inventory.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('categories/{category}', [CategoryController::class, 'update']) ->middleware('permission:inventory.edit');
    Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:inventory.delete');

    Route::get   ('items',          [ItemController::class, 'index'])  ->middleware('permission:inventory.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('items',          [ItemController::class, 'store'])  ->middleware('permission:inventory.create');
    Route::get   ('items/{item}',   [ItemController::class, 'show'])   ->middleware('permission:inventory.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('items/{item}',   [ItemController::class, 'update']) ->middleware('permission:inventory.edit');
    Route::delete('items/{item}',   [ItemController::class, 'destroy'])->middleware('permission:inventory.delete');

    Route::get   ('inventory-transactions',                      [InventoryTransactionController::class, 'index'])  ->middleware('permission:inventory.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('inventory-transactions',                      [InventoryTransactionController::class, 'store'])  ->middleware('permission:inventory.adjust,logistics.edit');
    Route::get   ('inventory-transactions/{inventory_transaction}',[InventoryTransactionController::class, 'show']) ->middleware('permission:inventory.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('inventory-transactions/{inventory_transaction}',[InventoryTransactionController::class, 'update'])->middleware('permission:inventory.adjust');
    Route::delete('inventory-transactions/{inventory_transaction}',[InventoryTransactionController::class, 'destroy'])->middleware('permission:inventory.delete');

    // ==================== SUPPLIERS ====================
    Route::get   ('suppliers',           [SupplierController::class, 'index'])  ->middleware('permission:suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('suppliers',           [SupplierController::class, 'store'])  ->middleware('permission:suppliers.create');
    Route::get   ('suppliers/{supplier}',[SupplierController::class, 'show'])   ->middleware('permission:suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('suppliers/{supplier}',[SupplierController::class, 'update']) ->middleware('permission:suppliers.edit,suppliers.evaluate');
    Route::delete('suppliers/{supplier}',[SupplierController::class, 'destroy'])->middleware('permission:suppliers.delete');

    Route::get   ('supplier-quotations',                    [SupplierQuotationController::class, 'index'])  ->middleware('permission:suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('supplier-quotations',                    [SupplierQuotationController::class, 'store'])  ->middleware('permission:suppliers.create');
    Route::get   ('supplier-quotations/{supplier_quotation}',[SupplierQuotationController::class, 'show'])   ->middleware('permission:suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('supplier-quotations/{supplier_quotation}',[SupplierQuotationController::class, 'update']) ->middleware('permission:suppliers.edit');
    Route::delete('supplier-quotations/{supplier_quotation}',[SupplierQuotationController::class, 'destroy'])->middleware('permission:suppliers.delete');

    // ==================== PROCUREMENT ====================
    Route::get   ('purchase-requests',                       [PurchaseRequestController::class, 'index'])  ->middleware('permission:procurement.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('purchase-requests',                       [PurchaseRequestController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('purchase-requests/{purchase_request}',    [PurchaseRequestController::class, 'show'])   ->middleware('permission:procurement.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('purchase-requests/{purchase_request}',    [PurchaseRequestController::class, 'update']) ->middleware('permission:procurement.edit,procurement.approve');
    Route::delete('purchase-requests/{purchase_request}',    [PurchaseRequestController::class, 'destroy'])->middleware('permission:procurement.delete');

    Route::get   ('purchase-request-details',                        [PurchaseRequestDetailController::class, 'index'])  ->middleware('permission:procurement.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('purchase-request-details',                        [PurchaseRequestDetailController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('purchase-request-details/{purchase_request_detail}',[PurchaseRequestDetailController::class, 'show']) ->middleware('permission:procurement.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('purchase-request-details/{purchase_request_detail}',[PurchaseRequestDetailController::class, 'update'])->middleware('permission:procurement.edit');
    Route::delete('purchase-request-details/{purchase_request_detail}',[PurchaseRequestDetailController::class, 'destroy'])->middleware('permission:procurement.delete');

    // ==================== PURCHASE ORDERS ====================
    Route::get   ('purchase-orders',                    [PurchaseOrderController::class, 'index'])  ->middleware('permission:purchase_orders.view,suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('purchase-orders',                    [PurchaseOrderController::class, 'store'])  ->middleware('permission:purchase_orders.create');
    Route::get   ('purchase-orders/{purchase_order}',   [PurchaseOrderController::class, 'show'])   ->middleware('permission:purchase_orders.view,suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('purchase-orders/{purchase_order}',   [PurchaseOrderController::class, 'update']) ->middleware('permission:purchase_orders.edit,purchase_orders.approve');
    Route::delete('purchase-orders/{purchase_order}',   [PurchaseOrderController::class, 'destroy'])->middleware('permission:purchase_orders.delete');

    Route::get   ('purchase-order-details',                     [PurchaseOrderDetailController::class, 'index'])  ->middleware('permission:purchase_orders.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('purchase-order-details',                     [PurchaseOrderDetailController::class, 'store'])  ->middleware('permission:purchase_orders.create');
    Route::get   ('purchase-order-details/{purchase_order_detail}',[PurchaseOrderDetailController::class, 'show']) ->middleware('permission:purchase_orders.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('purchase-order-details/{purchase_order_detail}',[PurchaseOrderDetailController::class, 'update'])->middleware('permission:purchase_orders.edit');
    Route::delete('purchase-order-details/{purchase_order_detail}',[PurchaseOrderDetailController::class, 'destroy'])->middleware('permission:purchase_orders.delete');

    // ==================== LOGISTICS (Deliveries / Receiving) ====================
    Route::get   ('deliveries',          [DeliveryController::class, 'index'])  ->middleware('permission:logistics.view,suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('deliveries',          [DeliveryController::class, 'store'])  ->middleware('permission:logistics.create,warehousing.create');
    Route::get   ('deliveries/{delivery}',[DeliveryController::class, 'show'])  ->middleware('permission:logistics.view,suppliers.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('deliveries/{delivery}',[DeliveryController::class, 'update'])->middleware('permission:logistics.edit');
    Route::delete('deliveries/{delivery}',[DeliveryController::class, 'destroy'])->middleware('permission:logistics.delete');

    Route::get   ('delivery-items',              [DeliveryItemController::class, 'index'])  ->middleware('permission:logistics.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('delivery-items',              [DeliveryItemController::class, 'store'])  ->middleware('permission:logistics.create,warehousing.create');
    Route::get   ('delivery-items/{delivery_item}',[DeliveryItemController::class, 'show']) ->middleware('permission:logistics.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('delivery-items/{delivery_item}',[DeliveryItemController::class, 'update'])->middleware('permission:logistics.edit');
    Route::delete('delivery-items/{delivery_item}',[DeliveryItemController::class, 'destroy'])->middleware('permission:logistics.delete');

    Route::get   ('receiving-records',                    [ReceivingRecordController::class, 'index'])  ->middleware('permission:logistics.view,reports.view'); // ⬅ REPORTS VIEW
    Route::post  ('receiving-records',                    [ReceivingRecordController::class, 'store'])  ->middleware('permission:logistics.create,warehousing.create,logistics.edit');
    Route::get   ('receiving-records/{receiving_record}', [ReceivingRecordController::class, 'show'])   ->middleware('permission:logistics.view,reports.view'); // ⬅ REPORTS VIEW
    Route::put   ('receiving-records/{receiving_record}', [ReceivingRecordController::class, 'update']) ->middleware('permission:logistics.edit');
    Route::delete('receiving-records/{receiving_record}', [ReceivingRecordController::class, 'destroy'])->middleware('permission:logistics.delete');

    // ==================== HOTEL ====================
    Route::get   ('hotel-departments',                   [HotelDepartmentController::class, 'index'])  ->middleware('permission:procurement.view');
    Route::post  ('hotel-departments',                   [HotelDepartmentController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('hotel-departments/{hotel_department}',[HotelDepartmentController::class, 'show'])   ->middleware('permission:procurement.view');
    Route::put   ('hotel-departments/{hotel_department}',[HotelDepartmentController::class, 'update']) ->middleware('permission:procurement.edit');
    Route::delete('hotel-departments/{hotel_department}',[HotelDepartmentController::class, 'destroy'])->middleware('permission:procurement.delete');

    Route::get   ('hotel-stock-requests',                       [HotelStockRequestController::class, 'index'])  ->middleware('permission:procurement.view');
    Route::post  ('hotel-stock-requests',                       [HotelStockRequestController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('hotel-stock-requests/{hotel_stock_request}', [HotelStockRequestController::class, 'show'])   ->middleware('permission:procurement.view');
    Route::put   ('hotel-stock-requests/{hotel_stock_request}', [HotelStockRequestController::class, 'update']) ->middleware('permission:procurement.edit');
    Route::delete('hotel-stock-requests/{hotel_stock_request}', [HotelStockRequestController::class, 'destroy'])->middleware('permission:procurement.delete');

    Route::get   ('hotel-stock-request-details',                              [HotelStockRequestDetailController::class, 'index'])  ->middleware('permission:procurement.view');
    Route::post  ('hotel-stock-request-details',                              [HotelStockRequestDetailController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('hotel-stock-request-details/{hotel_stock_request_detail}', [HotelStockRequestDetailController::class, 'show'])   ->middleware('permission:procurement.view');
    Route::put   ('hotel-stock-request-details/{hotel_stock_request_detail}', [HotelStockRequestDetailController::class, 'update']) ->middleware('permission:procurement.edit');
    Route::delete('hotel-stock-request-details/{hotel_stock_request_detail}', [HotelStockRequestDetailController::class, 'destroy'])->middleware('permission:procurement.delete');

    // ==================== RESTAURANT ====================
    Route::get   ('restaurant-departments',                        [RestaurantDepartmentController::class, 'index'])  ->middleware('permission:procurement.view');
    Route::post  ('restaurant-departments',                        [RestaurantDepartmentController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('restaurant-departments/{restaurant_department}',[RestaurantDepartmentController::class, 'show'])   ->middleware('permission:procurement.view');
    Route::put   ('restaurant-departments/{restaurant_department}',[RestaurantDepartmentController::class, 'update']) ->middleware('permission:procurement.edit');
    Route::delete('restaurant-departments/{restaurant_department}',[RestaurantDepartmentController::class, 'destroy'])->middleware('permission:procurement.delete');

    Route::get   ('restaurant-stock-requests',                            [RestaurantStockRequestController::class, 'index'])  ->middleware('permission:procurement.view');
    Route::post  ('restaurant-stock-requests',                            [RestaurantStockRequestController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('restaurant-stock-requests/{restaurant_stock_request}', [RestaurantStockRequestController::class, 'show'])   ->middleware('permission:procurement.view');
    Route::put   ('restaurant-stock-requests/{restaurant_stock_request}', [RestaurantStockRequestController::class, 'update']) ->middleware('permission:procurement.edit');
    Route::delete('restaurant-stock-requests/{restaurant_stock_request}', [RestaurantStockRequestController::class, 'destroy'])->middleware('permission:procurement.delete');

    Route::get   ('restaurant-stock-request-details',                                    [RestaurantStockRequestDetailController::class, 'index'])  ->middleware('permission:procurement.view');
    Route::post  ('restaurant-stock-request-details',                                    [RestaurantStockRequestDetailController::class, 'store'])  ->middleware('permission:procurement.create');
    Route::get   ('restaurant-stock-request-details/{restaurant_stock_request_detail}',  [RestaurantStockRequestDetailController::class, 'show'])   ->middleware('permission:procurement.view');
    Route::put   ('restaurant-stock-request-details/{restaurant_stock_request_detail}',  [RestaurantStockRequestDetailController::class, 'update']) ->middleware('permission:procurement.edit');
    Route::delete('restaurant-stock-request-details/{restaurant_stock_request_detail}',  [RestaurantStockRequestDetailController::class, 'destroy'])->middleware('permission:procurement.delete');
});