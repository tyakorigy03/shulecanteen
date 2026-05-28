import { useEffect, useState } from 'react';
import { VITE_PLATFORM } from '../config/api';

const QRScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const isMobile = VITE_PLATFORM === 'mobile' || 
                        (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform());
        
        if (isMobile) {
            startNativeScanner();
        } else {
            startWebScanner();
        }

        return () => {
            setIsScanning(false);
        };
    }, []);

    const startNativeScanner = async () => {
        try {
            setIsScanning(true);
            
            // Dynamically import Capacitor ML Kit Barcode Scanner
            const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
            
            // Request permissions
            const permission = await BarcodeScanner.requestPermissions();
            if (permission.camera !== 'granted') {
                setError('Camera permission denied');
                setIsScanning(false);
                return;
            }

            // Start native scan
            const { barcodes } = await BarcodeScanner.scan();
            
            if (barcodes && barcodes.length > 0) {
                console.log("QR Code detected:", barcodes[0].displayValue);
                onScan(barcodes[0].displayValue);
                onClose();
            } else {
                setError('No QR code detected');
            }
            
            setIsScanning(false);
        } catch (err) {
            console.error("Native scanner error:", err);
            setError(`Failed to scan: ${err.message}`);
            setIsScanning(false);
        }
    };

    const startWebScanner = async () => {
        try {
            // Dynamically import html5-qrcode for web
            const { Html5Qrcode } = await import('html5-qrcode');
            
            const scannerContainerId = "qr-reader";
            const html5QrCode = new Html5Qrcode(scannerContainerId);
            
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };
            
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    console.log("QR Code detected:", decodedText);
                    onScan(decodedText);
                    html5QrCode.stop();
                    onClose();
                },
                (errorMessage) => {
                    // Ignore frequent scan errors
                    if (errorMessage && !errorMessage.includes("No MultiFormat")) {
                        console.log("Scan error:", errorMessage);
                    }
                }
            );
        } catch (err) {
            console.error("Web scanner error:", err);
            setError(`Failed to start camera: ${err.message}`);
        }
    };

    if (error) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center rounded-[28px]">
                <div className="text-white text-center p-4">
                    <p className="mb-4 text-red-400">{error}</p>
                    <button 
                        onClick={onClose}
                        className="bg-red-500 px-4 py-2 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // For web: render the HTML container
    if (VITE_PLATFORM !== 'mobile' && !window.Capacitor?.isNativePlatform()) {
        return (
            <div className="relative w-full h-full overflow-hidden rounded-[28px] bg-black">
                <div id="qr-reader" className="w-full h-full"></div>
                <style>{`
                    #qr-reader {
                        width: 100% !important;
                        height: 100% !important;
                    }
                    #qr-reader__dashboard {
                        display: none !important;
                    }
                    #qr-reader__status_span {
                        display: none !important;
                    }
                    #qr-reader video {
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                        border-radius: 28px !important;
                    }
                    #qr-reader__scan_region {
                        background: transparent !important;
                    }
                    #qr-reader__message {
                        display: none !important;
                    }
                `}</style>
            </div>
        );
    }

    // For mobile: show scanning UI while native scanner is active
    return (
        <div className="relative w-full h-full  flex items-center justify-center rounded-[28px]">
            <div className="text-center">
                <div className="animate-pulse mb-4">
                    <div className="w-16 h-16 border-4 border-green-500 rounded-full mx-auto"></div>
                </div>
                <p className="text-white text-lg mb-2">Scanning QR Code...</p>
                <p className="text-white/60 text-sm">Position the QR code within the frame</p>
                <button 
                    onClick={onClose}
                    className="mt-8 bg-red-500 px-6 py-2 rounded-lg text-white"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default QRScanner;