# Flores Amarillas 🌻

Escena 3D interactiva con un campo de flores amarillas que crecen animadas, hecha con **React + Vite** y [Three.js](https://threejs.org/).

## Características

- Campo de ~200 flores amarillas que brotan con animación y se mecen con el viento.
- Cielo con degradado, sol, nubes a la deriva y suelo con textura generada proceduralmente.
- Lluvia de pétalos amarillos flotantes.
- Mensaje de amistad con animación de entrada.
- **Al hacer clic/tap en una flor** esta hace un rebote y muestra una frase bonita aleatoria.
- Controles de cámara: arrastrar para orbitar, rueda para acercar, rotación automática suave.
- Diseño responsive.

## Estructura

```
flores/
├── index.html              # Entrada de Vite
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx            # Punto de entrada de React
│   ├── App.jsx             # Estado del mensaje y composición
│   ├── index.css           # Estilos globales
│   ├── components/
│   │   ├── Scene.jsx       # Escena Three.js dentro de un componente
│   │   ├── Overlay.jsx     # Título y mensaje principal
│   │   ├── FlowerMessage.jsx
│   │   └── Loader.jsx
│   ├── data/
│   │   └── phrases.js      # Frases que salen al tocar una flor
│   └── three/
│       ├── environment.js  # Cielo, suelo, luces, sol y nubes
│       ├── flower.js       # Geometría y campo de flores animado
│       └── petals.js       # Pétalos flotantes
└── README.md
```

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

Para compilar a producción:

```bash
npm run build
npm run preview
```

## Personalizar

Edita el mensaje en `src/components/Overlay.jsx`:

```jsx
<h1 className="message__title">Para Fely 🌻</h1>
<p className="message__text">Con cariño, tu buen vecino, el hombre araña 🕷</p>
<p className="message__sub">Que nunca te falten flores amarillas ni motivos para sonreír.</p>
```

Las frases que salen al tocar una flor están en `src/data/phrases.js`. Agrega, quita o cambia las que quieras.

Otros ajustes rápidos:

- Cantidad de flores: `new FlowerField()` en `src/components/Scene.jsx` (por defecto 200).
- Cantidad de pétalos: `new FloatingPetals()` en `src/components/Scene.jsx` (por defecto 160).
- Colores de las flores: función `buildFlowerGeometry()` en `src/three/flower.js`.
- Cielo y suelo: `src/three/environment.js`.
