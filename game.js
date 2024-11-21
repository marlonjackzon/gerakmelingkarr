const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const radius = 150;
let angle = 0;
let speed = 0.02;
let coinCount = 0;
let score = 0;
let level = 1;
let gameRunning = false;
let direction = 1; // 1: kiri-kanan, -1: kanan-kiri
let bombSpeed = 4;
let bombRadius = 10;
let intervalID;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const coinRadius = 5; // Ukuran koin
const coins = [];
const bombs = [];

const topScoreKey = 'topScore';
let topScore = localStorage.getItem(topScoreKey) ? parseInt(localStorage.getItem(topScoreKey)) : 0;
document.getElementById('topScoreText').innerText = "Top Score: " + topScore;

document.getElementById('playButton').addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyPress);

function startGame() {
    gameRunning = true;
    score = 0;
    level = 1;
    coinCount = 0;
    bombs.length = 0; // Reset bom
    coins.length = 0; // Reset koin
    document.getElementById("levelText").innerText = "Level: " + level;
    document.getElementById("scoreText").innerText = "Score: " + score;

    generateCoins();
    intervalID = setInterval(updateGame, 1000 / 60); // 60 FPS
    document.getElementById('playButton').style.display = 'none'; // Sembunyikan tombol Play
}

function updateGame() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan layar

    // Update titik
    angle += direction * speed;
    if (angle >= Math.PI * 2) angle = 0; // Reset sudut jika lebih dari 2pi

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    // Gambar lingkaran
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gambar titik
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

    // Gambar koin
    coins.forEach((coin, index) => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coinRadius, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();

        // Cek jika titik menyentuh koin
        const distance = Math.sqrt(Math.pow(coin.x - x, 2) + Math.pow(coin.y - y, 2));
        if (distance < coinRadius + 5) {
            coins.splice(index, 1); // Hapus koin
            score += 10;
            document.getElementById("scoreText").innerText = "Score: " + score;
            if (coins.length === 0) {
                levelUp();
            }
        }
    });

    // Gambar bom
    bombs.forEach((bomb, index) => {
        ctx.beginPath();
        ctx.arc(bomb.x, bomb.y, bombRadius, 0, Math.PI * 2);
        ctx.fillStyle = "black";
        ctx.fill();

        // Cek jika bom mengenai titik
        const distance = Math.sqrt(Math.pow(bomb.x - x, 2) + Math.pow(bomb.y - y, 2));
        if (distance < bombRadius + 5) {
            gameOver();
        }

        bomb.x += bomb.speedX; // Bom bergerak horizontal
        bomb.y += bomb.speedY; // Bom bergerak vertikal

        // Periksa jika bom keluar layar
        if (bomb.x < 0 || bomb.x > canvas.width || bomb.y > canvas.height || bomb.y < 0) {
            bombs.splice(index, 1); // Hapus bom jika keluar layar
        }
    });
}

function generateCoins() {
    coins.length = 0;
    for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        coins.push({ x, y });
    }
}

function levelUp() {
    level++;
    bombSpeed += 1; // Meningkatkan kecepatan bom
    document.getElementById("levelText").innerText = "Level: " + level;
    generateCoins();
    spawnMoreBombs();
}

function gameOver() {
    clearInterval(intervalID);
    gameRunning = false;
    
    if (score > topScore) {
        topScore = score;
        localStorage.setItem(topScoreKey, topScore); // Simpan top score
        document.getElementById('topScoreText').innerText = "Top Score: " + topScore;
    }
    
    alert("Game Over! Skor akhir: " + score);
    document.getElementById('playButton').style.display = 'block'; // Tampilkan tombol play
}

function handleKeyPress(event) {
    if (event.code === "Space" && gameRunning) {
        // Jika tombol spasi ditekan, balik arah
        direction *= -1;
    }
}

// Fungsi untuk menghasilkan lebih banyak bom saat level meningkat
function spawnMoreBombs() {
    const bombsToAdd = level + 2; // Menambahkan lebih banyak bom setiap level
    for (let i = 0; i < bombsToAdd; i++) {
        createBomb();
    }
}

// Buat bom secara acak dengan gerakan vertikal dan horizontal
function createBomb() {
    if (!gameRunning) return;

    const x = Math.random() * canvas.width; // Posisi X acak
    const y = 0; // Bom muncul dari atas

    // Set kecepatan horizontal acak antara -2 dan 2
    const speedX = Math.random() * 4 - 2;

    // Set kecepatan vertikal acak antara 2 dan 4
    const speedY = Math.random() * 2 + 2;

    bombs.push({ x, y, speedX, speedY });
}

// Buat bom setiap 1 detik
setInterval(createBomb, 3000);
document.getElementById('reverseButton').addEventListener('click', reverseDirection);
document.addEventListener('keydown', handleKeyPress);

function reverseDirection() {
    direction *= -1; // Membalikkan arah bola
}

// Menggunakan tombol spasi untuk membalikkan arah bola
function handleKeyPress(event) {
    if (event.code === "Space" && gameRunning) {
        direction *= -1; // Membalikkan arah bola
    }
}
