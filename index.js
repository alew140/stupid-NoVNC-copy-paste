/**
 * @file index.js
 * @description VNCPaste — clipboard-to-keyboard bridge for NoVNC sessions.
 *
 * Paste text from your system clipboard into a NoVNC canvas by simulating
 * keyboard events. Works by right-clicking the canvas (default) or by calling
 * `sendString()` programmatically from the browser console.
 *
 * @example
 * // Paste via right-click (default behaviour after init)
 * const vncPaste = new VNCPaste();
 * vncPaste.init();
 *
 * // Paste programmatically
 * vncPaste.sendString('Hello, World!\n');
 */

/**
 * @typedef {Object} VNCPasteConfig
 * @property {string}  [selector='#noVNC_canvas'] - Primary CSS selector for the NoVNC canvas element.
 * @property {string}  [fallbackSelector='canvas'] - Fallback CSS selector used when the primary selector yields no match.
 * @property {number}  [delay=50]                 - Inter-character delay in milliseconds.
 * @property {boolean} [enableLogging=true]        - Emit debug messages to the browser console.
 * @property {boolean} [rightClickEnabled=true]    - Read clipboard and type text on right-click.
 */

class VNCPaste {
    /**
     * @param {VNCPasteConfig} [config={}]
     */
    constructor(config = {}) {
        /** @type {Required<VNCPasteConfig>} */
        this.config = {
            selector: '#noVNC_canvas',
            fallbackSelector: 'canvas',
            delay: 50,
            enableLogging: true,
            rightClickEnabled: true,
            ...config,
        };

        /** @type {HTMLCanvasElement|null} */
        this.canvas = null;

        /** @type {boolean} */
        this.isInitialized = false;

        /**
         * Maps characters that require Shift on a standard US QWERTY layout to
         * their underlying key and modifier state.
         * @type {Map<string, {key: string, shiftKey: boolean, code?: string, keyCode?: number, which?: number, charCode?: number}>}
         */
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
            ['\n', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: 13, shiftKey: false }],
        ]);

        // Stable reference so addEventListener / removeEventListener match.
        this._boundHandleRightClick = this.handleRightClick.bind(this);
    }

    // ─── Logging ────────────────────────────────────────────────────────────────

    /** @param {...unknown} args */
    log(...args) {
        if (this.config.enableLogging) {
            console.log('[VNCPaste]', ...args);
        }
    }

    /** @param {...unknown} args */
    error(...args) {
        console.error('[VNCPaste]', ...args);
    }

    // ─── Canvas Discovery ────────────────────────────────────────────────────────

    /**
     * Locates the NoVNC canvas element in the DOM.
     * @returns {HTMLCanvasElement}
     * @throws {Error} When no matching canvas element is found.
     */
    findCanvas() {
        this.canvas =
            document.querySelector(this.config.selector) ||
            document.querySelector(this.config.fallbackSelector);

        if (!this.canvas) {
            throw new Error(
                `Canvas element not found. Tried selectors: "${this.config.selector}", "${this.config.fallbackSelector}".`
            );
        }
        return this.canvas;
    }

    // ─── Event Helpers ───────────────────────────────────────────────────────────

    /**
     * Constructs a synthetic {@link KeyboardEvent}.
     * @param {string} type    - Event type: `'keydown'`, `'keypress'`, or `'keyup'`.
     * @param {string} key     - The logical key value (e.g. `'a'`, `'Enter'`).
     * @param {KeyboardEventInit} [options={}] - Additional event initialisation options.
     * @returns {KeyboardEvent}
     */
    createKeyboardEvent(type, key, options = {}) {
        return new KeyboardEvent(type, {
            key,
            code: `Key${key.toUpperCase()}`,
            keyCode: key.charCodeAt(0),
            charCode: key.charCodeAt(0),
            which: key.charCodeAt(0),
            bubbles: true,
            ...options,
        });
    }

    /**
     * Dispatches `keydown`, `keypress`, and `keyup` events for a single character.
     * @param {string} char
     * @returns {Promise<void>}
     */
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

        for (const eventType of ['keydown', 'keypress', 'keyup']) {
            await this.sleep(10);
            this.canvas.dispatchEvent(
                this.createKeyboardEvent(eventType, keyInfo.key, { ...keyInfo })
            );
        }
    }

    /**
     * Sends a Shift key `keydown` or `keyup` event to the canvas.
     * @param {boolean} down - `true` for `keydown`, `false` for `keyup`.
     * @returns {Promise<void>}
     */
    async sendShiftEvent(down) {
        this.canvas.dispatchEvent(
            new KeyboardEvent(down ? 'keydown' : 'keyup', {
                key: 'Shift',
                code: 'ShiftLeft',
                shiftKey: down,
                bubbles: true,
            })
        );
    }

    // ─── Timing ──────────────────────────────────────────────────────────────────

    /**
     * Returns a promise that resolves after `delay` milliseconds.
     * @param {number} [delay] - Defaults to `this.config.delay`.
     * @returns {Promise<void>}
     */
    sleep(delay = this.config.delay) {
        return new Promise((resolve) => setTimeout(resolve, delay));
    }

    // ─── Public API ──────────────────────────────────────────────────────────────

    /**
     * Types `text` into the NoVNC canvas by dispatching synthetic keyboard events.
     * Windows-style line endings (`\r\n`) are normalised to `\n` automatically.
     * @param {string} text
     * @returns {Promise<void>}
     */
    async sendString(text) {
        if (!this.canvas) {
            this.error('Canvas is not initialised. Call init() first.');
            return;
        }

        // Normalise Windows line endings (\r\n → \n).
        const normalised = text.replace(/\r/g, '');

        let shiftPressed = false;

        const toggleShift = async () => {
            shiftPressed = !shiftPressed;
            await this.sendShiftEvent(shiftPressed);
            await this.sleep();
        };

        for (const char of normalised) {
            try {
                await this.sleep();

                const needsShift = /[A-Z]/.test(char) || this.specialKeys.get(char)?.shiftKey;

                if (needsShift && !shiftPressed) {
                    await toggleShift();
                } else if (!needsShift && shiftPressed) {
                    await toggleShift();
                }

                await this.sendKeyboardEvents(char);
            } catch (err) {
                this.error(`Error sending character '${char}':`, err);
            }
        }

        // Always release Shift at the end to leave the canvas in a clean state.
        if (shiftPressed) {
            await this.sendShiftEvent(false);
        }
    }

    /**
     * Handles `mousedown` events on the canvas. When the right mouse button is
     * pressed and `rightClickEnabled` is `true`, reads the clipboard and types
     * the content into the canvas.
     * @param {MouseEvent} event
     * @returns {Promise<void>}
     */
    async handleRightClick(event) {
        if (event.button !== 2 || !this.config.rightClickEnabled) {return;}

        event.preventDefault();

        try {
            const text = await navigator.clipboard.readText();
            await this.sendString(text);
            this.log('Text pasted successfully.');
        } catch (err) {
            this.error('Failed to read clipboard:', err);
        }
    }

    /**
     * Initialises VNCPaste: finds the canvas, attaches listeners, and exposes
     * `window.sendString` as a convenience alias.
     * @returns {void}
     * @throws {Error} When the canvas element cannot be found.
     */
    init() {
        if (this.isInitialized) {
            this.error('VNCPaste is already initialised.');
            return;
        }

        this.findCanvas();
        this.canvas.addEventListener('mousedown', this._boundHandleRightClick);
        window.sendString = this.sendString.bind(this);

        this.isInitialized = true;
        this.log('Initialised successfully.');
    }

    /**
     * Tears down VNCPaste: removes event listeners and deletes `window.sendString`.
     * @returns {void}
     */
    destroy() {
        if (!this.isInitialized) {return;}

        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this._boundHandleRightClick);
        }

        delete window.sendString;
        this.isInitialized = false;
        this.log('Destroyed successfully.');
    }
}

// ─── Auto-init (browser console / script-tag usage) ─────────────────────────

/* istanbul ignore next */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const vncPaste = new VNCPaste({ enableLogging: true, delay: 50 });

    try {
        vncPaste.init();
    } catch (err) {
        console.error('[VNCPaste] Initialisation failed:', err);
    }
}

// ─── Module export (Node / bundler environments) ─────────────────────────────

/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VNCPaste;
}