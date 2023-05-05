const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.8;



//player 
const player = new Fighter({
    position: {
        x: 10,
        y: 20
    },
    velocity: {
        x: 0,
        y: 10
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/samuraiMack/idle.png',
    scale: 2.5,
    framesMax: 8,
    offset: {
        x: 215,
        y: 187
    },
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8,

        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6,
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
            framesMax: 4,
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6,
        }
    }, attackBox: {
        offset: {
            x: 120,
            y: 60
        },
        width: 130,
        height: 50
    }
});

// enemy 

const enemy = new Fighter({

    position: {
        x: 400,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0

    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/kenji/idle.png',
    scale: 2.5,
    framesMax: 4,
    offset: {
        x: 215,
        y: 200
    },
    sprites: {
        idle: {
            imageSrc: './img/kenji/idle.png',
            framesMax: 4
        },
        run: {
            imageSrc: './img/kenji/Run.png',
            framesMax: 8,

        },
        jump: {
            imageSrc: './img/kenji/Jump.png',
            framesMax: 2,
        },
        fall: {
            imageSrc: './img/kenji/Fall.png',
            framesMax: 2,
        },
        attack1: {
            imageSrc: './img/kenji/Attack1.png',
            framesMax: 4,
        },
        takeHit: {
            imageSrc: './img/kenji/Take hit.png',
            framesMax: 3,
        },
        death: {
            imageSrc: './img/kenji/Death.png',
            framesMax: 7,
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }

});


const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    q: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    }
};


decreaseTimer();

class Background {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.newWidth = 0;
        this.newHeight = 0;
    }

    update() {
        c.fillStyle = this.color;
        c.fillRect(this.x, this.y, this.width, this.height);
        c.drawImage(backgroundImage, 0, 0, this.newWidth, this.newHeight);
    }
}

const backgroundImage = new Image();
backgroundImage.onload = function () {
    const aspectRatio = this.width / this.height;
    const canvasAspectRatio = canvas.width / canvas.height;
    if (aspectRatio > canvasAspectRatio) {
        background.newWidth = canvas.width;
        background.newHeight = canvas.width / aspectRatio;
    } else {
        background.newWidth = canvas.height * aspectRatio;
        background.newHeight = canvas.height;
    }
};
backgroundImage.src = './background/Battleground3.png';

const background = new Background(0, 0, canvas.width, canvas.height, "lightblue");

function animate() {
    window.requestAnimationFrame(animate);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    background.update();
    //shop.update();

    c.fillStyle = 'rgba(255, 255, 255, 0.0)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // player movement 

    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -3;
        player.switchSprite('run');

    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 3;
        player.switchSprite('run')
    } else {
        player.switchSprite('idle');
    }
    //jumping 
    if (player.velocity.y < 0) {
        player.switchSprite('jump');
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }
    // enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run');
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run');
    } else {
        enemy.switchSprite('idle');
    }

    //jumping 
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump');
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }


    // detect for collision & enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && player.framesCurrent === 4
    )
    // this is where enemy gets hit  
    {
        enemy.takeHit();
        player.isAttacking = false;

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    // if player misses 
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
    }
    // this is where our player gets hit 

    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking && enemy.framesCurrent === 2
    ) {
        player.takeHit();
        enemy.isAttacking = false;
        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }
    // if enemy  misses 
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
    }

    //end game base on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}
animate();

//movement keys
window.addEventListener('keydown', (event) => {
    if (!player.dead) {
        switch (event.key) {
            case 'd':
                keys.d.pressed = true;
                player.lastKey = 'd';
                break;

            case 'a':
                keys.a.pressed = true;
                player.lastKey = 'a';
                break;

            case 'w':
                console.log(player.position.y)

                keys.w.pressed = true;
                player.velocity.y = -17;
                break;
            case ' ':
                player.attack()
                break;
            case 'q':

                keys.q.pressed = true;
                player.viewpoint *= -1;
                break;
        }
    }

    if (!enemy.dead) {
        switch (event.key) {
            //enemy keys
            case 'ArrowRight':
                keys.ArrowRight.pressed = true;
                enemy.lastKey = 'ArrowRight';
                break;

            case 'ArrowLeft':
                keys.ArrowLeft.pressed = true;
                enemy.lastKey = 'ArrowLeft';
                break;
            case 'ArrowUp':
                keys.ArrowUp.pressed = true;
                enemy.velocity.y = -20;
                break;
            case 'ArrowDown':
                enemy.attack()
                break;
        }
    }
})
window.addEventListener('keyup', (event) => {

    //player keys
    switch (event.key) {
        case 'd':
            keys.d.pressed = false;
            break;

        case 'a':
            keys.a.pressed = false;
            break;
        case 'q':
            keys.a.pressed = false;
            break;
    }

    //enemy keys
    switch (event.key) {
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;

        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;

    }
    c.save();
    c.scale(-1, 1);
    c.restore();

})