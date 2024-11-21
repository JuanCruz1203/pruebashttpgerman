const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const serverUrl = 'http://localhost:8080';


canvas.width = 500;
canvas.height = 600;
let gameOver = false;
let score = 0; 
let bestScore = 0; // mejor puntaje registrado

//clase para hacer la manzana

class apple {
    constructor(posicion, radio, color, contexto) {
        this.posicion = posicion;
        this.radio = radio;
        this.color = color;
        this.contexto = contexto;

    }

    dibujo() {
        this.contexto.beginPath();
        this.contexto.arc(this.posicion.x, this.posicion.y, this.radio, 0, 2 * Math.PI);
        this.contexto.fillStyle = this.color;
        this.contexto.fill();
        this.contexto.closePath();
    }

    colision(snake) {
        let vector1 = {
            x: this.posicion.x - snake.posicion.x,
            y: this.posicion.y - snake.posicion.y
        };
        
        let distancia = Math.sqrt((vector1.x * vector1.x) + (vector1.y * vector1.y));

        if(distancia < snake.radio + this.radio) {
            this.posicion = {
                x: Math.floor(Math.random() * (canvas.width - this.radio * 2) + this.radio),
                y: Math.floor(Math.random() * (canvas.height - this.radio * 2) + this.radio)
            }
            snake.agregarCabeza();
            score++;
        }
    }
}


