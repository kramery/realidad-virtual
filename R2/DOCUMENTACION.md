# El Cepillado Embrujado — Documentación

**Cliente:** HealthySmile Lab, **Temática:** Halloween, **Tecnologías:** p5.js 2, p5.sound, ml5.js 1 (faceMesh), Tauri 2

El boceto de paleta, tipografía y flujo de pantallas está en [docs/Boceto.pdf](docs/Boceto.pdf), y la versión editable en `docs/Boceto editable.pptx`.

Enlace a Github: https://github.com/kramery/realidad-virtual/tree/main/R2

## 1. La idea

Después de Halloween los niñes tienen la boca llena de caramelos y de **bichos de caries**. La pantalla se convierte en un espejo mágico, de manera que mientras el niñe mantiene la boca **bien abierta, como un vampiro**, salen partículas de su boca y se llena la barra de «dientes relucientes». Cada cuarto de barra explota uno de los 4 bichos que rodean los labios.

Cuanto más tiempo **seguido** aguanta con la boca abierta, más especial es la magia apareciendo diferentes iconos.

Las partículas nacen en el centro de la boca y su tamaño depende de lo grande que se vea la boca. El contorno de los labios cambia de color con cada nivel. Estos son:

| 0 a 2 s | Espuma de baba | Burbujas verdes |
| 2 a 4 s | Lluvia de caramelos | + caramelos que caen por la gravedad |
| 4 a 7 s | ¡Fantasmas fuera! | + fantasmas que suben movidos por un "viento" hecho con `noise()` |
| Más de 7 s | ¡MODO VAMPIRO! | + murciélagos y estrellas  que brillan con `blendMode(ADD)` |

## 2. Workflow de la app

La app se abre a pantalla completa con una pantalla de inicio sobre un fondo de luna, murciélagos y calabazas. Esa pantalla tiene el logo, el título, una frase que explica qué hay que hacer, un slider para elegir la duración del hechizo (de 15 a 120 segundos) y el botón **¡Abrir el portal!**. Al pulsarlo se muestra una animación de carga (una calabaza que bota rodeada de puntos que giran) mientras ml5.js prepara el detector de caras y se pide permiso para usar la cámara. Durante el juego el niñe se ve como en un espejo. Un mensaje en la parte de abajo le dice siempre qué hacer: ¡Abre la boca bien grande, como un vampiro!, ¡Muy bien! Aguanta... o ¿Dónde estás? Ponte delante del espejo mágico. Arriba se ve la barra de progreso y el nombre del nivel de magia. 

La interacción termina cuando la barra se llena y aparece la pantalla final, un consejo de higiene dental y el botón ¡Otra vez! Si nadie lo pulsa, a los 25 segundos vuelve sola al inicio para el siguiente niñe.

## 3. Cómo se detecta la boca abierta

1. **ml5.js faceMesh** [R18] encuentra la cara en la imagen de la cámara y devuelve sus puntos clave.
2. El **base sketch** del enunciado [R25] enseña que cada cara trae `cara.lips`, con el centro, el ancho y el alto de los labios, y sus puntos.
3. Siguiendo la idea del **vídeo de Patt Vira** [R24], se mide la **distancia entre el labio de arriba (punto 13) y el de abajo (punto 14)**. En el vídeo se usa para detectar la boca cerrada y aquí se usa al revés, para activar cuando está abierta.
4. Esa distancia se divide entre el **ancho de la boca**. Así el resultado no cambia aunque el niñe esté más cerca o más lejos.
5. Si el resultado es mayor que **0,15**, la boca está abierta.

ml5.js faceMesh usa por dentro un modelo de aprendizaje automático, porque sin él no se puede encontrar una cara en una imagen. Pero todo lo que hacemos nosotros con los puntos es geometría sencilla ya una distancia y una división.

## 4. Estética

