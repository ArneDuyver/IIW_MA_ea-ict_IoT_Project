/* REFRESH USING CTRL+F5 */
//var socket = io.connect('http://' + document.domain + ':' + location.port, { secure: true });
var socket = io.connect('http://' + document.domain + ':' + location.port);

$(document).ready(function () {
  console.log("[MAIN] " + "Page loaded");
  document.getElementById("div_manual").style.pointerEvents = "none";
  document.getElementById("div_manual").style.opacity = 0.3;
  socket.emit('subscribe', json_str = '{"topic":"test","message":"msg"}');
  socket.emit('subscribe', json_str = '{"topic":"mode","message":"msg"}');
  socket.emit('subscribe', json_str = '{"topic":"gassensor","message":"msg"}');
  $('#pub_btn').click(function (event) {
    socket.emit('publish', json_str = '{"topic":"test","message":"msg"}');
    console.log("Pub button pressed")
  });

  //Servo knob
  var myKnob = pureknob.createKnob(300, 300);
  myKnob.setProperty('angleStart', -Math.PI / 2);
  myKnob.setProperty('angleEnd', Math.PI / 2);
  //myKnob.setProperty('angleOffset', 0);
  myKnob.setProperty('colorFG', '#FFF');
  //myKnob.setProperty('colorLabel', '#FFF');
  //myKnob.setProperty('label', 'Door');
  //myKnob.setProperty('val', 45);
  myKnob.setProperty('valMin', 0);
  myKnob.setProperty('valMax', 90);
  myKnob.setValue(50);

  var node = myKnob.node();
  var elem = document.getElementById('knob');
  elem.appendChild(node);

  var listener = function (knob, value) {
    var data = '{"topic": "servo", "message": ' + value + ', "qos": 1}';
    socket.emit('publish', data = data);
  };

  myKnob.addListener(listener);
});


var btn = document.getElementById("btn");
var autoManLabel = document.getElementById("autoManLabel");

function toggleBtn() {
  btn.classList.toggle("active")
  if (autoManLabel.innerHTML == "Manual") {
    autoManLabel.innerHTML = "Automatic"
    document.getElementById("div_manual").style.pointerEvents = "none";
    document.getElementById("div_manual").style.opacity = 0.3;
  } else {
    autoManLabel.innerHTML = "Manual"
    document.getElementById("div_manual").style.pointerEvents = "auto";
    document.getElementById("div_manual").style.opacity = 1.0;
  }
  message = autoManLabel.innerHTML.toLowerCase();
  var data = '{"topic": "mode", "message": "' + message + '", "qos": 1}';
  socket.emit('publish', data = data);
}

socket.on('mqtt_message', function (data) {
  if (data['topic'] == "mode") {
    if (autoManLabel.innerHTML.toLowerCase() != data['payload'].toLowerCase() &&
      (data['payload'].toLowerCase() == "manual" || data['payload'].toLowerCase() == "automatic")) {
      toggleBtn();
    };
  }
});


