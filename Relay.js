//Firmware 1.0.3

let CONFIG = {
  input: true,
  timeMs: 500,
  state: true
};
let deviceInfo=Shelly.getDeviceInfo();
let deviceid=deviceInfo.id;
let uptimeTopic = deviceid+"/uptime";
let switchOn = deviceid+"/switchOn";
let inputstate= deviceid+ "/status/input:0/state";
MQTT.publish(inputstate, JSON.stringify(!CONFIG.input),0,true);
print (deviceid);
function callback(userdata) {
    Shelly.call("Input.GetStatus",{id:0},function (val) {
      CONFIG.input=(val.state)
      MQTT.publish(inputstate, JSON.stringify(CONFIG.input),0,true);
    });
   if (CONFIG.input){ 
      Shelly.call("Switch.Set",{ id: 0, on: CONFIG.state });
    }
   else{
      Shelly.call("Switch.Set",{ id: 0, on: false });
   }
   let uptime = Shelly.getComponentStatus("sys").uptime;
   MQTT.publish(uptimeTopic, JSON.stringify(uptime), 0, true);
   
}



function mqtton(topic, message, userdata){
   try {
     let value=JSON.parse(message);
     if (value ===1){
     CONFIG.state=true;}
     else{
     CONFIG.state=false;}
     print(JSON.parse(message));
   } catch (error) {
    // Handle the JSON parsing error here
    print("Error parsing JSON for SwitchOn: " + error.message);
  }
  }
MQTT.subscribe(switchOn, mqtton);
let time_handle=Timer.set(CONFIG.timeMs,true,callback,null);
