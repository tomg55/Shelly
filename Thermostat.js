let CONFIG = {
  deadband: 0.1,
  setpoint: 70,
  timeMs:1000,
  sensor: 100,
  sensorMax: 102,
  sensorMin: 100,
  thermostat: 1,
  maxTemp: 105,
  input: true
};

let deviceInfo=Shelly.getDeviceInfo();
let deviceid=deviceInfo.id;
print ("Device ID: "deviceid);
MQTT.publish(deviceid+"/TempSetpoint", JSON.stringify(CONFIG.setpoint),0,true);
MQTT.publish(deviceid+"/TempDeadband", JSON.stringify(CONFIG.deadband),0,true);
MQTT.publish(deviceid+"/TempSensor", JSON.stringify(CONFIG.sensor),0,true);
MQTT.publish(deviceid+"/ThermostatControl", JSON.stringify(CONFIG.thermostat),0,true);

function callback(userdata) {
  Shelly.call("temperature.getStatus",{ id: CONFIG.sensor },function (response) {
    let temp=(response.tF);
    Shelly.call("Input.GetStatus",{id:0},function (val) {
    CONFIG.input=(val.state);});
    if (MQTT.isConnected()){
      if (CONFIG.thermostat && CONFIG.input){
        if (temp > CONFIG.setpoint || temp>CONFIG.maxTemp){
          Shelly.call("Switch.Set",{ id: 0, on: false });
          print ("Turn Off: " + JSON.stringify(temp));} 
        else if (temp < (CONFIG.setpoint-CONFIG.deadband)){
          Shelly.call("Switch.Set",{ id: 0, on: true });
          print ("Turn On: " + JSON.stringify(temp));}
        else{
          print ("Do Nothing: " + JSON.stringify(temp));}}
      else{
         print ("Thermostat OFF");
         Shelly.call("Switch.Set",{ id: 0, on: false });}}
    else{
      print ("MQTT LOST CONNECTION");
      Shelly.call("Switch.Set",{ id: 0, on: false });}
   },
null
);

}

function mqttsetpoint(topic, message, userdata){
CONFIG.setpoint=JSON.parse(message);
print ("Setpoint: "+message);
}

function mqttdeadband(topic, message, userdata){
CONFIG.deadband=JSON.parse(message);
print ("Deadband: "+message);
}

function mqttsensor(topic, message, userdata){
let sensor=JSON.parse(message);
if (sensor>CONFIG.sensorMax){
CONFIG.sensor=CONFIG.sensorMax;}
else if (sensor<CONFIG.sensorMin){
CONFIG.sensor=CONFIG.sensorMin;}
else{
CONFIG.sensor=sensor;}
print ("Sensor: "+message);
}

function mqttthermostat(topic, message, userdata){
CONFIG.thermostat=JSON.parse(message);
print ("Thermostat: "+message);
}



MQTT.subscribe(deviceid+"/TempSetpoint", mqttsetpoint);
MQTT.subscribe(deviceid+"/TempDeadband", mqttdeadband);
MQTT.subscribe(deviceid+"/TempSensor", mqttsensor);
MQTT.subscribe(deviceid+"/ThermostatControl", mqttthermostat);

let time_handle=Timer.set(CONFIG.timeMs,true,callback,null);
