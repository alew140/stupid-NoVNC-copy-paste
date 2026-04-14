'use strict';

/**
 * VNCPaste test suite
 *
 * The tests run under jest-environment-jsdom which provides a DOM-like
 * environment without a real browser.  We mock the clipboard API and spy on
 * KeyboardEvent dispatching to verify behaviour without relying on actual
 * NoVNC infrastructure.
 */

const VNCPaste = require('../index.js');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Creates a <canvas> element, appends it to the document body (if requested),
 * and returns it.
 * @param {boolean} [attach=true]
 */
function makeCanvas(attach = true) {
    const canvas = document.createElement('canvas');
    canvas.id = 'noVNC_canvas';
    if (attach) {
        document.body.appendChild(canvas);
    }
    return canvas;
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

beforeEach(() => {
    // Clean DOM between tests.
    document.body.innerHTML = '';

    // Mock navigator.clipboard.
    Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { readText: jest.fn() },
    });
});

afterEach(() => {
    jest.restoreAllMocks();
    delete window.sendString;
});

// ─── Constructor / Config ────────────────────────────────────────────────────

describe('constructor', () => {
    it('applies default config values', () => {
        const vp = new VNCPaste();
        expect(vp.config.selector).toBe('#noVNC_canvas');
        expect(vp.config.fallbackSelector).toBe('canvas');
        expect(vp.config.delay).toBe(50);
        expect(vp.config.enableLogging).toBe(true);
        expect(vp.config.rightClickEnabled).toBe(true);
    });

    it('overrides defaults with supplied config', () => {
        const vp = new VNCPaste({ delay: 100, enableLogging: false });
        expect(vp.config.delay).toBe(100);
        expect(vp.config.enableLogging).toBe(false);
    });

    it('exposes a stable bound handler reference', () => {
        const vp = new VNCPaste();
        expect(typeof vp._boundHandleRightClick).toBe('function');
        // Same reference across multiple accesses (important for removeEventListener).
        expect(vp._boundHandleRightClick).toBe(vp._boundHandleRightClick);
    });
});

// ─── findCanvas ──────────────────────────────────────────────────────────────

describe('findCanvas()', () => {
    it('finds the canvas by primary selector', () => {
        const canvas = makeCanvas();
        const vp = new VNCPaste();
        expect(vp.findCanvas()).toBe(canvas);
    });

    it('falls back to the fallback selector', () => {
        const canvas = document.createElement('canvas');
        // No id — won't match '#noVNC_canvas'.
        document.body.appendChild(canvas);
        const vp = new VNCPaste();
        expect(vp.findCanvas()).toBe(canvas);
    });

    it('throws when no canvas is present in the DOM', () => {
        const vp = new VNCPaste();
        expect(() => vp.findCanvas()).toThrow(/Canvas element not found/);
    });
});

// ─── init / destroy ──────────────────────────────────────────────────────────

describe('init()', () => {
    it('sets isInitialized to true and exposes window.sendString', () => {
        makeCanvas();
        const vp = new VNCPaste({ enableLogging: false });
        vp.init();
        expect(vp.isInitialized).toBe(true);
        expect(typeof window.sendString).toBe('function');
    });

    it('throws (and does not partially initialise) when canvas is missing', () => {
        const vp = new VNCPaste({ enableLogging: false });
        expect(() => vp.init()).toThrow();
        expect(vp.isInitialized).toBe(false);
    });

    it('does not reinitialise when called a second time', () => {
        makeCanvas();
        const vp = new VNCPaste({ enableLogging: false });
        const errSpy = jest.spyOn(vp, 'error');
        vp.init();
        vp.init();
        expect(errSpy).toHaveBeenCalledTimes(1);
    });
});

