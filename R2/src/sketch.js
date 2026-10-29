/* 
   sketch.js, programa principal
   
   Que hace la app:
     1. Muestra una pantalla de inicio con un botón.
     2. Al pulsarlo, enseña una animación de carga mientras se prepara el detector de caras de ml5.js y se enciende la cámara
     3. Mientras el niñe tiene la boca abierta, salen partículas de su boca y se va llenando la barra de "dientes relucientes". Cuanto más tiempo seguodo aguanta, más especiales son las partículas
     4. Al llenar la barra aparece la pantalla final.


*/


// Aquí se guardan los datos que comparten todas las partes del programa

let estado = 'inicio';

// Detección de la cara (ml5.js)
let faceMesh;// el detector de caras
let video;// la imagen de la cámara
let caras = [];// aquí ml5 deja las caras que encuentra

// Opciones del detector, tal y como aparecen en la API de FaceMesh [R18]:
//   maxFaces: 1, busco solo una cara
//   refineLandmarks false, no necesito el detalle de los ojos
//   flipped: true, los puntos salen en espejo, igual que el vídeo
const opcionesFaceMesh = { maxFaces: 1, refineLandmarks: false, flipped: true };

// a partir de este valor considero que la boca está abierta, es la separación de los labios dividida entre el ancho de la boca; ver medirBoca()).
// si a algún niñe le cuesta, se puede bajar un poco, por ejemplo a 0.12
const UMBRAL = 0.15;

// Para colocar los puntos de la cara encima del vídeo agrandado (ver dibujarVideo())
let escala = 1;
let desplazamientoX = 0;
let desplazamientoY = 0;

// Juego
let particulas = [];         // lista de partículas que hay ahora en pantalla [R22]
let bichos = [];             // los 4 bichos de caries que rodean la boca
let tiempoBocaAbierta = 0;   // segundos en total con la boca abierta, llena la barra
let racha = 0;               // segundos initerrumpidos con la boca abierta, cambia las partículas
let rachaMaxima = 0;         // la mejor racha de la partida que se enseña al final
let duracion = 30;           // segundos que hay que tener la boca abierta para ganar
let tiempoEnFinal = 0;       // cuánto lleva en la pantalla final
let ultimoMensaje = '';      // para no reescribir el mismo mensaje en cada fotograma

// los 4 niveles según la racha, segundos seguidos con la boca abierta
const NIVELES = [
  { nombre: 'Espuma de baba',      desde: 0, color: '#8dff6b' },
  { nombre: 'Lluvia de caramelos', desde: 2, color: '#ffb347' },
  { nombre: '¡Fantasmas fuera!',   desde: 4, color: '#c69cff' },
  { nombre: '¡MODO VAMPIRO!',      desde: 7, color: '#ffd95e' },
];

// elementos de la página como botones, textos, barra
let panelInicio, sliderDuracion, textoDuracion;
let hud, barraRelleno, textoPorcentaje, textoNivel, textoMensaje;
let panelFinal;

// tipografía para el lienzo y sonidos
let fuenteTitulo = null;
let sonidoCepillo, sonidoPop, sonidoVictoria, musica;


/* 
   SETUP: se ejecuta UNA vez al abrir la app. En p5.js 2 setup puede ser asyn,: así podemos esperar (await) a que se carguen la tipografía y los sonidos antes de seguir.
   Lo explica el tutorial de fuentes [R12] y es como se carga el sonido con la nueva p5.sound [R14].*/

