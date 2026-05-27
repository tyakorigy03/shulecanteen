import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan, onClose }) => {
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        const scannerContainerId = "qr-reader";

        // Start scanning
        const startScanner = async () => {
            try {
                const html5QrCode = new Html5Qrcode(scannerContainerId);
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

        // Cleanup
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().then(() => {
                    html5QrCodeRef.current.clear();
                }).catch(err => console.error("Scanner cleanup error", err));
            }
        };
    }, [onScan]);

    return (
        <div className="relative w-full h-full overflow-hidden rounded-[28px]">
            <div id="qr-reader" className="w-full h-full"></div>
            {/* Overlay to hide the default library text/UI if needed */}
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

export default QRScanner;