* **Concepto *spooky-cute*:** Halloween que divierte, no que asusta, porque el público tiene entre 3 y 8 años. Colores vivos sobre fondo de noche, emojis simpáticos y nada de sangre ni calaveras.
* **Paleta:** noche `#120a1f`, morado `#6b2fa3`, calabaza `#ff7518`, caramelo `#ffd23f`, baba `#8dff6b` y hueso `#f4f1e8`, más los colores de los niveles (`#ffb347`, `#c69cff`, `#ffd95e`).
* **Tipografía:** **Creepster** para títulos y botones (letras que gotean) y **Nunito** para los textos (redondeada y fácil de leer). Se descargan de Google Fonts y se guardan en el proyecto como `.ttf`, como enseña el tutorial de fuentes de p5.js [R12].
* **Animaciones:** el botón "late" con una animación CSS, la calabaza de la carga bota con `sin()`, los murciélagos del inicio vuelan con `noise()`, los bichos tiemblan cuando el niñe abre la boca y las partículas siguen el modelo de The Nature of Code [R22].
* **Multimedia:** el logotipo SVG de HealthySmile Lab con una calabaza de dientes blancos, y cuatro sonidos cargados con p5.sound [R14]: cepillado en bucle (solo suena con la boca abierta), pop al explotar un bicho, fanfarria de victoria y música de caja de música. Son de creación propia y están en `src/recursos/`.


## 5. Investigación de librerías

 Librería | Qué ofrece | Comentario |

- **ml5.js faceMesh** | Puntos clave de la cara y partes ya agrupadas (labios, ojos, óvalo) | **Elegida.** Es la que propone el curso [R18], tiene ejemplos para p5.js 2.x [R20] y se integra muy fácilmente con p5. |
- MediaPipe Face Landmarker (Google) | Puntos de la cara y valores de expresión (boca abierta, sonrisa, ceño…) | Más precisa, pero más difícil de usar desde p5. La probé en una primera versión y la descarté por complejidad. |
- face-api.js | Detección de cara, 68 puntos, edad, género y 7 emociones | Detecta emociones directamente, pero carga varios modelos y es más pesada. 
- Human | Cara, emociones, edad, manos, cuerpo y gestos | Muy completa, pero demasiado pesada para lo que necesito. |
- clmtrackr | 70 puntos y un ejemplo de emociones | Antigua y menos precisa.


## 6. App de escritorio con Tauri

### Pasos

1. Instalar Node.js, Rust y las herramientas de C++ de Visual Studio, que son los prerrequisitos de Tauri [R21].
2. Crear la estructura con `npm create tauri-app@latest`.
3. Indicar en `tauri.conf.json` que la página está en la carpeta `src` y configurar la ventana en modo app con las opciones de los recursos del curso [R21].
4. Ejecutar `npm install` y `npm run dev` para probarla, y `npm run build:sin-instalador` para obtener el `.exe`. Los pasos detallados están en `README.md`.

### Opciones de `tauri.conf.json`

El formato JSON no admite comentarios, así que las explico aquí:

Opción | Valor | Qué hace |

- `frontendDist` | `../src` | Carpeta donde está la página 
- `width` / `height` | 1920 / 1080 | Tamaño de la ventana, para monitores 1080p
- `fullscreen` | true | Pantalla completa [R21] 
- `decorations` | false | Sin barra de título ni botones [R21] 
- `resizable` | false | No se puede cambiar el tamaño [R21] 
- `alwaysOnTop` | true | Siempre por encima de otras ventanas [R21] 
- `csp` | null | Valor de la plantilla, deja cargar p5.js, p5.sound y ml5.js desde internet 
- `icon` | lista | Iconos de la app, guardados en `src/recursos/iconos/` 


### Dificultades encontradas