async function setup() {
  // lienzo del tamaño de la ventana (en el kiosco: 1920 x 1080) [R3]. parent('escenario') lo mete en el hueco que hay al principio de index.html [R2], así el marcador y la pantalla final quedan siempre por encima del lienzo.
  const lienzo = createCanvas(windowWidth, windowHeight);
  lienzo.parent('escenario');

  // la tipografía de Halloween para los textos del lienzo [R12]. Como en el tutorial el archivo .ttf se descarga de Google Fonts y se guarda en recursos/fuentes.
  // "try / catch": si el archivo no está, no pasa nada, se usa una letra genérica.
  try {
    fuenteTitulo = await loadFont('recursos/fuentes/Creepster-Regular.ttf');
  } catch (error) {
    console.warn('No encuentro la fuente Creepster; uso una genérica.');
  }

  // sonidos con p5.sound, loadSound carga un archivo de audio [R14]. los .wav están en recursos/sonidos
  sonidoCepillo = await loadSound('recursos/sonidos/cepillado.wav');
  sonidoPop = await loadSound('recursos/sonidos/pop.wav');
  sonidoVictoria = await loadSound('recursos/sonidos/victoria.wav');
  musica = await loadSound('recursos/sonidos/musica.wav');


  musica.loop(true);
  sonidoCepillo.loop(true);

  crearPantallaInicio();
  buscarElementosDeLaPagina();
}


/* La pantalla de inciio creada con p5.js se fabrica un panel con logo, título, instrucciones, un slider y el botón de empezar. El aspecto como los colores y tamaños están en style.css. */
function crearPantallaInicio() {
  // caja que contiene todo. createElement crea cualquier etiqueta HTML [R6]
  panelInicio = createElement('div');
  panelInicio.addClass('panel');     // addClass le pone la clase CSS "panel" [R2]

  // Logo del laboratorio, una imagen <img>
  const logo = createElement('img');
  logo.attribute('src', 'recursos/imagenes/logo.svg');   // attribute() cambia una propiedad del elemento [R2]
  logo.addClass('logo');
  logo.parent(panelInicio);                              // parent() lo mete dentro del panel [R2]



  createElement('h1', 'El Cepillado Embrujado').parent(panelInicio);
  createElement('p', '¡Los bichos de caries se han colado en tu boca después de tanto caramelo! ' +
    'Ábrela bien grande, como un vampiro, y aguanta para lanzar el hechizo de cepillado.')
    .addClass('instrucciones')
    .parent(panelInicio);

  // Texto que acompaña al slider
  textoDuracion = createElement('p', 'Duración del hechizo: 30 segundos');
  textoDuracion.parent(panelInicio);

  // Slider para elegir la duración: mínimo 15 s, máximo 120 s, empieza en 30, va de 15 en 15 [R5]
  sliderDuracion = createSlider(15, 120, 30, 15);
  sliderDuracion.addClass('deslizador');
  sliderDuracion.parent(panelInicio);
  // input() se ejecuta cada vez que se mueve el slider: es un "callback" [R2] [R16]
  sliderDuracion.input(() => {
    textoDuracion.html('Duración del hechizo: ' + sliderDuracion.value() + ' segundos');
  });

  // Botón de inicio [R4]. Pedir un clic antes de encender la cámara, sobretodo para corregir errores ya que mi navegador no me lo pedia y no veas... lo que tardé en esta tontería ya que faltaba el permiso. Y también por buenas prácticas y además los navegadores lo exigen para poder sonar
  const boton = createButton('¡Abrir el portal!');
  boton.addClass('boton-magico');
  boton.parent(panelInicio);
  boton.mousePressed(empezar);   // al pulsar, se ejecuta la función empezar() [R2] [R16]

  createElement('p', 'La cámara solo se usa en este ordenador. No se graba ninguna imagen.')
    .addClass('nota')
    .parent(panelInicio);
}


/* Buscar los elementos que ya están en index.html. select('#nombre') busca en la página el elemento con ese id [R7]. 
*/
function buscarElementosDeLaPagina() {
  hud = select('#hud');
  barraRelleno = select('#barra-relleno');
  textoPorcentaje = select('#porcentaje');
  textoNivel = select('#nivel');
  textoMensaje = select('#mensaje');
  panelFinal = select('#final');

  // Botón "¡Otra vez!" de la pantalla final, colocado dentro de su hueco [R4] [R2]
  const botonRepetir = createButton('¡Otra vez!');
  botonRepetir.addClass('boton-magico');
  botonRepetir.parent('hueco-boton-final');
  botonRepetir.mousePressed(empezarPartida);
}