describe('destroy()', () => {
    it('resets isInitialized and removes window.sendString', () => {
        makeCanvas();
        const vp = new VNCPaste({ enableLogging: false });
        vp.init();
        vp.destroy();
        expect(vp.isInitialized).toBe(false);
        expect(window.sendString).toBeUndefined();
    });

    it('is a no-op when called before init()', () => {
        const vp = new VNCPaste({ enableLogging: false });
        expect(() => vp.destroy()).not.toThrow();
    });

    it('actually removes the mousedown listener (does not call handleRightClick after destroy)', async () => {
        makeCanvas();
        const vp = new VNCPaste({ enableLogging: false, rightClickEnabled: true });
        vp.init();

        const handleSpy = jest.spyOn(vp, '_boundHandleRightClick');
        vp.destroy();

        // Simulate a right-click after destroy — the listener should be gone.
        const event = new MouseEvent('mousedown', { button: 2, bubbles: true });
        vp.canvas.dispatchEvent(event);

        expect(handleSpy).not.toHaveBeenCalled();
    });
});

// ─── sleep ───────────────────────────────────────────────────────────────────

describe('sleep()', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('resolves after the configured delay', async () => {
        const vp = new VNCPaste({ delay: 200, enableLogging: false });
        const promise = vp.sleep();
        jest.advanceTimersByTime(200);
        await promise; // should not hang
    });

    it('accepts an explicit delay override', async () => {
        const vp = new VNCPaste({ delay: 200, enableLogging: false });
        const promise = vp.sleep(500);
        jest.advanceTimersByTime(500);
        await promise;
    });
});

// ─── createKeyboardEvent ─────────────────────────────────────────────────────

describe('createKeyboardEvent()', () => {
    it('returns a KeyboardEvent with the correct type and key', () => {
        const vp = new VNCPaste({ enableLogging: false });
        const event = vp.createKeyboardEvent('keydown', 'a');
        expect(event).toBeInstanceOf(KeyboardEvent);
        expect(event.type).toBe('keydown');
        expect(event.key).toBe('a');
        expect(event.bubbles).toBe(true);
    });

    it('merges extra options', () => {
        const vp = new VNCPaste({ enableLogging: false });
        const event = vp.createKeyboardEvent('keydown', 'a', { shiftKey: true });
        expect(event.shiftKey).toBe(true);
    });
});

// ─── sendString ──────────────────────────────────────────────────────────────

describe('sendString()', () => {
    // Mock sleep to resolve immediately so tests finish without real delays.
    function makeFastVNCPaste(opts = {}) {
        const vp = new VNCPaste({ enableLogging: false, delay: 0, ...opts });
        jest.spyOn(vp, 'sleep').mockResolvedValue();
        return vp;
    }

    it('logs an error and returns early when canvas is not initialised', async () => {
        const vp = makeFastVNCPaste();
        const errSpy = jest.spyOn(vp, 'error');
        await vp.sendString('hello');
        expect(errSpy).toHaveBeenCalledTimes(1);
    });

    it('dispatches keyboard events for each character', async () => {
        const canvas = makeCanvas();
        const vp = makeFastVNCPaste();
        vp.canvas = canvas;

        const events = [];
        canvas.addEventListener('keydown', (e) => events.push(e));

        await vp.sendString('ab');

        const keys = events.map((e) => e.key);
        expect(keys).toContain('a');
        expect(keys).toContain('b');
    });

    it('normalises Windows line endings (\\r\\n → \\n)', async () => {
        const canvas = makeCanvas();
        const vp = makeFastVNCPaste();
        vp.canvas = canvas;

        const keys = [];
        canvas.addEventListener('keydown', (e) => keys.push(e.key));

        await vp.sendString('a\r\nb');

        // Should contain Enter but NOT a carriage-return.
        expect(keys).toContain('Enter');
        expect(keys.filter((k) => k === '\r')).toHaveLength(0);
    });

    it('sends Shift events for uppercase letters', async () => {
        const canvas = makeCanvas();
        const vp = makeFastVNCPaste();
        vp.canvas = canvas;

        const shiftEvents = [];
        canvas.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {shiftEvents.push(e);}
        });

        await vp.sendString('A');

        expect(shiftEvents.length).toBeGreaterThan(0);
    });

    it('sends Shift events for special characters (@, #, etc.)', async () => {
        const canvas = makeCanvas();
        const vp = makeFastVNCPaste();
        vp.canvas = canvas;

        const shiftEvents = [];
        canvas.addEventListener('keydown', (e) => {
            if (e.key === 'Shift') {shiftEvents.push(e);}
        });

        await vp.sendString('@');

        expect(shiftEvents.length).toBeGreaterThan(0);
    });

    it('releases Shift at the end of the string', async () => {
        const canvas = makeCanvas();
        const vp = makeFastVNCPaste();
        vp.canvas = canvas;

        const keyupEvents = [];
        canvas.addEventListener('keyup', (e) => keyupEvents.push(e));

        await vp.sendString('A');

        const shiftUps = keyupEvents.filter((e) => e.key === 'Shift');
        expect(shiftUps.length).toBeGreaterThan(0);
    });
});

