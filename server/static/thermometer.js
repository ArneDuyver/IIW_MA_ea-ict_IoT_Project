var canvas = document.getElementById("thermometer");
var value1 = 25
var maximum = 50
var value = Math.floor(value1 / maximum);
var ctx = canvas.getContext("2d");
var hoogte = canvas.height * 0.9;
var ratio = canvas.width / 2;
var grad;
var lado;
ctx.translate(ratio, parseInt(hoogte - ratio));
ratio = ratio * 0.6;
hoogte = hoogte * 0.75;
var ancho = ratio / 2;
var ymin = ratio * 1.2;
var ymax = hoogte + ancho;
var yinc = (ymax - ymin) / 10;
var xx1 = 0;
var xxinc = parseInt(value1 / 50);
if (xxinc == 0) xxinc = 1;
var AA = setInterval(DrawThermo, 20);


socket.on('httppost', function (data) {
  if (!isNaN(Number(data))) {
    if (data >= 0 && data <= 50) {
      xx1 = 0;
      value1 = data;
      AA = setInterval(DrawThermo, 20);
    };
  };
});

function DrawThermo() {
  value = xx1 / maximum;
  ctx.fillStyle = '#fff';
  ctx.fillRect(-hoogte * 4, -hoogte * 4, hoogte * 8, hoogte * 8);
  DrawTube();
  DrawBall();
  xx1 += xxinc;
  if (xx1 > value1) {
    xx1 = value1;
    ctx.fillStyle = '#fff';
    ctx.fillRect(-hoogte * 4, -hoogte * 4, hoogte * 8, hoogte * 8);
    DrawTube();
    DrawBall();
    clearInterval(AA);
  };
};

function DrawTube() {
  var y1 = -(ymin + (yinc * 10 * value));

  //Draw Filled Tube
  grad = ctx.createLinearGradient(-ancho, 0, ancho, 0);
  grad.addColorStop(0, '#d00');
  grad.addColorStop(0.5, '#f40');
  grad.addColorStop(1, '#d00');
  ctx.fillStyle = grad;
  ctx.fillRect(-ancho, -ancho, ancho * 2, y1);

  //Draw Empty Tube
  grad = ctx.createLinearGradient(-ancho, 0, ancho, 0);
  grad.addColorStop(0, '#ddd');
  grad.addColorStop(0.5, '#fff');
  grad.addColorStop(1, '#ddd');
  ctx.fillStyle = grad;
  ctx.fillRect(-ancho, y1, ancho * 2, -(hoogte + ancho + y1));

  //Draw Cupula
  grad = ctx.createRadialGradient(ancho * 0.1, -(hoogte + ancho * 0.3), 0, ancho * 0.1, -(hoogte + ancho * 0.3), ancho * 1.8);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(1, '#ddd');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, -(hoogte + ancho), ancho, Math.PI, 2 * Math.PI);
  ctx.fill();
};

function DrawBall() {
  grad = ctx.createRadialGradient(ancho * 0.2, -ancho, 0, ancho * 0.2, -ancho, ratio * 1.1);
  grad.addColorStop(0, '#f40');
  grad.addColorStop(1, '#d00');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, ratio, 0, 2 * Math.PI);
  ctx.fill();

  // Edge of the Thermometer
  ctx.strokeStyle = "#333";
  ctx.strikeWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, ratio * 1.1, -0.31 * Math.PI, 1.3 * Math.PI);
  ctx.lineTo(-ancho * 1.2, -hoogte * 1.05);
  ctx.arc(0, -(ancho + hoogte), ancho * 1.2, Math.PI, 2 * Math.PI);
  ctx.lineTo(ancho * 1.2, -ancho * 1.9);
  ctx.closePath();
  ctx.stroke();

  // Measurement Marks
  var i = 0;
  var val2 = maximum / 10;
  var y = -ymin;
  for (i = 0; i <= 10; i++) {
    y = -(ymin + (yinc * i));
    ctx.strokeStyle = '#333';
    ctx.strikeWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-ancho * 1.2, y);
    ctx.lineTo(0, y);
    ctx.stroke();
    ctx.font = ratio * 0.32 + "px calibri";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = '#000';
    ctx.fillText(i * val2 + "°C", -ratio * 1.1, y);
  };

  // Write Value
  ctx.font = ratio * 0.8 + "px calibri";
  ctx.fillStyle = '#000';
  ctx.fillText(xx1 + "°C", 0, 0);
  ctx.fillText("Temp", 0, ratio * 1.6);
  //ctx.fillText("% Compl.", 0, ratio * 2.4);

};