/* Comenzar, se ejecuta al pulsar ¡Abrir el portal!, "async" y "await" significan: espera a que termine esta tarea  antes de pasar a la siguiente línea, pero sin congelar la pantalla */
async function empezar() {

  if (!navigator.mediaDevices) {
    alert('El navegador no deja usar la cámara desde esta dirección.');
    return;
  }

  panelInicio.hide();                 // oculto el panel de inicio [R2]
  duracion = sliderDuracion.value();  // leo lo que eligió el niñe en el slider [R5]
  estado = 'cargando';                // draw() empieza a dibujar la animación de carga

  // Pantalla completa [R15] aunque en la app de escritorio ya lo está desde el principio
  fullscreen(true);

  // Los navegadores no dejan sonar nada hasta que el usuario hace clic. userStartAudio() "despierta" el sonido de p5.sound aprovechando este clic [R14].

  await userStartAudio();
  if (!musica.isPlaying()) musica.play();   // play() pone en marcha la música y queda en bucle [R14]

  try {
    // solo la primera vez cargar el detector y encender la cámara
    if (!faceMesh) {
      // Con p5.js 2, el detector se crea con "await", como en los ejemplos de ml5 [R20]
      faceMesh = await ml5.faceMesh(opcionesFaceMesh);
      video = createCapture(VIDEO, { flipped: true });
      video.size(640, 480);
      video.hide();

      // Pido a ml5 que busque caras en el vídeo todo el rato y me las pase a recibirCaras() [R18] [R25]
      faceMesh.detectStart(video, recibirCaras);
    }
    empezarPartida();
  } catch (error) {
    // si algo falla vuelvo al inicio y aviso
    console.error(error);
    musica.stop();
    estado = 'inicio';
    panelInicio.show();
    alert('No se pudo preparar el espejo mágico.\n' +
          'Comprueba la conexión a internet y que la cámara esté conectada y no la use otra app.');
  }
}

// aquí recibo de ml5 la lista de caras que ha encontrado [R18] [R25]
function recibirCaras(resultados) {
  caras = resultados;
}


/* epezar una partida, pongo los contadores a cero y coloco los 4 bichos, también lo usa el botón ¡Otra vez! */
function empezarPartida() {
  panelFinal.hide();
  hud.show();                 // enseño el marcador [R2]
  tiempoBocaAbierta = 0;
  racha = 0;
  rachaMaxima = 0;
  particulas = [];
  ultimoMensaje = '';

  // coloco un bicho en cada esquina de la boca, el ángulo es su dirección y desaparece el porcentaje de barra en el que explota
  bichos = [
    { angulo: -135, desaparece: 0.25, vivo: true },
    { angulo: -45,  desaparece: 0.50, vivo: true },
    { angulo: 45,   desaparece: 0.75, vivo: true },
    { angulo: 135,  desaparece: 1.00, vivo: true },
  ];

  if (!musica.isPlaying()) musica.play();   // vuelvo a poner la música si vengo del final [R14]
  estado = 'jugando';
}


/* Draw se repite unas 60 veces por segundo y dibujo una cosa u otra según la pantalla en la que esté */
function draw() {
  background('#120a1f');   // fondo morado muy oscuro, el color noche de la paleta

  if (estado === 'inicio') {
    dibujarFondoInicio();
  } else if (estado === 'cargando') {
    dibujarCarga();
  } else if (estado === 'jugando') {
    jugar();
  } else if (estado === 'final') {
    dibujarFinal();
  }
}

// si la ventana cambia de tamaño adapto el lienzo [R3]
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


