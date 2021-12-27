from flask import Flask, render_template
from flask import request
from flask_bootstrap import Bootstrap
import eventlet
import json
from flask_mqtt import Mqtt
from flask_socketio import SocketIO
from flask_cors import CORS, cross_origin
import ssl

eventlet.monkey_patch()

app = Flask(__name__)
app.config['SECRET'] = 'my secret key'
app.config['TEMPLATES_AUTO_RELOAD'] = False
# '1e6a0b36252045a4a733634a43802f8e.s1.eu.hivemq.cloud'
app.config['MQTT_BROKER_URL'] = 'c790603df7124c1da148ac9823fdbf48.s2.eu.hivemq.cloud'
app.config['MQTT_USERNAME'] = 'ArneD'  # 'pSoC1'
app.config['MQTT_PASSWORD'] = 'Star01Wars&hivemq'  # 'd9dBQJhV'
app.config['MQTT_KEEPALIVE'] = 5

# Parameters for SSL enabled
app.config['MQTT_BROKER_PORT'] = 8883
app.config['MQTT_TLS_ENABLED'] = True
app.config['MQTT_TLS_INSECURE'] = False
app.config['MQTT_TLS_CA_CERTS'] = 'server.pem'
app.config['MQTT_TLS_CA_CERTS'] = 'cacert.pem'
app.config['MQTT_TLS_CERTFILE'] = 'client.crt'
app.config['MQTT_TLS_KEYFILE'] = 'client.key'
app.config['CLIENT_ID'] = 'Flask'  # 'clientId-t56CYUwx9C'  # 'Rocky'

app.config['MQTT_TLS_VERSION'] = ssl.PROTOCOL_TLSv1_2

cors = CORS(app, resources={r"*": {"origins": "*"}})
mqtt = Mqtt(app)
# socketio = SocketIO(app)
bootstrap = Bootstrap(app)
socketio = SocketIO(app, cors_allowed_origins='*')
# socketio.init_app(app, cors_allowed_origins="*")


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/temp', methods=['POST'])
def receiveTemp():
    if request.method == 'POST':
        jsonObj = request.get_json(force=True)
        data = jsonObj["temp"]
        socketio.emit('httppost', data=data)
        return "good job"
    else:
        print("Error on post")
        return "bad job"


@ socketio.on('subscribe')
def handle_subscribe(json_str):
    data = json.loads(json_str)
    print("trying to subscribe: "+json_str)
    mqtt.subscribe(data['topic'])
    print("should be subscribed")


@ socketio.on('publish')
def handle_publish(json_str):
    data = json.loads(json_str)
    print("trying to publish: "+json_str)
    mqtt.publish(data['topic'], data['message'])
    print("should be published")


@ socketio.on('unsubscribe_all')
def handle_unsubscribe_all():
    mqtt.unsubscribe_all()


@ mqtt.on_message()
def handle_mqtt_message(client, userdata, message):
    data = dict(
        topic=message.topic,
        payload=message.payload.decode()
    )
    print("##########################   "+str(data["payload"]) +
          "   ###############################")
    socketio.emit('mqtt_message', data=data)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=80,
                 use_reloader=False, debug=True)
