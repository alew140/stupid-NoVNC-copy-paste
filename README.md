# stupid-NoVNC-copy-paste 📋 V 1.2

> ¡Porque a veces las soluciones más tontas son las mejores! 🚀

Agrega copy-paste a NoVNC con un script Javascript ridículamente simple. Ahora con soporte para caracteres especiales y más configuraciones.

## ¿Por qué? 🤔
Porque tener que escribir todo manualmente en NoVNC es una estupidez. Y sí, probablemente hay mejores maneras de hacer esto, pero hey, ¡esto funciona!

## Inicio Rápido ⚡
1. Presiona `F12` para abrir la consola del navegador
2. Copia el contenido de `index.js`
3. Pégalo en la consola
4. ¡Listo! Ahora usa clic derecho para pegar texto en tu sesión NoVNC

## Novedades en esta versión 🎉
- ¡Por fin! Soporte para símbolos que necesitan Shift (@, #, $, etc)
- Configuración personalizable (por si quieres hacerlo aún más estúpido)
- Mejor manejo de errores (porque las cosas pueden fallar)

## Configuración (que no necesitamos) ⚙️
```javascript
// Configuración por defecto
const vncPaste = new VNCPaste({
    selector: '#noVNC_canvas',    // Selector principal del canvas
    fallbackSelector: 'canvas',   // Selector de respaldo si el principal falla
    delay: 50,                    // Velocidad de escritura (ms)
    enableLogging: true,          // Para ver qué diablos está pasando
    rightClickEnabled: true       // Por si prefieres usar vncPaste.sendString('text here')
});
vncPaste.init();

// O si quieres ser más específico:
const vncPasteCustom = new VNCPaste({
    selector: '#miCanvasEspecial',
    delay: 100,                   // Más lento para conexiones lentas
    enableLogging: false,         // Modo silencioso
    rightClickEnabled: false      // Desactiva el clic derecho
});
vncPasteCustom.init();
```

## Problemas Conocidos 🐛
- A veces falla con algunos caracteres especiales ( o quizas ya lo arregle )
- No es la solución más elegante del mundo (pero eso ya lo sabías)
- Probablemente hay mejores maneras de hacer esto
- Escribir no cuesta tanto 
- Pegar el script de un desconocido en tu consola no suena como una buena idea

## Contribuir 🤝
¿Quieres hacer este proyecto menos estúpido? ¡Adelante!
- Arregla cosas
- Agrega features
- Hazlo mejor
- Vamos a ponerlo en una extension de chrome
- O simplemente úsalo y ríete

## Licencia 📄
Haz lo que quieras con esto. En serio. no es como que me pueda volver rico con este repo

---
Hecho con 💖 por [alew140](https://alew140.com)
---
