/* 
   Aquí se define cómo es una partícula; es una burbuja, un caramelo, un fantasma, un murciélago o una estrella que sale de la boca.

   Con esa clase genero tantas partículas como se quiera y cada una recuerda dónde está, hacia dónde va y cuánto le queda de vida.

  - [R22] La estructura es la del capítulo 4 "Particle Systems" de The Nature of Code (Daniel Shiffman) donde cada partícula tiene posición, velocidad, aceleración y vida (lifespan), y
         métodos para aplicar fuerzas, actualizarse, dibujarse y saber si ya ha muerto.

- [R9] createVector() guarda una posición o una velocidad (x e y juntas).

   - [R10] noise() da un movimiento más natural que random() (fantasmas).
   - [R11] blendMode() cambia cómo se mezclan los colores (brillo de estrellas).
   - [R1]  El resto de funciones de dibujo (circle, text, push, pop…) están en la referencia de p5.js.
 */

class Particula {

  // el constructor se ejecuta una vez, al nacer la partícula.
  //   x, y es dónde nace, el centro de la boca
  //   tipo, qué es: 'burbuja', 'caramelo', 'fantasma', 'murcielago', 'estrella'
  // y el tamano, lo grande que es, que depende de lo grande que se vea la boca


  constructor(x, y, tipo, tamano) {
    this.tipo = tipo;
    this.tamano = tamano;

    // [R9] [R22] Tres vectores, como en The Nature of Code
    this.posicion = createVector(x, y);  // pillar donde estaa
    this.velocidad = createVector(random(-3, 3), random(-6, -2)); // hacia dónde va 
    this.aceleracion = createVector(0, 0);                       // las fuerzas que la empujan

    // [R22] "lifespan": 255 = recién nacida y opaca; 0 = desaparece
    this.vida = 255;

    // [R10] Cada partícula tiene su propio punto de partida en el ruido así no se mueven todas igual
    this.semilla = random(1000);

    // Los fantasmas suben despacio y los murciélagos salen disparados hacia los lados
    if (tipo === 'fantasma') {
      this.velocidad = createVector(random(-0.5, 0.5), random(-2.5, -1.5));
    }
    if (tipo === 'murcielago') {
      // random([-1, 1]) elige al azar izquierda (-1) o derecha (1)
      this.velocidad = createVector(random([-1, 1]) * random(5, 8), random(-4, -1));
    }
  }


  // aplicarFuerza, lo que hace es sumar una fuerza, por ejemplo la gravedad, a la aceleración. [R22] Es el método applyForce() de The Nature of Code

  aplicarFuerza(fuerza) {
    this.aceleracion.add(fuerza);
  }


  // en actualizar se ejecuta en cada fotograma, mueve la partícula y le quita un poco de vida

  actualizar() {
    // Los caramelos y las estrellas caen y la gravedad tira de ellos hacia abajo
    if (this.tipo === 'caramelo' || this.tipo === 'estrella') {
      this.aplicarFuerza(createVector(0, 0.25));
    }

    // los fantasmas se balancean con un viento suave hecho con noise() [R10], noise() devuelve un número entre 0 y 1 que cambia poco a poco; al restarle 0.5 lo convierto en un empujoncito a izquierda o derecha.
    if (this.tipo === 'fantasma') {
      const viento = (noise(this.semilla + frameCount * 0.02) - 0.5) * 0.3;
      this.aplicarFuerza(createVector(viento, 0));
      this.velocidad.x = constrain(this.velocidad.x, -2, 2);  // que no se escapen de lado
    }

    // [R22] El orden de siempre, la aceleración cambia la velocidad y la velocidad cambia la posición, y la aceleración se pone a cero
    this.velocidad.add(this.aceleracion);
    this.posicion.add(this.velocidad);
    this.aceleracion.mult(0);

    this.vida = this.vida - 4;   // pierde vida, dura unos 60 fotogramas que es un segundp
  }


  // dibujar, pinta la partícula en su sitio

  dibujar() {
    push();   // push/pop: lo que cambio aquí no afecta al resto del dibujo [R1]

    if (this.tipo === 'burbuja') {
      // la burbuja es círculo sin relleno con borde verde clarito. El cuarto número del color es la transparencia, baja con la vida [R22]
      noFill();
      stroke(200, 255, 180, this.vida);
      strokeWeight(2);
      circle(this.posicion.x, this.posicion.y, this.tamano);
    } else {
      // [R11] Las estrellas se dibujan en modo ADD; sus colores se suman a lo que hay debajo y parecen brillar
      if (this.tipo === 'estrella') {
        blendMode(ADD);
      }
      // las partículas son emojis escritos con text() [R1], para que se desvanezcan uso la transparencia del lienzo (drawingContext es el lienzo "de verdad" que hay debajo de p5) [R1].
      drawingContext.globalAlpha = this.vida / 255;
      // text() solo dibuja si hay un relleno activo, el color da igual porque los emojis conservan sus colores [R1]
      fill(255);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(this.tamano);
      text(this.emoji(), this.posicion.x, this.posicion.y);
      // dejo todo como estaba para la siguiente partícul, mezcla normal (BLEND) y sin transparencia [R11] [R1]
      blendMode(BLEND);
      drawingContext.globalAlpha = 1;
    }

    pop();
  }

  // Devuelve el dibujo (emoji) que corresponde a cada tipo
  emoji() {
    if (this.tipo === 'caramelo') return '🍬';
    if (this.tipo === 'fantasma') return '👻';
    if (this.tipo === 'murcielago') return '🦇';
    if (this.tipo === 'estrella') return '✨';
    return '⭐';
  }

  // [R22] isDead(): dice si la partícula ya ha terminado su vida
  estaMuerta() {
    return this.vida <= 0;
  }
}