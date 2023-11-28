//Firmware 1.0.3
let CONFIG = {
  deadband: 0.1,
  setpoint: 30,
  timeMs:500,
  sensor: 100,
  sensorMax: 102,
  sensorMin: 100,
  thermostat: 1,
  maxTemp: 150,
  minTemp: 0,
  input: true,
  temp0: 150,
  temp1: 150
};

let deviceInfo=Shelly.getDeviceInfo();
let deviceid=deviceInfo.id;
print ("Device ID: " + deviceid);
let setpointTopic = deviceid+"/TempSetpoint";
let deadbandTopic = deviceid+"/TempDeadband";
let sensorTopic = deviceid+"/TempSensor";
let thermostatTopic = deviceid+"/ThermostatControl";
let inputid= deviceid+ "/status/input:0/id";
let inputstate= deviceid+ "/status/input:0/state";
let outputTopic= deviceid+ "/status/switch:0/output";
let uptimeTopic=deviceid+"/uptime";
MQTT.publish(setpointTopic, JSON.stringify(CONFIG.setpoint),0,true);
MQTT.publish(deadbandTopic, JSON.stringify(CONFIG.deadband),0,true);
MQTT.publish(sensorTopic, JSON.stringify(CONFIG.sensor),0,true);
MQTT.publish(thermostatTopic, JSON.stringify(CONFIG.thermostat),0,true);
MQTT.publish(inputstate, JSON.stringify(!CONFIG.input),0,true);
function callback(userdata) {
  Shelly.call("temperature.getStatus",{ id: CONFIG.sensor },function (response) {
    let temp=(response.tF);
    Shelly.call("Input.GetStatus",{id:0},function (val) {
      state=val.state;
      CONFIG.input=(state);
      MQTT.publish(inputstate, JSON.stringify(state),0,true);
    });
    if (CONFIG.sensor==100){
      let tid1=101;
      let tid2=102;
    }
    else if (CONFIG.sensor==101){
      let tid1=100;
      let tid2=102;
    }
    else if (CONFIG.sensor==102){
      let tid1=100;
      let tid2=101;
    }
    Shelly.call("temperature.getStatus",{ id: tid1 },function (response) {
      CONFIG.temp0=(response.tF);
      },null);
    Shelly.call("temperature.getStatus",{ id: tid2},function (response) {
      CONFIG.temp1=(response.tF);
      },null);

    if (MQTT.isConnected()){
      if (CONFIG.thermostat && CONFIG.input){    
        if (temp < CONFIG.setpoint || temp<CONFIG.minTemp){
          Shelly.call("Switch.Set",{ id: 0, on: false });
          MQTT.publish(outputTopic, JSON.stringify(false),0,true);
          print ("Turn Off: " + JSON.stringify(temp));} 
        else if (temp > (CONFIG.setpoint-CONFIG.deadband)){
          Shelly.call("Switch.Set",{ id: 0, on: true });
          MQTT.publish(outputTopic, JSON.stringify(true),0,true);
          print ("Turn On: " + JSON.stringify(temp));}
        else{
          print ("Do Nothing: " + JSON.stringify(temp));}}
      else{
         Shelly.call("Switch.Set",{ id: 0, on: false });
         MQTT.publish(outputTopic, JSON.stringify(false),0,true);
         }}
    else{
      Shelly.call("Switch.Set",{ id: 0, on: false });
      MQTT.publish(outputTopic, JSON.stringify(false),0,true);
      }
  },null);
  let uptime = Shelly.getComponentStatus("sys").uptime;
  MQTT.publish(uptimeTopic, JSON.stringify(uptime), 0, true);   
}

function mqttsetpoint(topic, message, userdata) {
  try {
    CONFIG.setpoint = JSON.parse(message);
    print("Setpoint: " + message);
  } catch (error) {
    // Handle the JSON parsing error here
    print("Error parsing JSON for setpoint: " + error.message);
  }
}

function mqttdeadband(topic, message, userdata) {
  try {
    CONFIG.deadband = JSON.parse(message);
    print("Deadband: " + message);
  } catch (error) {
    // Handle the JSON parsing error here
    print("Error parsing JSON for deadband: " + error.message);
  }
}

function mqttsensor(topic, message, userdata){
   try {
    let sensor=JSON.parse(message);
    if (sensor>CONFIG.sensorMax){
    CONFIG.sensor=CONFIG.sensorMax;}
    else if (sensor<CONFIG.sensorMin){
    CONFIG.sensor=CONFIG.sensorMin;}
    else{
    CONFIG.sensor=sensor;}
    print ("Sensor: "+message);
   } catch (error) {
      // Handle the JSON parsing error here
    print("Error parsing JSON for thermostat: " + error.message);
  }
}

function mqttthermostat(topic, message, userdata){
  try {
    CONFIG.thermostat=JSON.parse(message);
    print ("Thermostat: "+message);
  } catch (error) {
    // Handle the JSON parsing error here
    print("Error parsing JSON for thermostat: " + error.message);
  }
}




MQTT.subscribe(setpointTopic, mqttsetpoint);
MQTT.subscribe(deadbandTopic, mqttdeadband);
MQTT.subscribe(sensorTopic, mqttsensor);
MQTT.subscribe(thermostatTopic, mqttthermostat);

let time_handle=Timer.set(CONFIG.timeMs,true,callback,null);
