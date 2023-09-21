//Firmware 1.0.3

let CONFIG = {
  input: true,
  timeMs: 1000,
  state: true
};
let deviceInfo=Shelly.getDeviceInfo();
let deviceid="shellyplusrelay";//deviceInfo.id;
let switchOn = deviceid+"/switchOn";
let inputid= deviceid+ "/status/input:0/id";
let inputstate= deviceid+ "/status/input:0/state";
let uptimeTopic=deviceid+"/uptime";
print (deviceid);
function callback(userdata) {
  Shelly.call("Input.GetStatus",{id:0},function (val) {
    if (val.state!= CONFIG.input){
      CONFIG.input=(val.state);
      if (CONFIG.input){
       Shelly.call("Switch.Set",{ id:0, on:CONFIG.state});
      }
      else{
        Shelly.call("Switch.Set",{ id:0, on:false});}
    }
  });
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
     
     if (CONFIG.input){ 
        if (CONFIG.state){
          Shelly.call("Switch.Set",{ id:0, on:true});}
        else{
          Shelly.call("Switch.Set",{ id:0, on:false});}
      }
      else{
        Shelly.call("Switch.Set",{ id:0, on:false});}
        
        
     print(JSON.parse(message));
   } catch (error) {
    // Handle the JSON parsing error here
    print("Error parsing JSON for SwitchOn: " + error.message);
  }
}
  
MQTT.subscribe(switchOn, mqtton);


let time_handle=Timer.set(CONFIG.timeMs,true,callback,null);
