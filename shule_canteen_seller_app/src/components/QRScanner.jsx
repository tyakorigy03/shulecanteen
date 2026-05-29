import { useEffect, useState } from 'react';
import { VITE_PLATFORM } from '../config/api';

const QRScanner = ({ onScan, onClose }) => {
    const [error, setError] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [installProgress, setInstallProgress] = useState(0);

    useEffect(() => {
        const isMobile = VITE_PLATFORM === 'mobile' || 
                        (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform());
        
        if (isMobile) {
            initializeNativeScanner();
        } else {
            startWebScanner();
        }

        return () => {
            setIsScanning(false);
        };
    }, []);

    const initializeNativeScanner = async () => {
        try {
            const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
            
            // Check if Google module is available
            const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
            
            if (!available) {
                setIsInstalling(true);
                
                // Listen for installation progress
                await BarcodeScanner.addListener('googleBarcodeScannerModuleInstallProgress', (event) => {
                    console.log('Installation state:', event.state);
                    // state: 0 = Downloading, 1 = Installing, 2 = Installed, 5 = Failed
                    if (event.state === 0) {
                        setInstallProgress(30);
                    } else if (event.state === 1) {
                        setInstallProgress(70);
                    } else if (event.state === 2) {
                        setInstallProgress(100);
                        setTimeout(() => {
                            setIsInstalling(false);
                            startNativeScanner();
                        }, 500);
                    } else if (event.state === 5) {
                        setError('Failed to install barcode scanner module. Please check your internet connection and try again.');
                        setIsInstalling(false);
                    }
                });
                
                // Install the module
                await BarcodeScanner.installGoogleBarcodeScannerModule();
            } else {
                // Module already available, start scanning
                startNativeScanner();
            }
        } catch (err) {
            console.error("Initialization error:", err);
            setError(`Failed to initialize scanner: ${err.message}`);
        }
    };

    const startNativeScanner = async () => {
        try {
            setIsScanning(true);
            
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

    // Show installation progress UI
    if (isInstalling) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center rounded-[28px]">
                <div className="text-center p-6">
                    <div className="mb-6">
                        <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                    <p className="text-white text-lg mb-2">Installing Barcode Scanner...</p>
                    <p className="text-white/60 text-sm mb-4">This will only happen once</p>
                    <div className="w-64 bg-white/20 rounded-full h-2 mb-4">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${installProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-white/40 text-xs">Please wait while we download the scanner module</p>
                    <button 
                        onClick={onClose}
                        className="mt-8 bg-red-500 px-6 py-2 rounded-lg text-white"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center rounded-[28px]">
                <div className="text-white text-center p-4">
                    <p className="mb-4 text-red-400">{error}</p>
                    <button 
                        onClick={() => {
                            setError(null);
                            initializeNativeScanner();
                        }}
                        className="bg-green-500 px-4 py-2 rounded-lg mr-2"
                    >
                        Retry
                    </button>
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
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-10"
                >
                    ✕
                </button>
            </div>
        );
    }

    // For mobile: show scanning UI while native scanner is active
    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center rounded-[28px]">
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
