import { useEffect, useRef, useState } from 'react';
import { VITE_PLATFORM } from '../config/api';

// Web version using html5-qrcode
const WebQRScanner = ({ onScan, onClose }) => {
    const html5QrCodeRef = useRef(null);
    const [Html5QrcodeModule, setHtml5QrcodeModule] = useState(null);

    useEffect(() => {
        // Dynamically import html5-qrcode only on web
        import('html5-qrcode').then((module) => {
            setHtml5QrcodeModule(() => module.Html5Qrcode);
        });
    }, []);

    useEffect(() => {
        if (!Html5QrcodeModule) return;

        const scannerContainerId = "qr-reader";

        const startScanner = async () => {
            try {
                const html5QrCode = new Html5QrcodeModule(scannerContainerId);
                html5QrCodeRef.current = html5QrCode;

                const config = {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        onScan(decodedText);
                        html5QrCode.stop();
                        onClose();
                    },
                    (errorMessage) => {
                        // Ignore frequent scan errors
                    }
                );
            } catch (err) {
                console.error("Scanner error:", err);
            }
        };

        startScanner();

        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().then(() => {
                    html5QrCodeRef.current.clear();
                }).catch(err => console.error("Scanner cleanup error", err));
            }
        };
    }, [Html5QrcodeModule, onScan, onClose]);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            <div id="qr-reader" className="w-full h-full"></div>
            <style>{`
                #qr-reader__dashboard { display: none !important; }
                #qr-reader__status_span { display: none !important; }
                #qr-reader video { 
                    width: 100% !important; 
                    height: 100% !important; 
                    object-fit: cover !important; 
                    border-radius: 28px !important;
                }
            `}</style>
        </div>
    );
};

// Mobile version using Capacitor Camera (no ZXing needed)
const MobileQRScanner = ({ onScan, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const animationRef = useRef(null);

    useEffect(() => {
        startScanner();

        return () => {
            stopScanner();
        };
    }, []);

    const stopScanner = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    const decodeQRCode = async () => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Use built-in QR code detection if available
            if ('BarcodeDetector' in window) {
                try {
                    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
                    const barcodes = await detector.detect(canvas);
                    
                    if (barcodes.length > 0) {
                        const qrData = barcodes[0].rawValue;
                        onScan(qrData);
                        stopScanner();
                        onClose();
                        return;
                    }
                } catch (err) {
                    console.error("BarcodeDetector error:", err);
                }
            }
        }
        
        // Continue scanning
        animationRef.current = requestAnimationFrame(decodeQRCode);
    };

    const startScanner = async () => {
        try {
            // Dynamically import Capacitor Camera only on mobile
            const { Camera } = await import('@capacitor/camera');
            
            // Request camera permissions
            const permission = await Camera.requestPermissions();
            if (permission.camera !== 'granted') {
                setError('Camera permission denied');
                return;
            }

            // Get camera stream with back camera
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' } }
                });
            } catch (err) {
                // Fallback if exact facingMode fails
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsScanning(true);
                
                // Start decoding frames
                decodeQRCode();
            }
        } catch (err) {
            console.error("Scanner error:", err);
            setError('Failed to start camera: ' + err.message);
        }
    };

    if (error) {
        return (
            <div className="relative w-full h-full bg-black flex items-center justify-center rounded-[28px]">
                <div className="text-white text-center p-4">
                    <p className="mb-4">{error}</p>
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

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[28px] bg-black">
            <video 
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
            />
            <canvas 
                ref={canvasRef}
                style={{ display: 'none' }}
            />
            {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white">Starting camera...</div>
                </div>
            )}
            {/* QR scanning frame */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              w-64 h-64 border-2 border-white rounded-lg shadow-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
                </div>
                <div className="absolute bottom-10 left-0 right-0 text-center text-white text-sm">
                    Position QR code within frame
                </div>
            </div>
            <button 
                onClick={() => {
                    stopScanner();
                    onClose();
                }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full z-10"
            >
                ✕
            </button>
        </div>
    );
};

// Main component - chooses platform-specific implementation
const QRScanner = (props) => {
    // Fix typo: VITE_PLATORM -> VITE_PLATFORM
    const isMobile = VITE_PLATFORM === 'mobile' || 
                     (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform());

    if (isMobile) {
        return <MobileQRScanner {...props} />;
    } else {
        return <WebQRScanner {...props} />;
    }
};

export default QRScanner;