* **Proyecto dentro de Google Drive:** `npm install` fallaba (`TAR_ENTRY_ERROR`, `EPERM`, `EBADF`) porque la carpeta sincronizada de Drive no deja escribir bien los miles de archivos de `node_modules`. Lo solucioné moviendo el proyecto a `C:\proyectos\`.
* **Faltaba Rust:** `npm run dev` daba el error `cargo metadata ... program not found`. Tuve que instalar Rust y las herramientas de C++ de Visual Studio y abrir una ventana nueva de la terminal.
* **Versión de Rust mal escrita:** con `edition = "2026"` en `Cargo.toml` no compilaba, porque esa edición no existe. Lo corregí a `"2021"`.
* **Carpeta equivocada en Visual Studio Code:** al abrir `src-tauri` en vez de la carpeta del proyecto, la carpeta `src` que se veía era la de Rust y no aparecía `index.html`.
* **Cámara bloqueada en el navegador:** al abrir la página desde una dirección de red (`192.168.x.x`), el navegador bloquea la cámara (`getUserMedia is not implemented`). Solo funciona desde `localhost` o `127.0.0.1` (Live Server) o dentro de la app de escritorio.
* **p5.js 2 frente a los tutoriales antiguos:** el vídeo [R24] y el base sketch [R25] usan `preload()`, que en p5.js 2 ya no existe. El detector se crea con `await ml5.faceMesh(...)`, como en los ejemplos de ml5 para p5.js 2.x [R20], y las fuentes y los sonidos se cargan con `await` en `setup()` [R12] [R14].
* **Sonido:** la p5.sound antigua no funciona con p5.js 2, así que uso la versión nueva. Los navegadores no dejan sonar nada hasta que el usuario hace clic, por eso llamo a `userStartAudio()` al pulsar el botón de inicio. Además, en la nueva p5.sound `loop(true)` solo activa la repetición y hay que llamar a `play()` para que suene.


## 7. Recursos del curso utilizados

Cada comentario del código indica con una etiqueta de qué recurso sale esa parte.

 Etiqueta | Recurso | Dónde se usa |

- [R1] | Referencia de p5.js (ES) — <https://p5js.org/es/reference/> | Funciones de dibujo y cálculo: `circle`, `text`, `sin`, `dist`, `random`, `deltaTime`, `push`/`pop`|
- [R2] | p5.Element — <https://p5js.org/es/reference/p5/p5.Element> | `show`, `hide`, `html`, `style`, `addClass`, `parent`, `attribute`, `mousePressed`, `input` |
- [R3] | createCanvas y resizeCanvas — <https://p5js.org/reference/p5/createCanvas> | Lienzo del tamaño de la ventana y su ajuste |
- [R4] | createButton — <https://p5js.org/reference/p5/createButton> | Botones ¡Abrir el portal! y ¡Otra vez! |-
- [R5] | createSlider — <https://p5js.org/reference/p5/createSlider> | Slider de duración |
- [R6] | createElement — <https://p5js.org/reference/p5/createElement> | Panel, logo, título y textos del inicio |
- [R7] | select (y vídeo 8.10 de The Coding Train) — <https://p5js.org/es/reference/p5/select> | Marcador y pantalla final de `index.html` |
- [R8] | createCapture, `video.hide()`, `image(video, x, y)` | Cámara en espejo dibujada en el lienzo |
- [R9] | createVector | Posición, velocidad y aceleración de las partículas |
- [R10] | noise | Movimiento de los fantasmas y de los murciélagos del inicio |
- [R11] | blendMode | Brillo de las estrellas |
- [R12] | Tutorial Loading and selecting fonts — <https://p5js.org/tutorials/loading-and-selecting-fonts/> | Fuentes `.ttf`, `loadFont`, `textFont`, `async setup` |
- [R13] | Tutorial Creating and styling HTML — <https://p5js.org/tutorials/creating-styling-html/> | Estilos CSS de los elementos creados con p5 |
- [R14] | p5.sound y loadSound | Carga y reproducción de los sonidos (`loop`, `play`, `pause`, `stop`, `isPlaying`, `userStartAudio`) |
- [R15] | fullscreen | Pantalla completa en el navegador |
- [R16] | The Coding Train 8.4: gestión de eventos DOM con callbacks | `mousePressed()` del botón e `input()` del slider |
- [R17] | The Coding Train 8.7: fundamentos de CSS | `style.css` |
- [R18] | API FaceMesh de ml5.js — <https://docs.ml5js.org/#/reference/facemesh> | Opciones del detector, `detectStart`, puntos 13 y 14 |
- [R19] | beginShape() y vertex() | Contorno de los labios |
- [R20] | Ejemplos de ml5 para p5.js 2.x — <https://github.com/ml5js/ml5-next-gen/tree/main/examples> | `await ml5.faceMesh(...)`, versión de p5.js y ejemplo `faceMesh-shapes-from-parts` |
- [R21] | Tauri: Getting Started, `npm create tauri-app@latest` y modo app completa — <https://v2.tauri.app/start/> | Carpeta `src-tauri` y `tauri.conf.json` |
- [R22] | The Nature of Code (D. Shiffman), cap. 4 «Particle Systems» | Clase `Particula` y lista de partículas |
- [R23] | readme.so — <https://readme.so/es> | Estructura del `README.md` |
- [R24] | Vídeo Detector de soplido de Patt Vira (enunciado) — <https://www.youtube.com/watch?v=FlBRSIz5AcQ> | Idea de medir la distancia entre los labios |
- [R25] | Base sketch de ml5 (enunciado) — <https://editor.p5js.org/ml5/sketches/9y9W7eAee> | `cara.lips`, cámara de 640×480 |

**Creación propia:** logo SVG, sonidos e iconos (`src/recursos/`), boceto (`docs/`), la división de la separación de los labios por el ancho de la boca, la mecánica de los bichos y los niveles de partículas.
