function initVNCPaste() {
    window.sendString = function(text) {
        const canvas = document.querySelector('#noVNC_canvas') || document.querySelector('canvas');
        if (!canvas) {
            console.error('Canvas no encontrado');
            return;
        }

        text.split('').forEach((char, index) => {
            setTimeout(() => {
                // Crear y disparar keydown
                canvas.dispatchEvent(new KeyboardEvent('keydown', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    keyCode: char.charCodeAt(0),
                    charCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true
                }));

                // Crear y disparar keypress
                canvas.dispatchEvent(new KeyboardEvent('keypress', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    keyCode: char.charCodeAt(0),
                    charCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true
                }));

                // Crear y disparar keyup
                canvas.dispatchEvent(new KeyboardEvent('keyup', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    keyCode: char.charCodeAt(0),
                    charCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true
                }));
            }, index * 50);
        });
    };

    // Configurar el evento de clic derecho
    const canvas = document.querySelector('#noVNC_canvas') || document.querySelector('canvas');
    if (canvas) {
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                navigator.clipboard.readText()
                    .then(text => window.sendString(text))
                    .catch(err => console.error('Error al leer el portapapeles:', err));
            }
        });
    }

    console.log('VNC Paste intited By:alew140');
}

// Ejecutar la inicialización
initVNCPaste();