async function sendBestScoreToServer(bestScore) {
    try {
        // obtener los mejores puntajes actuales desde el servidor
        const response = await fetch(`${serverUrl}/records.json`);
        let data = await response.json();

        // agregar el nuevo puntaje al array
        data.topScores.push({ puntuacion: bestScore, fecha: new Date().toISOString() });

        // ordenar los puntajes de mayor a menor
        data.topScores.sort((a, b) => b.puntuacion - a.puntuacion);

        // limitar a los 5 mejores puntajes
        data.topScores = data.topScores.slice(0, 5);

        // envia los puntajes actualizados al servidor
        const updateResponse = await fetch(`${serverUrl}/records.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) 
        });

        const updateData = await updateResponse.json();
        console.log(updateData);
    } catch (error) {
        console.error('Error al enviar la mejor puntuación:', error);
    }
}



async function loadTopScores() {
    try {
        
        const response = await fetch(`${serverUrl}/records.json`);
        const data = await response.json();

        
        displayTopScores(data.topScores);
    } catch (error) {
        console.error('Error al cargar los puntajes:', error);
    }
}

// para mostrar los puntajes en la página
function displayTopScores(topScores) {
    const scoreList = document.getElementById('topScoresList');
    
    // Limpiar el contenedor antes de agregar los puntajes
    scoreList.innerHTML = '';

    // Mostrar los 5 mejores puntajes
    topScores.forEach((score, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.classList.add('score-item');
        scoreItem.textContent = `Top ${index + 1}: ${score.puntuacion} puntos (Fecha: ${new Date(score.fecha).toLocaleString()})`;
        scoreList.appendChild(scoreItem);
    });
}

// función para cargar los puntajes al iniciar
loadTopScores();



// clase para hacer que el cuerpo siga a la cabeza

class CuerpoSnake {
    constructor(radio,color,contexto,path) {
        this.radio = radio;
        this.color = color;
        this.contexto = contexto;
        this.path = path;
    }

    dibujoCirculo(x, y, radio, color) {
        this.contexto.beginPath();
        this.contexto.arc(x, y,radio, 0, 2 * Math.PI);
        this.contexto.fillStyle = color;
        this.contexto.fill();
        this.contexto.closePath();
}

    dibujo() {
        for (let i = 0; i < this.path.length; i++) {
            this.dibujoCirculo(this.path[i].x, this.path[i].y, this.radio, this.color);
        }
    }
}

// clase para hacer la capocha
class snake {

    constructor(posicion, radio, velocidad, color, contexto) {
        this.posicion = posicion;
        this.radio = radio;
        this.velocidad = velocidad;
        this.color = color;
        this.contexto = contexto;
        this.rotacion = 0;
        this.body = [];
        this.teclas = {
            A: false,
            D: false
        };
        this.tecladoPulse();
        this.direccion = { x: 1, y: 0 };
        
    }

    InicioJuego() {
        for(let i = 0; i < 3; i++) {
            let path = [];
            for(let j = 0; j < 12; j++) {
            path.push({
            x:this.posicion.x,
            y:this.posicion.y
            })
        }
        this.body.push(new CuerpoSnake(this.radio, this.color, this.contexto, path));
        }
        this.dibujoCuerpo(); 
      } 

    dibujoCirculo(x, y, radio, color) {
        this.contexto.beginPath();
        this.contexto.arc(x, y,radio, 0, 2 * Math.PI);
        this.contexto.fillStyle = color;
        this.contexto.fill();
        this.contexto.closePath();

    }

    agregarCabeza() {
        let path = [];
        for(let j = 0; j < 5; j++) {
            path.push({
            // accedemos al ultimo lugar del cuerpo para agregar el nuevo cuerpo
            x:this.body.slice(-1)[0].path.slice(-1)[0].x,
            y:this.body.slice(-1)[0].path.slice(-1)[0].y
            })
        }
        this.body.push(new CuerpoSnake(this.radio, this.color, this.contexto, path));
        }
    
    dibujoCabeza () {
        this.dibujoCirculo(this.posicion.x, this.posicion.y,this.radio, this.color);

        // ojazos nene
        this.dibujoCirculo(this.posicion.x, this.posicion.y - 9, this.radio - 5, "#fff");
        this.dibujoCirculo(this.posicion.x + 1, this.posicion.y - 9, this.radio - 7, "#000");
        this.dibujoCirculo(this.posicion.x + 5, this.posicion.y - 8, this.radio - 11, "#fff");

        this.dibujoCirculo(this.posicion.x, this.posicion.y + 9, this.radio - 5, "#fff");
        this.dibujoCirculo(this.posicion.x + 1, this.posicion.y + 9, this.radio - 7, "#000");
        this.dibujoCirculo(this.posicion.x + 5, this.posicion.y + 8, this.radio - 11, "#fff");

    }

    actualizar() {
        this.dibujoCuerpo();
        this.dibujo();
        if (this.teclas.A) {
            this.rotacion -= 0.04;
        }
        if (this.teclas.D) {
            this.rotacion += 0.04;        }
        this.posicion.x += Math.cos(this.rotacion) * this.velocidad;
        this.posicion.y += Math.sin(this.rotacion) * this.velocidad;

        
        this.colision();
        
    }

    dibujoCuerpo() {

        // con this.body(que es donde se 'guarda; el cuerpo del snake) se agrega un nuevo cuerpo en la primera posicion
        this.body[0].path.unshift({
            x: this.posicion.x,
            y: this.posicion.y
        })
        // llamamos a la fn dibujo para que se dibuje el cuerpo
        this.body[0].dibujo();

        for (let i = 1; i < this.body.length; i++) {
            this.body[i].path.unshift(this.body[i-1].path.pop());
            this.body[i].dibujo();
        }
        this.body[this.body.length - 1].path.pop();
    }

    dibujo() {
        this.contexto.save();

        this.contexto.translate(this.posicion.x, this.posicion.y);
        this.contexto.rotate(30 * Math.PI / 180);
        this.contexto.translate(-this.posicion.x, -this.posicion.y);
        this.dibujoCabeza();
        this.contexto.restore();
    }

    tecladoPulse() {
        document.addEventListener("keydown", (e) => {
            if(e.key == 'a' || e.key == 'A' || e.key == 'ArrowLeft' ) {
                this.teclas.A = true;
                this.direccion = { x: -1, y: 0 };
                
            }
            if(e.key == 'd' || e.key == 'D' || e.key == 'ArrowRight') {
                this.teclas.D = true;
                this.direccion = { x: 1, y: 0 };
                
            }
        })
        
        document.addEventListener("keyup", (e) => {
            if(e.key == 'a' || e.key == 'A' || e.key == 'ArrowLeft') {
                this.teclas.A = false;
                
            }
            if(e.key == 'd' || e.key == 'D' || e.key == 'ArrowRight') {
                this.teclas.D = false;
                
            }
        })
    }

    colision() {
        if (this.posicion.x + this.radio > canvas.width) {
            this.posicion.x = 0 + this.radio; // Teletransportar al borde izquierdo
        } 
        if (this.posicion.x - this.radio < 0) {
            this.posicion.x = canvas.width - this.radio; // Teletransportar al borde derecho
        }
        if (this.posicion.y + this.radio > canvas.height) {
            this.posicion.y = 0 + this.radio; // Teletransportar al borde superior
        }
        if (this.posicion.y - this.radio < 0) {
            this.posicion.y = canvas.height - this.radio; // Teletransportar al borde inferior
        }
        for (let i = 0; i < this.path-1; i++){
            if(this.posicion.y + this.radio === this.body.slice(-1)[i].path.y
              && this.posicion.x + this.radio === this.body.slice(-1)[i].path.x){
                gameOver = true;
              }
        }
    }
}

function endGame() {
    gameOver = true;  // El juego terminó
    console.log('Fin del juego. Puntaje final:', score);

    if (score > bestScore) {
        bestScore = score;
        console.log('Nuevo mejor puntaje:', bestScore);

        // Enviar el mejor puntaje al servidor
        sendBestScoreToServer(bestScore);
    }
    loadTopScores();  
}

// creamos una instancia de la mismisima clase snake

const SnakeFrost = new snake({x: 100, y: 100}, 12, 2, "#ff0094", ctx);
SnakeFrost.InicioJuego();
const manzanaFood = new apple({x: 100, y: 100}, 8, "red", ctx);




/* ------ solo dibuja el fondo -------
* * * *  columnas en el bucle width
* * * *  filas en el bucle height
*/
function fondoSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1B1C30";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < canvas.height; i+= 90) {
        for(let j = 0; j < canvas.width; j+= 90) {
            ctx.fillStyle = "#23253C";
            ctx.fillRect(j, i, 70, 70);
        }
    }
}

function InitGame() {
    if(!gameOver){
        fondoSnake();
        SnakeFrost.actualizar();
        manzanaFood.dibujo();
        manzanaFood.colision(SnakeFrost);
        requestAnimationFrame(InitGame);
    }
}
InitGame(); 