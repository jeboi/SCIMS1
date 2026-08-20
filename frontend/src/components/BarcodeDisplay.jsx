"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { QRCodeCanvas } from "qrcode.react";

// Barcode Only Component
export function BarcodeOnly({ value }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: true,
                    fontSize: 16,
                    margin: 10,
                });
            } catch (error) {
                console.error("Failed to generate barcode:", error);
            }
        }
    }, [value]);

    if (!value) return <p className="text-gray-400 text-sm">No barcode</p>;

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-white">
            <svg ref={svgRef} className="w-full max-w-[300px]" />
            <p className="text-xs text-gray-400 font-mono">{value}</p>
        </div>
    );
}

// QR Code Only Component
export function QRCodeOnly({ value }) {
    if (!value) return <p className="text-gray-400 text-sm">No QR code</p>;

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-white">
            <QRCodeCanvas
                value={value}
                size={150}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin
            />
            <p className="text-xs text-gray-400 font-mono">{value}</p>
        </div>
    );
}

// Combined Barcode + QR Code Component (for print/generate)
export default function BarcodeDisplay({ value }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format: "CODE128",
                    width: 2,
                    height: 60,
                    displayValue: true,
                    fontSize: 16,
                    margin: 10,
                });
            } catch (error) {
                console.error("Failed to generate barcode:", error);
            }
        }
    }, [value]);

    if (!value) return <p className="text-gray-400 text-sm">No barcode</p>;

    return (
        <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-white">
            <svg ref={svgRef} className="w-full max-w-[300px]" />
            <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500">Scan me</p>
                <QRCodeCanvas
                    value={value}
                    size={100}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin
                />
            </div>
            <p className="text-xs text-gray-400 font-mono mt-2">{value}</p>
        </div>
    );
}