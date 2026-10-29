# El cepillado embrujado

Aplicación interactiva de escritorio para **HealthySmile Lab**. Anima a los niños a abrir la boca y hacerse un "cepillado digital" delante de la cámara con temática de Halloween sin sustitos.

Hecho con **p5.js 2**, **p5.sound**, **ml5.js (faceMesh)** y **Tauri 2**.

La documentación completa está en [`DOCUMENTACION.md`](DOCUMENTACION.md).

## Qué hace

- Pantalla de inicio con título, instrucciones, slider de duración y botón "¡Abrir el portal!".
- Animación de carga mientras se prepara el detector de caras.
- Detecta si la boca está abierta con ml5.js faceMesh.
- Mientras la boca está abierta salen partículas que cambian según el tiempo seguido; burbujas, caramelos, fantasmas y murciélagos.
- 4 bichos de caries que explotan al llenarse la barra "Dientes relucientes".
- Sonidos, pantalla final y vuelta automática al inicio.
- App de escritorio en modo kiosco con pantalla completa, sin bordes con resolución 1920 × 1080.

## Requisitos 

- Node.js (LTS) --> `winget install OpenJS.NodeJS.LTS` 
- Rust -->`winget install Rustlang.Rustup` 
- Herramientas de C++ de Visual Studio --> `winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"`

Después de instalar todo lo anterior, comprobar:

- node -v
- cargo --version


A tener en cuenta:

- Hacen falta **al menos 5 GB libres** en el disco C:, porque la primera compilación ocupa bastante.
- Ejecutarlo en una **carpeta local** (por ejemplo donde yo lo hice; `C:\proyectos\cepillado`), **no dentro de Google Drive**, esto da error... me llevé bastante tiempo entenderlo.
- La app **necesita internet** al abrirse, porque p5.js, p5.sound y ml5.js se cargan desde la web.


## Ejecutar como aplicación de escritorio

### 1. Entrar en la carpeta del proyecto

Es la carpeta donde está `package.json`.

```powershell
cd C:\proyectos\cepillado
```

### 2. Instalar las dependencias, solo la primera vez

- npm install


## 3. Ejecutar en el navegador

### Con Live Server de Visual Studio Code

**Paso 1. Abrir el proyecto en Visual Studio Code**

Ve a **File → Open Folder...** y selecciona la carpeta principal del proyecto, la que contiene `package.json`, `src` y `src-tauri`.

**Paso 2. Instalar la extensión Live Server**

Pulsa `Ctrl + Shift + X`, buscar **Live Server** (de Ritwick Dey) y pulsar **Install**. 

**Paso 3. Abrir la página**

En el panel de archivos despliega la carpeta `src`, haz clic derecho sobre `index.html` y elige **Open with Live Server**.

Se abrirá el navegador en una dirección parecida a:

```
http://127.0.0.1:5500/src/index.html
```

**Paso 4. Usar la app**

Pulsa **"¡Abrir el portal!"**, acepta el permiso de la cámara (esto es importante!!!) y abre bien la boca.


## 4. Ejecutar como programa de escritorio (Tauri)

La app se abre en una ventana propia a pantalla completa y sin bordes.

**Paso 1. Comprobar que las herramientas están instaladas**

```powershell
node -v
cargo --version
```

Los dos comandos deben mostrar un número de versión. Si alguno da error, instala lo que falta:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Rustlang.Rustup
winget install Microsoft.VisualStudio.2022.BuildTools --override "--wait --passive --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended"
```

**Paso 2. Entrar en la carpeta del proyecto**

```powershell
cd C:\proyectos\cepillado
```

Tiene que ser la carpeta donde está `package.json`. Para comprobarlo:

```powershell
dir
```

En la lista deben aparecer `package.json`, `src` y `src-tauri`.

**Paso 3. Instalar las dependencias**

```powershell
npm install
```

Descarga la herramienta de Tauri indicada en `package.json` y crea la carpeta `node_modules`.

**Paso 4. Probar la app en modo desarrollo**

```powershell
npm run dev
```

- La **primera vez tarda varios minutos** porque Rust tiene que descargar y compilar Tauri. Es normal ver muchas líneas `Compiling`. Las siguientes veces ya si arranca en segundos.
- Al terminar se abre la app a pantalla completa. Pulsa **¡Abrir el portal!** y, si Windows lo pide, permite el uso de la cámara.
- Mientras está abierta, si guardas cambios en `src` la ventana se recarga sola.
- Para **salir** de la app: `Alt + F4`.
- Para **parar** el modo desarrollo desde la terminal: `Ctrl + C`.

**Paso 5. Crear el programa ejecutable (`.exe`)**

```powershell
npm run build:sin-instalador
```

Compila la versión. El programa queda en:

```
C:\proyectos\cepillado\src-tauri\target\release\cepillado-embrujado.exe
```

Se abre con **doble clic**, sin necesidad de terminal. Para salir: `Alt + F4`.


## Autor

Jesús Zamora Jiménez, Grado Multimedia (UOC) 2026