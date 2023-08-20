 let CONFIG = {
  input: null,
  timeMs: 500,
  state: true
};
let deviceInfo=Shelly.getDeviceInfo();
let deviceid=deviceInfo.id;
let uptimeTopic = deviceid+"/uptime";
let switchOn = deviceid+"/switchOn";


print (deviceid);
function callback(userdata) {
   Shelly.call("Input.GetStatus",{id:0},function (val) {CONFIG.input=(val.state);});
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
   let value=JSON.parse(message);
   if (value ===1){
   CONFIG.state=true;}
   else{
   CONFIG.state=false;}
   print(JSON.parse(message));
  }



MQTT.subscribe(switchOn, mqtton);


let time_handle=Timer.set(CONFIG.timeMs,true,callback,null);
