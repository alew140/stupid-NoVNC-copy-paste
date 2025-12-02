class VNCPaste {
    constructor(config = {}) {
        this.config = {
            selector: '#noVNC_canvas',
            fallbackSelector: 'canvas',
            delay: 50,
            enableLogging: true,
            rightClickEnabled: true,
            ...config
        };

        this.canvas = null;
        this.isInitialized = false;
        this.specialKeys = new Map([
            ['@', { key: '2', shiftKey: true }],
            ['#', { key: '3', shiftKey: true }],
            ['$', { key: '4', shiftKey: true }],
            ['%', { key: '5', shiftKey: true }],
            ['^', { key: '6', shiftKey: true }],
            ['&', { key: '7', shiftKey: true }],
            ['*', { key: '8', shiftKey: true }],
            ['(', { key: '9', shiftKey: true }],
            [')', { key: '0', shiftKey: true }],
            ['_', { key: '-', shiftKey: true }],
            ['+', { key: '=', shiftKey: true }],
            ['{', { key: '[', shiftKey: true }],
            ['}', { key: ']', shiftKey: true }],
            ['|', { key: '\\', shiftKey: true }],
            [':', { key: ';', shiftKey: true }],
            ['"', { key: "'", shiftKey: true }],
            ['<', { key: ',', shiftKey: true }],
            ['>', { key: '.', shiftKey: true }],
            ['?', { key: '/', shiftKey: true }],
            ['\n', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, shiftKey: false }]
        ]);
    }

    log(...args) {
        if (this.config.enableLogging) {
            console.log('[VNCPaste]', ...args);
        }
    }

    error(...args) {
        console.error('[VNCPaste]', ...args);
    }

    findCanvas() {
        this.canvas = document.querySelector(this.config.selector) ||
            document.querySelector(this.config.fallbackSelector);

        if (!this.canvas) {
            throw new Error('No se encontró el elemento canvas');
        }
        return this.canvas;
    }

    createKeyboardEvent(type, key, options = {}) {
        const defaultOptions = {
            key,
            code: `Key${key.toUpperCase()}`,
            keyCode: key.charCodeAt(0),
            charCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true,
            ...options
        };

        return new KeyboardEvent(type, defaultOptions);
    }

    async sendKeyboardEvents(char) {
        const specialKey = this.specialKeys.get(char);
        let keyInfo;

        if (specialKey) {
            keyInfo = specialKey;
        } else if (/[A-Z]/.test(char)) {
            keyInfo = { key: char, shiftKey: true };
        } else {
            keyInfo = { key: char, shiftKey: false };
        }

        const events = ['keydown', 'keypress', 'keyup'];

        for (const eventType of events) {
            try {
                await this.sleep(10)
                this.canvas.dispatchEvent(
                    this.createKeyboardEvent(eventType, keyInfo.key, {
                        ...keyInfo
                    })
                );
            } catch (error) {
                this.error(`Error enviando evento ${eventType}:`, error);
                throw error;
            }
        }
    }

    async sendShiftEvent(down) {
        this.canvas.dispatchEvent(
            new KeyboardEvent(down ? 'keydown' : 'keyup', {
                code: 'ShiftLeft',
                shiftKey: false,
            })
        );
    }

    async sleep(delay = this.config.delay) {
        return await new Promise(resolve =>
            setTimeout(resolve, delay)
        );
    }

    async sendString(text) {
        if (!this.canvas) {
            this.error('Canvas no inicializado');
            return;
        }

        // Remove carriage returns to handle Windows line endings (\r\n)
        text = text.replace(/\r/g, '');

        let shiftPressed = false;

        const onShiftStateChange = async () => {
            shiftPressed = !shiftPressed
            await this.sendShiftEvent(shiftPressed)
            await this.sleep()
        }

        for (let i = 0; i < text.length; i++) {
            try {
                await this.sleep()

                if (/[A-Z]/.test(text[i])) {
                    if (!shiftPressed) {
                        await onShiftStateChange()
                    }
                } else {
                    if (shiftPressed) {
                        await onShiftStateChange()
                    }
                }

                await this.sendKeyboardEvents(text[i]);
            } catch (error) {
                this.error(`Error enviando caracter '${text[i]}':`, error);
            }
        }
    }

    async handleRightClick(event) {
        if (event.button === 2 && this.config.rightClickEnabled) {
            event.preventDefault();

            try {
                const text = await navigator.clipboard.readText();
                await this.sendString(text);
                this.log('Texto pegado exitosamente');
            } catch (error) {
                this.error('Error al acceder al portapapeles:', error);
            }
        }
    }

    init() {
        if (this.isInitialized) {
            this.error('VNCPaste ya está inicializado');
            return;
        }

        try {
            this.findCanvas();

            this.canvas.addEventListener('mousedown',
                this.handleRightClick.bind(this)
            );

            window.sendString = this.sendString.bind(this);

            this.isInitialized = true;
            this.log('Inicializado correctamente');

        } catch (error) {
            this.error('Error durante la inicialización:', error);
            throw error;
        }
    }

    destroy() {
        if (!this.isInitialized) return;

        if (this.canvas) {
            this.canvas.removeEventListener('mousedown',
                this.handleRightClick.bind(this)
            );
        }

        delete window.sendString;
        this.isInitialized = false;
        this.log('Destruido correctamente');
    }
}

// Inicialización
const vncPaste = new VNCPaste({
    enableLogging: true,
    delay: 50
});

try {
    vncPaste.init();
} catch (error) {
    console.error('Error al inicializar VNCPaste:', error);
}