// ─── handleRightClick ────────────────────────────────────────────────────────

describe('handleRightClick()', () => {
    it('pastes clipboard text on right-click when rightClickEnabled is true', async () => {
        const canvas = makeCanvas();
        const vp = new VNCPaste({ enableLogging: false, delay: 0, rightClickEnabled: true });
        vp.canvas = canvas;

        navigator.clipboard.readText.mockResolvedValue('hello');
        const sendStringSpy = jest.spyOn(vp, 'sendString').mockResolvedValue();

        const event = new MouseEvent('mousedown', { button: 2, bubbles: true, cancelable: true });
        await vp.handleRightClick(event);

        expect(sendStringSpy).toHaveBeenCalledWith('hello');
    });

    it('does nothing when rightClickEnabled is false', async () => {
        const canvas = makeCanvas();
        const vp = new VNCPaste({ enableLogging: false, rightClickEnabled: false });
        vp.canvas = canvas;

        const sendStringSpy = jest.spyOn(vp, 'sendString');
        const event = new MouseEvent('mousedown', { button: 2 });
        await vp.handleRightClick(event);

        expect(sendStringSpy).not.toHaveBeenCalled();
    });

    it('does nothing for non-right-click buttons', async () => {
        const canvas = makeCanvas();
        const vp = new VNCPaste({ enableLogging: false, rightClickEnabled: true });
        vp.canvas = canvas;

        const sendStringSpy = jest.spyOn(vp, 'sendString');
        const event = new MouseEvent('mousedown', { button: 0 });
        await vp.handleRightClick(event);

        expect(sendStringSpy).not.toHaveBeenCalled();
    });

    it('logs an error when clipboard access fails', async () => {
        const canvas = makeCanvas();
        const vp = new VNCPaste({ enableLogging: false, rightClickEnabled: true });
        vp.canvas = canvas;

        navigator.clipboard.readText.mockRejectedValue(new Error('Permission denied'));
        const errSpy = jest.spyOn(vp, 'error');

        const event = new MouseEvent('mousedown', { button: 2, cancelable: true });
        await vp.handleRightClick(event);

        expect(errSpy).toHaveBeenCalledTimes(1);
    });
});

// ─── log / error ─────────────────────────────────────────────────────────────

describe('log()', () => {
    it('calls console.log when enableLogging is true', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const vp = new VNCPaste({ enableLogging: true });
        vp.log('test message');
        expect(spy).toHaveBeenCalledWith('[VNCPaste]', 'test message');
    });

    it('does not call console.log when enableLogging is false', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const vp = new VNCPaste({ enableLogging: false });
        vp.log('silent');
        expect(spy).not.toHaveBeenCalled();
    });
});

describe('error()', () => {
    it('always calls console.error regardless of enableLogging', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const vp = new VNCPaste({ enableLogging: false });
        vp.error('oops');
        expect(spy).toHaveBeenCalledWith('[VNCPaste]', 'oops');
    });
});