/* Fondo de la pantalla de inicio, una luna y unos murciélagos volando [R1] */
function dibujarFondoInicio() {
  // la luna es un círculo grande con un halo transparente alrededor
  noStroke();
  fill(255, 220, 150, 25);
  circle(width * 0.85, height * 0.2, 320);
  fill('#ffe9b0');
  circle(width * 0.85, height * 0.2, 220);

  // tres murciélagos cruzan la pantalla, con frameCount avanzan y con noise() suben y bajan suave [R10]
  textAlign(CENTER, CENTER);
  textSize(60);
  for (let i = 0; i < 3; i++) {
    const x = (frameCount * (2 + i) + i * 500) % (width + 200) - 100;   // con % vuelven a salir por la izquierda
    const y = height * (0.15 + i * 0.12) + (noise(i * 10, frameCount * 0.01) - 0.5) * 120;
    text('🦇', x, y);
  }

  // dos calabazas en el suelo
  textSize(90);
  text('🎃', width * 0.08, height * 0.9);
  text('🎃', width * 0.92, height * 0.9);
}


/* animación de carga mientras ml5 prepara el detector, una calbaza que bota con puntos girando [R1] */
function dibujarCarga() {
  const cx = width / 2;
  const cy = height / 2;

  // hago que la calabaza bote con sin(), que va y vuelve una y otra vez
  const bote = abs(sin(frameCount * 0.08)) * 60;
  textAlign(CENTER, CENTER);
  textSize(160);
  text('🎃', cx, cy - bote);

  // 8 puntos de colores girando alrededor de la calabaza
  noStroke();
  for (let i = 0; i < 8; i++) {
    const angulo = frameCount * 0.05 + i * (TWO_PI / 8);
    fill(i % 2 === 0 ? '#ff7518' : '#8dff6b');
    circle(cx + cos(angulo) * 170, cy + sin(angulo) * 170, 22);
  }

  // escribo el título con la fuente que cargué en setup() [R12]
  fill('#ffd23f');
  if (fuenteTitulo) textFont(fuenteTitulo);
  textSize(70);
  text('Preparando la poción…', cx, height * 0.15);
  textFont('Nunito');   // aquí uso la fuente por su nombre, como en el tutorial [R12]
  textSize(26);
  fill('#f4f1e8');
  text('Si aparece un aviso, pulsa "Permitir" para usar la cámara', cx, height * 0.85);
}


/* El juego se ejecuta en cada fotograma mientras se juega */
function jugar() {
  dibujarVideo();

  // si no veo ninguna cara aviso y no hago nada más
  if (caras.length === 0) {
    ponerMensaje('¿Dónde estás? Ponte delante del espejo mágico');
    if (sonidoCepillo.isPlaying()) sonidoCepillo.pause();
    racha = 0;
    actualizarParticulas();
    return;
  }

  // cojo la primera cara y mido su boca
  const cara = caras[0];
  const boca = medirBoca(cara);

  // paso deltaTime de milisegundos a segundos, es el tiempo desde el fotograma anterior [R1]
  const segundos = deltaTime / 1000;

  if (boca.abierta) {
    tiempoBocaAbierta = tiempoBocaAbierta + segundos;   // lleno la barra
    racha = racha + segundos;                           // cuento el tiempo seguido
    rachaMaxima = max(rachaMaxima, racha);
    if (!sonidoCepillo.isPlaying()) sonidoCepillo.play();   // suena el cepillo y se repite solo [R14]
    ponerMensaje('¡Muy bien! Aguanta con la boca abierta…');
    crearParticulas(boca);
  } else {
    racha = 0;                                          // al cerrar la boca la racha vuelve a cero
    if (sonidoCepillo.isPlaying()) sonidoCepillo.pause();   // callo el cepillo [R14]
    ponerMensaje('¡Abre la boca bien grande, como un vampiro!');
  }

  dibujarLabios(cara, boca);
  dibujarBichos(boca);
  actualizarParticulas();
  actualizarMarcador();

  // si la barra está llena paso a la pantalla final
  if (tiempoBocaAbierta >= duracion) {
    terminar();
  }
}


