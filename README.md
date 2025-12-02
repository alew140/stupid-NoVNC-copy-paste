# stupid-NoVNC-copy-paste 📋 V 1.5

> Because sometimes the dumbest solutions are the best! 🚀

Add copy-paste to NoVNC with a ridiculously simple Javascript script. Now with support for special characters, proper case handling, and more configurations.


## Why? 🤔
Because having to type everything manually in NoVNC is stupid. And yes, there are probably better ways to do this, but hey, this works!

## Quick Start ⚡
1. Press `F12` to open the browser console
2. Copy the content of `index.js`
3. Paste it in the console
4. Done! Now use right-click to paste text in your NoVNC session

### Test Example 🧪
Try copying and pasting this text to test the functionality:
```
VNCPaste@2025#TestHash$Alew140.dev%
```
This example includes uppercase, lowercase, and special characters - all should work correctly now!

## What's New in this Version 🎉
- Finally! Support for symbols that need Shift (@, #, $, etc)
- **Fixed case handling!** Now uppercase and lowercase letters work correctly thanks @SiegfriedSchmidt 🎯
- Customizable configuration (in case you want to make it even more stupid)
- Better error handling (because things can fail)

## Configuration (that we don't need) ⚙️
```javascript
// Default configuration
const vncPaste = new VNCPaste({
    selector: '#noVNC_canvas',    // Main canvas selector
    fallbackSelector: 'canvas',   // Fallback selector if main fails
    delay: 50,                    // Typing speed (ms)
    enableLogging: true,          // To see what the hell is happening
    rightClickEnabled: true       // In case you prefer using vncPaste.sendString('text here')
});
vncPaste.init();

// Or if you want to be more specific:
const vncPasteCustom = new VNCPaste({
    selector: '#mySpecialCanvas',
    delay: 100,                   // Slower for slow connections
    enableLogging: false,         // Silent mode
    rightClickEnabled: false      // Disable right-click
});
vncPasteCustom.init();
```

## Known Issues 🐛
- Sometimes fails with some special characters (or maybe I already fixed it)
- It's not the most elegant solution in the world (but you already knew that)
- There are probably better ways to do this
- Typing doesn't cost that much
- Pasting a script from a stranger in your console doesn't sound like a good idea



## What's New in V1.5 🚀
- **Fixed Newline Handling**: `\n` now actually presses Enter! No more single-line disasters.
- **Windows Support**: Fixed the double-enter issue with `\r\n`. We strip the `\r` because we don't need that negativity in our lives.
- **Manual Testing Guide**: Added tips for the brave souls who type commands manually.

## Manual Testing (For the brave/bored) 🤠
If you are manually typing `sendString` in the console because you like typing:
- `\n` = Presses **Enter** (New line)
- `\\n` = Types `\n` literally (like for `echo -e`)

```javascript
// Example: Press Enter after typing 'ls' (Executes the command)
vncPaste.sendString('ls\n');

// Example: Type a literal \n (Good for echo commands)
vncPaste.sendString('echo -e "\\nLine 1\\nLine 2 \\nLine 3"');
```

So if your `echo` command executes in 3 separate lines, it's because you forgot to escape the backslash. That's on you. 🤷‍♂️



## Bug Fixes in V1.3 🔧
- **Fixed case inversion bug**: Previously, uppercase letters were being typed as lowercase and vice versa. Now "VNCPaste" stays "VNCPaste"! ✨

## Contributing 🤝
Want to make this project less stupid? Go ahead!
- Fix things
- Add features
- Make it better
- Let's put it in a chrome extension
- Or just use it and laugh

## License 📄
Do whatever you want with this. Seriously. It's not like I can get rich with this repo

---
Made with 💖 by [alew140](https://alew140.dev)
---
