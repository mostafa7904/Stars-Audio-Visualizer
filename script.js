const canvas = document.querySelector("canvas");
const input = document.querySelector("input[type=file]");
const audio = document.createElement("audio");
const ctx = canvas.getContext("2d");

// Initials
let audioCtx, analyser, src, frqBits;
let stars_velocity = 1;
const fft_size = 128; // or 256 if you want "less" visualazation
const star_size = 3;
const star_min_scale = 0.2;
const star_max_scale = 5;
const stars_count = (window.innerHeight + window.innerWidth) / 8;
const stars_colors = ["white", "red"];
const stars = [];

const scale = window.devicePixelRatio || 1;

const width = window.innerWidth * scale;
const height = window.innerHeight * scale;

canvas.width = width;
canvas.height = height;

input.oninput = addFile;
function addFile(e) {
  // Make and set the src of the audio element
  const file = e.target.files[0];
  src = URL.createObjectURL(file);
  audio.hidden = true;
  audio.src = src;
  audio.load();
  audio.play();
  setAnalyser();
}

function setAnalyser() {
  // Set the audio analyzer
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  src = audioCtx.createMediaElementSource(audio);
  src.connect(analyser);
  analyser.fftSize = fft_size;
  analyser.connect(audioCtx.destination);
}

function generate() {
  // generate the stars
  for (let i = 0; i < stars_count; i++) {
    const star = {
      x: Math.random() * width,
      y: Math.random() * height,
      z: star_min_scale + Math.random() * (1 - star_min_scale),
    };
    stars.push(star);
  }
}

// Update each star before drawing
function update(audioData) {
  stars.forEach((star, index) => {
    if (audioData) {
      let newVelocity = audioData[index] / 10;
      if (newVelocity) stars_velocity = newVelocity;
    }
    star.x += Math.random() * stars_velocity;
    star.y += Math.random() * stars_velocity;
    // Get the stars that are out of the screen in the screen again
    if (star.x >= width) {
      star.x = Math.random();
    }
    if (star.y >= height) {
      star.y = Math.random();
    }
  });
}

function draw() {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineWidth = star_size * star.z * scale;
    ctx.strokeStyle = "rgba(255,255,255," + (0.5 + 0.5 * Math.random()) + ")";

    ctx.beginPath();
    ctx.moveTo(star.x, star.y);

    let tailX = stars_velocity * 2,
      tailY = stars_velocity * 2;

    // stroke() wont work on an invisible line
    if (Math.abs(tailX) < 0.1) tailX = 0.5;
    if (Math.abs(tailY) < 0.1) tailY = 0.5;

    ctx.lineTo(star.x + tailX, star.y + tailY);

    ctx.stroke();
    ctx.closePath();
  }
}

function render() {
  ctx.clearRect(0, 0, width, height);
  let audioData;
  if (analyser) {
    frqBits = analyser.frequencyBinCount;
    audioData = new Uint8Array(frqBits);
    analyser.getByteFrequencyData(audioData);
  }
  update(audioData);
  draw();
  requestAnimationFrame(render);
}

generate();
render();
