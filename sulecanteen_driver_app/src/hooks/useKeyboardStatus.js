import { useState, useEffect } from 'react';

export const useKeyboardStatus = () => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const handleFocusChange = () => {
            const activeElement = document.activeElement;
            const isInput = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );

            // Only consider it a "keyboard event" if an input is focused
            // and the height has actually changed significantly.
            // This prevents hiding on simple scroll where URL bar changes.
            const threshold = 200;
            const isHeightReduced = window.screen.height - window.innerHeight > threshold;

            setIsKeyboardVisible(!!isInput && isHeightReduced);
        };

        const handleResize = () => {
            handleFocusChange();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('focusin', handleFocusChange);
        window.addEventListener('focusout', () => {
            // Delay slightly to handle refocusing between inputs
            setTimeout(handleFocusChange, 50);
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('focusin', handleFocusChange);
            window.removeEventListener('focusout', handleFocusChange);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    return isKeyboardVisible;
};