/* Dibujo el vídeo de 640x480 agrandado para llenar la pantalla y centrado con image() [R8] */
function dibujarVideo() {
  escala = max(width / video.width, height / video.height);    // cuánto lo agrando
  const anchoDibujo = video.width * escala;
  const altoDibujo = video.height * escala;
  desplazamientoX = (width - anchoDibujo) / 2;                   // lo que muevo para centrarlo
  desplazamientoY = (height - altoDibujo) / 2;
  image(video, desplazamientoX, desplazamientoY, anchoDibujo, altoDibujo);
}

// paso un punto del vídeo (640x480) a su sitio en la pantalla
function aPantalla(x, y) {
  return {
    x: desplazamientoX + x * escala,
    y: desplazamientoY + y * escala,
  };
}


/* mido la boca con la distancia entre los labios 13 y 14 [R18] */
function medirBoca(cara) {
  const labioArriba = cara.keypoints[13];   // centro del labio de arriba por dentro [R18]
  const labioAbajo = cara.keypoints[14];    // centro del labio de abajo por dentro [R18]

  // con dist() saco la distancia entre los dos labios [R1]
  const separacion = dist(labioArriba.x, labioArriba.y, labioAbajo.x, labioAbajo.y);
  const apertura = separacion / cara.lips.width;   // lo divido por el ancho de la boca para que dé igual si el niñe está cerca o lejos

  const centro = aPantalla(cara.lips.centerX, cara.lips.centerY);
  return {
    x: centro.x,                          // centro de la boca en la pantalla
    y: centro.y,
    ancho: cara.lips.width * escala,      // ancho de la boca en la pantalla
    alto: cara.lips.height * escala,
    apertura: apertura,
    abierta: apertura > UMBRAL,           // true si la boca está abierta
  };
}


/* dibujo los labios con beginShape() y vertex() [R19], cada borde por separado para que no salga una raya cruzando la boca */

// puntos del borde de fuera de los labios, en orden [R18]
const LABIOS_FUERA = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
// puntos del borde de dentro, el hueco de la boca, en orden [R18]
const LABIOS_DENTRO = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];

function dibujarLabios(cara, boca) {
  const nivel = nivelActual();

  stroke(nivel.color);                      // el borde va del color del nivel
  strokeWeight(boca.abierta ? 6 : 2);       // y más gordo con la boca abierta
  noFill();
  dibujarContorno(cara, LABIOS_FUERA);
  strokeWeight(boca.abierta ? 3 : 1);
  dibujarContorno(cara, LABIOS_DENTRO);
}

// uno con líneas los puntos de la lista y cierro la forma [R19]
function dibujarContorno(cara, numeros) {
  beginShape();
  for (const n of numeros) {
    const punto = cara.keypoints[n];
    const p = aPantalla(punto.x, punto.y);
    vertex(p.x, p.y);
  }
  endShape(CLOSE);   // CLOSE une el último punto con el primero
}


/* Los 4 bichos de caries cada uno explota cuando la barra llega a su porcentaje */
function dibujarBichos(boca) {
  const progreso = tiempoBocaAbierta / duracion;   // de 0 a 1

  fill(255);   // sin relleno text() no dibuja los emojis [R1]
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(boca.ancho * 0.35);

  for (const bicho of bichos) {
    if (!bicho.vivo) continue;   // si ya explotó no lo dibujo

    // lo coloco alrededor de la boca con cos() y sin() según su ángulo [R1]
    const temblor = boca.abierta ? random(-3, 3) : 0;   // tiemblan de miedo si abres la boca
    const x = boca.x + cos(radians(bicho.angulo)) * boca.ancho * 0.9 + temblor;
    const y = boca.y + sin(radians(bicho.angulo)) * boca.ancho * 0.6;
    text('🦠', x, y);

    // si la barra ha llegado a su porcentaje lo hago explotar
    if (progreso >= bicho.desaparece) {
      bicho.vivo = false;
      sonidoPop.play();   // suena el pop [R14]
      for (let i = 0; i < 12; i++) {
        particulas.push(new Particula(x, y, 'estrella', boca.ancho * 0.25));
      }
    }
  }
}


