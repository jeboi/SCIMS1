"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import BarcodeDisplay, { BarcodeOnly, QRCodeOnly } from "@/components/BarcodeDisplay";
import {
    Search, Barcode, QrCode, Package,
    Printer, Scan, Loader2, Copy,
    RefreshCw, CheckCircle, XCircle
} from "lucide-react";

export default function BarcodeManagementPage() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [scanMode, setScanMode] = useState(false);
    const [scanInput, setScanInput] = useState("");
    const [scanResult, setScanResult] = useState(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [generatedBarcode, setGeneratedBarcode] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const [itemsRes, categoriesRes] = await Promise.all([
                axiosInstance.get("/items"),
                axiosInstance.get("/categories"),
            ]);
            setItems(itemsRes.data?.data || []);
            setCategories(categoriesRes.data?.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load data.");
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const generateUniqueBarcode = async () => {
        try {
            const response = await axiosInstance.get("/items");
            const existingItems = response.data?.data || [];

            const existingNumbers = existingItems
                .map(item => {
                    if (!item.barcode) return 0;
                    const match = item.barcode.match(/SCIMS-(\d{6})/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => num > 0);

            let nextNumber = 1;
            existingNumbers.sort((a, b) => a - b);
            for (let i = 1; i <= existingNumbers.length + 1; i++) {
                if (!existingNumbers.includes(i)) {
                    nextNumber = i;
                    break;
                }
            }

            return `SCIMS-${String(nextNumber).padStart(6, '0')}`;
        } catch (error) {
            console.error("Failed to generate barcode:", error);
            return `SCIMS-${Date.now().toString().slice(-6)}`;
        }
    };

    const handleOpenGenerateModal = async () => {
        const barcode = await generateUniqueBarcode();
        setGeneratedBarcode(barcode);
        setShowGenerateModal(true);
    };

    const handleToggleStatus = async (item) => {
        const newStatus = item.status === "active" ? "inactive" : "active";
        const action = newStatus === "active" ? "activate" : "deactivate";

        if (!confirm(`Are you sure you want to ${action} "${item.item_name}"?`)) return;

        try {
            await axiosInstance.patch(`/items/${item.item_id}`, { status: newStatus });
            toast.success(`Item ${action}d successfully.`);
            loadData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to ${action} item.`);
        }
    };

    const handleScan = async () => {
        if (!scanInput.trim()) {
            toast.error("Please enter or scan a barcode.");
            return;
        }

        try {
            setScanLoading(true);
            setScanResult(null);
            const response = await axiosInstance.get(`/items`, {
                params: { barcode: scanInput.trim() }
            });
            const items = response.data?.data || [];
            if (items.length > 0) {
                setScanResult(items[0]);
                toast.success("Item found!");
            } else {
                toast.error("No item found with this barcode.");
                setScanResult(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to scan barcode.");
        } finally {
            setScanLoading(false);
        }
    };

    const handleCopyBarcode = (barcode) => {
        navigator.clipboard.writeText(barcode).then(() => {
            toast.success("Barcode copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy barcode.");
        });
    };

    const filteredItems = items.filter((item) =>
        item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = items.length;
    const activeItems = items.filter(item => item.status === "active").length;
    const inactiveItems = items.filter(item => item.status === "inactive").length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Barcode & QR Code Management</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Generate barcodes for items and scan for warehouse operations.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setScanMode(!scanMode)}
                            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${scanMode
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "border hover:bg-gray-50"
                                }`}
                        >
                            <Scan className="inline h-4 w-4 mr-2" />
                            {scanMode ? "Scanning Mode" : "Scan Barcode"}
                        </button>
                        <button
                            onClick={handleOpenGenerateModal}
                            className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
                        >
                            <QrCode className="inline h-4 w-4 mr-2" />
                            Generate Barcode
                        </button>
                        <button
                            onClick={loadData}
                            className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Total Items</p>
                        <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Active Items</p>
                        <p className="text-2xl font-bold text-green-600">{activeItems}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Inactive Items</p>
                        <p className="text-2xl font-bold text-yellow-600">{inactiveItems}</p>
                    </div>
                    <div className="bg-white rounded-lg border p-4">
                        <p className="text-sm text-gray-500">Barcodes Generated</p>
                        <p className="text-2xl font-bold text-purple-600">{totalItems}</p>
                    </div>
                </div>

                {/* Scan Mode */}
                {scanMode && (
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-2">Scan Barcode</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter the barcode number to find the item.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                                placeholder="Enter barcode number..."
                                className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleScan();
                                    }
                                }}
                            />
                            <button
                                onClick={handleScan}
                                disabled={scanLoading}
                                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {scanLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
                            </button>
                        </div>
                        {scanResult && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{scanResult.item_name}</p>
                                        <p className="text-sm text-gray-600">Barcode: {scanResult.barcode}</p>
                                        <p className="text-sm text-gray-600">Stock: {scanResult.current_stock} {scanResult.unit}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedItem(scanResult);
                                                setShowBarcodeModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Barcode className="h-5 w-5" />
                                        </button>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Search */}
                <div className="flex items-center gap-4 bg-white rounded-lg border p-4">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items by name or barcode..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 outline-none text-sm"
                    />
                    <span className="text-xs text-gray-400">{filteredItems.length} items</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Item Name</th>
                                <th className="px-4 py-3 text-left font-medium">Barcode</th>
                                <th className="px-4 py-3 text-center font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                        No items found.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => (
                                    <tr key={item.item_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">
                                            {item.item_name}
                                            {item.status === "inactive" && (
                                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {item.barcode || "No barcode"}
                                                </span>
                                                {item.barcode && (
                                                    <button
                                                        onClick={() => handleCopyBarcode(item.barcode)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                        title="Copy barcode"
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowBarcodeModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="View Barcode"
                                                >
                                                    <Barcode className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedItem(item);
                                                        setShowQRModal(true);
                                                    }}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="View QR Code"
                                                >
                                                    <QrCode className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(item)}
                                                    className={`${item.status === "active"
                                                            ? "text-red-600 hover:text-red-800"
                                                            : "text-green-600 hover:text-green-800"
                                                        }`}
                                                    title={item.status === "active" ? "Deactivate" : "Activate"}
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Barcode Modal */}
            {showBarcodeModal && selectedItem && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowBarcodeModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">Barcode</h2>
                                <p className="text-sm text-gray-500">{selectedItem.item_name}</p>
                            </div>
                            <button
                                onClick={() => setShowBarcodeModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600 transition"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 text-center">
                            <div className="barcode-only-print">
                                <BarcodeOnly value={selectedItem.barcode || `ITEM-${selectedItem.item_id}`} />
                            </div>
                            <button
                                onClick={() => {
                                    const printContent = document.querySelector('.barcode-only-print');
                                    if (!printContent) return;
                                    const originalContents = document.body.innerHTML;
                                    document.body.innerHTML = `
                                            <html>
                                                <head>
                                                    <title>Print Barcode</title>
                                                    <style>
                                                        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
                                                        .print-container { max-width: 400px; margin: 0 auto; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <div class="print-container">
                                                        ${printContent.innerHTML}
                                                    </div>
                                                    <script>
                                                        window.onload = function() { window.print(); }
                                                    <\/script>
                                                </body>
                                            </html>
                                        `;
                                    document.close();
                                    setTimeout(() => {
                                        document.body.innerHTML = originalContents;
                                        window.location.reload();
                                    }, 500);
                                }}
                                className="mt-4 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                                <Printer className="inline h-4 w-4 mr-2" />
                                Print
                            </button>
                        </div>
                        <div className="flex justify-end border-t px-6 py-4">
                            <button
                                onClick={() => setShowBarcodeModal(false)}
                                className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedItem && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowQRModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div>
                                <h2 className="text-lg font-semibold">QR Code</h2>
                                <p className="text-sm text-gray-500">{selectedItem.item_name}</p>
                            </div>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600 transition"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 text-center flex justify-center">
                            <QRCodeOnly value={selectedItem.barcode || `ITEM-${selectedItem.item_id}`} />
                        </div>
                        <div className="flex justify-end border-t px-6 py-4">
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="rounded-lg border px-5 py-3 text-sm font-medium hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Barcode Modal */}
            {showGenerateModal && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowGenerateModal(false)}
                >
                    <div
                        className="w-full max-w-md rounded-xl bg-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-lg font-semibold">Generate New Barcode</h2>
                                <p className="text-sm text-gray-500">
                                    Copy this barcode and use it in Item Management.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                className="text-2xl text-gray-400 hover:text-gray-600 transition"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Barcode Display */}
                            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                                <p className="text-sm text-gray-500">Generated Barcode</p>
                                <p className="text-xl font-mono font-bold text-blue-600 mt-1 break-all">{generatedBarcode}</p>
                                <div className="mt-2 flex justify-center">
                                    <BarcodeDisplay value={generatedBarcode} />
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                                <p className="font-medium">Next Steps:</p>
                                <ol className="list-decimal list-inside mt-1 space-y-1 text-xs">
                                    <li>Copy the barcode above</li>
                                    <li>Go to <strong>Item Management</strong></li>
                                    <li>Click <strong>"Add Item"</strong></li>
                                    <li>Paste the barcode in the barcode field</li>
                                    <li>Fill in the rest of the details and save</li>
                                </ol>
                            </div>

                            {/* Copy Button */}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedBarcode).then(() => {
                                        toast.success("Barcode copied to clipboard!");
                                    }).catch(() => {
                                        toast.error("Failed to copy barcode.");
                                    });
                                }}
                                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 flex items-center justify-center gap-2 transition"
                            >
                                <Copy className="h-4 w-4" />
                                Copy Barcode
                            </button>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 border-t pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(false)}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedBarcode).then(() => {
                                            toast.success("Barcode copied! Redirecting to Item Management...");
                                            setTimeout(() => {
                                                window.location.href = "/inventory/items";
                                            }, 1000);
                                        });
                                    }}
                                    className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 flex items-center justify-center gap-2 transition"
                                >
                                    <QrCode className="h-4 w-4" />
                                    Copy & Go to Items
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}