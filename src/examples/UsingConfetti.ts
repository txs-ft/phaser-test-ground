import * as Confetti from 'canvas-confetti';

const confettiCanvas = document.createElement("canvas");
confettiCanvas.style.position = "relative";
confettiCanvas.style.zIndex = "10000";
document.body.append(confettiCanvas);

const boom = Confetti.create(confettiCanvas, {
  resize: false,
  useWorker: true
});

boom({
  particleCount: 50,
  zIndex: 2000
});