/* las artículas cambian según la racha y nacen en la boca siguiendo el capítulo 4 de The Nature of Code [R22] */
function nivelActual() {
  // miro los niveles de mayor a menor y me quedo con el primero que alcanza la racha
  for (let i = NIVELES.length - 1; i >= 0; i--) {
    if (racha >= NIVELES[i].desde) return NIVELES[i];
  }
  return NIVELES[0];
}

function crearParticulas(boca) {
  const tamano = boca.ancho * 0.3;   // cuanto más grande se ve la boca más grandes son

  // de 0 a 2 s solo burbujas de espuma
  particulas.push(new Particula(boca.x, boca.y, 'burbuja', random(10, tamano)));

  // de 2 a 4 s añado caramelos
  if (racha >= 2 && frameCount % 4 === 0) {
    particulas.push(new Particula(boca.x, boca.y, 'caramelo', tamano));
  }
  // de 4 a 7 s añado fantasmas
  if (racha >= 4 && frameCount % 15 === 0) {
    particulas.push(new Particula(boca.x, boca.y, 'fantasma', tamano * 1.4));
  }
  // a partir de 7 s añado murciélagos y estrellas
  if (racha >= 7 && frameCount % 6 === 0) {
    particulas.push(new Particula(boca.x, boca.y, 'murcielago', tamano * 1.2));
    particulas.push(new Particula(boca.x, boca.y, 'estrella', tamano * 0.8));
  }
}

function actualizarParticulas() {
  // recorro la lista al revés para poder borrar sin saltarme ninguna 
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].actualizar();
    particulas[i].dibujar();
    if (particulas[i].estaMuerta()) {
      particulas.splice(i, 1);   // quito de la lista la que ya ha muerto
    }
  }
  // nunca dejo más de 300 a la vez para que el ordenador no vaya lento
  if (particulas.length > 300) {
    particulas.splice(0, particulas.length - 300);
  }
}


/* Marcador, actualizo la barra y los textos de arriba con style() y html() [R2] */
function actualizarMarcador() {
  const porcentaje = min(100, round((tiempoBocaAbierta / duracion) * 100));
  barraRelleno.style('width', porcentaje + '%');
  textoPorcentaje.html(porcentaje + '%');

  const nivel = nivelActual();
  textoNivel.html(nivel.nombre);
  textoNivel.style('color', nivel.color);
}

// cambio el mensaje de abajo solo si es distinto, así no reescribo la página a cada momento [R2]
function ponerMensaje(texto) {
  if (texto !== ultimoMensaje) {
    textoMensaje.html(texto);
    ultimoMensaje = texto;
  }
}


/* final por fin, escondo el marcador y enseño la pantalla final con su sonido */
function terminar() {
  estado = 'final';
  tiempoEnFinal = 0;
  hud.hide();                                          // escondo el marcador [R2]
  select('#fin-racha').html(rachaMaxima.toFixed(1));   // pongo la mejor racha con un decimal [R7] [R2]
  panelFinal.show();
  sonidoCepillo.stop();                                // paro el cepillo y suena la victoria [R14]
  sonidoVictoria.play();
}

function dibujarFinal() {
  dibujarVideo();

  // hago llover caramelos y estrellas desde arriba
  if (frameCount % 3 === 0) {
    const p = new Particula(random(width), -30, random(['caramelo', 'estrella']), random(30, 60));
    p.velocidad = createVector(0, random(1, 3));   // les doy velocidad hacia abajo para que caigan [R9]
    particulas.push(p);
  }
  actualizarParticulas();

  // si en 25 segundos nadie pulsa nada vuelvo al inicio para el siguiente niñe
  tiempoEnFinal = tiempoEnFinal + deltaTime / 1000;
  if (tiempoEnFinal > 25) {
    panelFinal.hide();
    panelInicio.show();
    musica.stop();
    particulas = [];
    estado = 'inicio';
  }
}