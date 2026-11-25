/* eslint-disable */
/* StudyOS flame mascot — action library for flame_rig.js
   Each action is keyframes {p:pose,d:ms,e:easing}. Numbers glide (easing); anything not given
   returns to neutral. loop:0 actions hold their last pose, so sit → stand up blends naturally. */
(function(G){
const m=(...o)=>Object.assign({},...o),rep=(n,a)=>Array.from({length:n},()=>a).flat();
const HU={lhx:-62,lhy:-114,rhx:62,rhy:-114},HV={lhx:-82,lhy:-100,rhx:82,rhy:-100},FACEH={lhx:-24,lhy:-74,rhx:24,rhy:-74};
const SIT={y:28,sx:1.05,sy:.94,lfx:-26,rfx:26,lhx:-50,lhy:-10,rhx:50,rhy:-10};
const CROUCH={y:13,sx:1.09,sy:.9,lfx:-4,rfx:4,lhx:-56,lhy:-22,rhx:56,rhy:-22};
const LIE={x:50,y:-23,rot:-90,fa:1,tilt:18,lhx:-40,lhy:-6,rhx:22,rhy:-22};
const g=(gait,flip,x,d,o)=>({p:m({gait,view:'q',flip,x},o||{}),d,e:'lin'});
const turnTo=(flip,x,o)=>[{p:m({view:'front',x,sy:.97,sx:1.03},o||{}),d:150,e:'out'},{p:m({view:'q',flip,x},o||{}),d:150,e:'out'}];
const travel=(gait,d,o)=>({loop:1,k:[{p:m({view:'q',flip:1,x:-70},o),d:500},g(gait,1,70,d,o),...turnTo(-1,70,o),g(gait,-1,-70,d,o),...turnTo(1,-70,o)]});
const hopK=(o)=>[{p:m({y:6,sx:1.07,sy:.93},o),d:110,e:'out'},{p:m({y:-22,sx:.93,sy:1.08,fa:.55,lhx:-68,lhy:-74,rhx:68,rhy:-74},o),d:170,e:'out'},{p:m({y:-2,fa:0,sx:.97,sy:1.04},o),d:150,e:'in'},{p:m({y:5,sx:1.09,sy:.91},o),d:90,e:'out'}];
const A={
/* ---- A. full-body movement ---- */
idle:{loop:1,k:[{p:{},d:1600,e:'inout'},{p:{rot:1.5,lfy:0,rhx:60,lhx:-56},d:1400,e:'inout'},{p:{rot:-1.5,look:-.6},d:1400,e:'inout'},{p:{look:.4},d:1200,e:'inout'}]},
walk:travel('walk',3000,{}),
run:travel('run',1100,{mouth:'open',heat:.4,hair:1.15}),
tiptoe:travel('tiptoe',5200,{lhx:-30,lhy:-60,rhx:30,rhy:-58,brows:'up',mouth:'o',look:.6}),
skip:travel('skip',2100,{eyes:'happy',mouth:'big',hair:1.2}),
jump:{loop:1,k:[{p:{},d:500},
  {p:m(CROUCH,{y:16,sx:1.15,sy:.85,lhx:-64,lhy:-6,rhx:64,rhy:-6,squint:.4}),d:280,e:'out'},          // anticipation
  {p:{y:-42,sx:.88,sy:1.17,fa:.7,lhx:-60,lhy:-112,rhx:60,rhy:-112,mouth:'open'},d:160,e:'out'},       // launch + stretch
  {p:{y:-78,sx:.99,sy:1.03,fa:.95,lhx:-80,lhy:-100,rhx:80,rhy:-100,eyes:'happy',mouth:'big',hair:1.3},d:250,e:'out'}, // apex
  {p:{y:-28,sx:.94,sy:1.1,fa:.6,lhx:-70,lhy:-84,rhx:70,rhy:-84,mouth:'o'},d:210,e:'in'},             // fall
  {p:{y:14,sx:1.2,sy:.8,fa:0,lhx:-62,lhy:-14,rhx:62,rhy:-14,eyes:'happy'},d:90,e:'out'},             // land compress
  {p:{eyes:'happy',mouth:'smile'},d:420,e:'back'},{p:{},d:600}]},
hop:{loop:1,k:[{p:{},d:300},...rep(3,hopK({eyes:'happy',mouth:'open'})),{p:{eyes:'happy'},d:400,e:'back'},{p:{},d:500}]},
turnLeft:{loop:1,k:[{p:{sx:1.04,sy:.96},d:120,e:'out'},{p:{view:'q',flip:-1,look:-.5},d:160,e:'out'},{p:{view:'side',flip:-1},d:900,e:'out'},{p:{view:'q',flip:-1},d:160},{p:{},d:900,e:'out'}]},
turnRight:{loop:1,k:[{p:{sx:1.04,sy:.96},d:120,e:'out'},{p:{view:'q',flip:1,look:.5},d:160,e:'out'},{p:{view:'side',flip:1},d:900,e:'out'},{p:{view:'q',flip:1},d:160},{p:{},d:900,e:'out'}]},
turnAround:{loop:1,k:[{p:{sx:1.04,sy:.96},d:120},{p:{view:'q'},d:130},{p:{view:'side'},d:130},{p:{view:'back'},d:700,e:'out'},{p:{view:'side',flip:-1},d:130},{p:{view:'q',flip:-1},d:130},{p:{eyes:'happy',mouth:'open'},d:500,e:'back'},{p:{},d:700}]},
sit:{loop:0,k:[{p:m(CROUCH,{squint:.3}),d:380,e:'inout'},{p:m(SIT,{sy:.9,sx:1.09}),d:420,e:'out'},{p:SIT,d:300,e:'back'},{p:m(SIT,{look:-.8}),d:1200,e:'inout'},{p:m(SIT,{look:.6}),d:1200,e:'inout'},{p:SIT,d:600}]},
standUp:{loop:0,k:[{p:SIT,d:350},{p:m(SIT,{rot:0,sy:.88,sx:1.1,lhx:-60,lhy:-6,rhx:60,rhy:-6}),d:250,e:'out'},{p:{y:-4,sx:.95,sy:1.06,lhx:-60,lhy:-40,rhx:60,rhy:-40},d:380,e:'out'},{p:{},d:400,e:'back'}]},
crouch:{loop:0,k:[{p:{sy:1.03},d:120},{p:m(CROUCH,{look:.4,lookY:.6}),d:420,e:'out'},{p:m(CROUCH,{look:-.4,lookY:.6}),d:1400,e:'inout'}]},
lieDown:{loop:0,k:[{p:CROUCH,d:400},{p:SIT,d:450,e:'out'},{p:{x:22,y:8,rot:-48,fa:.5,lhx:-62,lhy:-4,rhx:40,rhy:-30,sy:.95},d:420,e:'inout'},{p:m(LIE,{sx:1.05,sy:.93}),d:380,e:'out'},{p:LIE,d:400,e:'back'},{p:LIE,d:1000}]},
getUp:{loop:0,k:[{p:LIE,d:400},{p:m(LIE,{sy:.95,sx:1.05,lhx:-60,lhy:-6}),d:250},{p:{x:22,y:8,rot:-48,fa:.5,lhx:-62,lhy:-4,rhx:40,rhy:-30},d:420,e:'out'},{p:SIT,d:420,e:'out'},{p:CROUCH,d:300,e:'inout'},{p:{y:-4,sy:1.06,sx:.95},d:300,e:'out'},{p:{},d:400,e:'back'}]},
/* ---- B. sleeping sequence (one continuous story) ---- */
sleep:{loop:1,k:[
  {p:{squint:.75},d:600,e:'inout'},{p:{squint:.1},d:400,e:'inout'},{p:{squint:.85},d:700,e:'inout'},{p:{squint:.4},d:400,e:'inout'},       // 1 slow blinks
  {p:m(HU,{eyes:'closed',mouth:'yawn',sy:1.1,sx:.94,hair:.85}),d:800,e:'out'},{p:m(HU,{eyes:'closed',mouth:'yawn',sy:1.12,sx:.93,rot:4}),d:600},{p:{squint:.7,hair:.8},d:500,e:'inout'}, // 2 yawn + stretch
  {p:m(CROUCH,{squint:.8,hair:.75}),d:600,e:'inout'},{p:m(SIT,{squint:.85,hair:.7}),d:700,e:'out'},                                         // 3 lower body
  {p:{x:22,y:8,rot:-48,fa:.5,lhx:-62,lhy:-4,rhx:40,rhy:-30,squint:.9,hair:.65},d:600,e:'inout'},{p:m(LIE,{sx:1.05,sy:.93,squint:.9}),d:500,e:'out'},{p:m(LIE,{squint:.95}),d:400,e:'back'}, // 4 lie on side
  {p:m(LIE,{eyes:'closed',hair:.5}),d:700,e:'inout'},                                                                                         // 5 close eyes
  ...rep(3,[{p:m(LIE,{eyes:'closed',mouth:'o',hair:.45,sx:1.04,sy:.95,extra:'z'}),d:1500,e:'inout'},{p:m(LIE,{eyes:'closed',mouth:'smile',hair:.4,extra:'z'}),d:1500,e:'inout'}]), // 6–7 breathe + Z
  {p:m(LIE,{squint:.85,hair:.6}),d:700,e:'inout'},{p:m(LIE,{squint:.4,hair:.75}),d:500,e:'inout'},                                            // 8 wake gradually
  {p:{x:22,y:8,rot:-48,fa:.5,lhx:-62,lhy:-4,rhx:40,rhy:-30},d:450,e:'out'},{p:m(SIT,{look:-1.4,hair:.85}),d:700,e:'inout'},{p:m(SIT,{look:1.4}),d:800,e:'inout'},{p:m(SIT,{look:0,eyes:'wide',brows:'up'}),d:300}, // 9 look around
  {p:m(SIT,HU,{eyes:'closed',mouth:'o',sy:1.04}),d:800,e:'out'},{p:m(CROUCH,{eyes:'happy'}),d:350,e:'inout'},{p:{y:-4,sy:1.06,sx:.95,eyes:'happy'},d:300,e:'out'},{p:m(HU,{eyes:'happy',mouth:'big',hair:1.2}),d:500,e:'back'},{p:{},d:900,e:'inout'}]}, // 10 stretch, stand
/* ---- C. emotions with full body ---- */
cry:{loop:1,k:rep(3,[{p:m({lhx:-40,lhy:-56,rhx:40,rhy:-50},{lookY:1,tilt:-6,y:5,sy:.95,mouth:'wobble',brows:'sad',extra:'tears',hair:.5}),d:300,e:'inout'},{p:m({lhx:-40,lhy:-56,rhx:40,rhy:-50},{lhy:-70,rhy:-70,lookY:1,tilt:-6,y:3,sy:.98,mouth:'wobble',brows:'sad',extra:'tears',hair:.45}),d:300,e:'inout'}])},
laugh:{loop:1,k:rep(2,[{p:{y:-7,sy:1.05,sx:.97,tilt:9,rot:-3,lhx:-46,lhy:-44,rhx:46,rhy:-30,mouth:'big',hair:1.25},d:150,e:'out'},{p:{y:2,sy:.95,sx:1.04,tilt:6,rot:-2,lhx:-50,lhy:-34,rhx:50,rhy:-42,mouth:'big',hair:1.15},d:140,e:'in'}]).concat([{p:{tilt:-8,rot:3,y:-5,mouth:'big',lhx:-30,lhy:-26,rhx:30,rhy:-26},d:200,e:'out'},{p:{tilt:-6,y:2,mouth:'big',lhx:-30,lhy:-20,rhx:30,rhy:-20},d:160,e:'in'}])},
embarrassed:{loop:1,k:[{p:m({lhx:-36,lhy:-50,rhx:36,rhy:-50},{lookY:1,look:-1,tilt:-10,blush:1,squint:.4,mouth:'wobble',rot:-3,lfa:0,rfy:2,hair:.75}),d:700,e:'inout'},{p:m({lhx:-36,lhy:-50,rhx:36,rhy:-50},{lhy:-80,rhy:-80,lookY:1,look:-.6,tilt:-8,blush:1,squint:.4,mouth:'wobble',rot:3,rfy:0,lfy:2,hair:.7}),d:700,e:'inout'}]},
angry:{loop:1,k:[{p:{lhx:18,lhy:-46,rhx:-18,rhy:-50,mouth:'flat',heat:1,hair:1.4,extra:'steam',sx:1.04,sy:.98,shake:.5,rfy:6,rfa:-15,tilt:-4},d:180,e:'out'},{p:{lhx:18,lhy:-46,rhx:-18,rhy:-50,mouth:'flat',heat:1.1,hair:1.5,extra:'steam',sx:1.05,sy:.97,shake:.5,rfy:0,tilt:-4},d:180,e:'in'}]},
excited:{loop:1,k:rep(2,[...hopK({mouth:'big',hair:1.5,extra:'spark',lhx:-84,lhy:-100,rhx:70,rhy:-120}),{p:{mouth:'big',hair:1.45,extra:'spark',lhx:-70,lhy:-120,rhx:84,rhy:-100},d:120,e:'inout'}])},
confused:{loop:1,k:[{p:{tilt:14,rot:3,look:-1,lookY:-.5,mouth:'flat',brows:'up',extra:'q',rhx:58,rhy:-120},d:600,e:'inout'},{p:{tilt:14,rot:3,look:-1,mouth:'flat',brows:'up',extra:'q',rhx:52,rhy:-114},d:200},{p:{tilt:14,rot:3,look:-1,mouth:'flat',brows:'up',extra:'q',rhx:58,rhy:-120},d:200},{p:{tilt:-14,rot:-3,look:1.2,mouth:'wobble',extra:'q',lhx:-58,lhy:-120},d:700,e:'inout'},{p:{tilt:-14,rot:-3,look:1.2,mouth:'wobble',extra:'q',lhx:-52,lhy:-116},d:500,e:'inout'},{p:{look:0},d:400}]},
scared:{loop:1,k:[{p:{},d:400},{p:{y:-12,mouth:'o',extra:'bang',hair:1.5,lhx:-66,lhy:-90,rhx:66,rhy:-90},d:160,e:'out'},{p:{x:-30,rot:-9,mouth:'wobble',hair:.6,shake:1,lhx:-26,lhy:-62,rhx:26,rhy:-60,lfx:-6,rfx:-4,rfy:3},d:500,e:'out'},{p:{x:-40,rot:-8,mouth:'wobble',hair:.55,shake:1.1,lhx:-24,lhy:-66,rhx:24,rhy:-64},d:1400,e:'inout'},{p:{x:0},d:900,e:'inout'}]},
sad:{loop:1,k:[{p:{lookY:1.1,tilt:-6,y:4,sy:.93,sx:1.03,lhx:-52,lhy:-18,rhx:52,rhy:-18,mouth:'frown',brows:'sad',hair:.5,rot:-2},d:1800,e:'inout'},{p:{lookY:1,tilt:-4,y:3,sy:.95,sx:1.02,lhx:-53,lhy:-16,rhx:53,rhy:-16,mouth:'frown',brows:'sad',hair:.45,rot:2,look:-.4},d:1800,e:'inout'}]},
proud:{loop:1,k:[{p:{sy:.97},d:200},{p:{sy:1.07,sx:1.03,y:-3,rot:-3,tilt:7,lhx:-38,lhy:-26,rhx:38,rhy:-26,mouth:'smile',hair:1.35,lfx:-6,rfx:6},d:500,e:'back'},{p:{sy:1.06,sx:1.03,y:-3,rot:-3,tilt:7,lhx:-38,lhy:-26,rhx:38,rhy:-26,mouth:'smile',hair:1.4,lfx:-6,rfx:6},d:1800,e:'inout'}]},
curious:{loop:1,k:[{p:{look:1.4,lookY:.4,eyes:'wide',rot:10,y:4,x:12,tilt:6,rhx:34,rhy:-42,lhx:-54,lhy:-30,mouth:'o'},d:1100,e:'inout'},{p:{look:1.4,lookY:.8,eyes:'wide',rot:13,y:6,x:20,tilt:10,rhx:32,rhy:-40,mouth:'o'},d:1200,e:'inout'},{p:{look:1,eyes:'open',rot:4,x:10,mouth:'smile',rhx:34,rhy:-42,brows:'up'},d:700,e:'inout'},{p:{},d:800,e:'inout'}]},
/* ---- D. everyday activities ---- */
read:{loop:1,k:[{p:m(SIT,{prop:'book',lhx:-32,lhy:-40,rhx:32,rhy:-40,lookY:1,look:-1}),d:800,e:'inout'},{p:m(SIT,{prop:'book',lhx:-32,lhy:-40,rhx:32,rhy:-40,lookY:1,look:-1}),d:900},{p:m(SIT,{prop:'book',lhx:-32,lhy:-40,rhx:32,rhy:-40,lookY:1,look:1}),d:1500,e:'inout'},{p:m(SIT,{prop:'book',lhx:-32,lhy:-40,rhx:-6,rhy:-50,lookY:1,look:.4}),d:300,e:'out'},{p:m(SIT,{prop:'book',lhx:-32,lhy:-40,rhx:32,rhy:-40,lookY:1,look:-1,eyes:'happy',mouth:'open'}),d:500,e:'out'}]},
write:{loop:1,k:[{p:{prop:'notebook',lhx:-28,lhy:-30,rhx:6,rhy:-38,lookY:1,look:-.4,tilt:-4,mouth:'flat'},d:600,e:'inout'},...rep(4,[{p:{prop:'notebook',lhx:-28,lhy:-30,rhx:12,rhy:-40,lookY:1,look:-.4,tilt:-4,mouth:'flat'},d:150,e:'inout'},{p:{prop:'notebook',lhx:-28,lhy:-30,rhx:4,rhy:-34,lookY:1,look:-.6,tilt:-4,mouth:'flat'},d:150,e:'inout'}]),{p:{prop:'notebook',lhx:-28,lhy:-30,rhx:20,rhy:-74,lookY:0,eyes:'happy',mouth:'smile',tilt:4},d:600,e:'back'}]},
laptop:{loop:1,k:[{p:m(SIT,{scene:'laptop',lhx:-20,lhy:-38,rhx:20,rhy:-38,lookY:.8,mouth:'flat'}),d:600,e:'inout'},...rep(6,[{p:m(SIT,{scene:'laptop',lhx:-20,lhy:-44,rhx:20,rhy:-36,lookY:.8,mouth:'flat'}),d:110},{p:m(SIT,{scene:'laptop',lhx:-20,lhy:-36,rhx:20,rhy:-44,lookY:.8,mouth:'flat'}),d:110}]),{p:m(SIT,{scene:'laptop',lhx:-20,lhy:-38,rhx:20,rhy:-38,lookY:.8,eyes:'happy',mouth:'open',tilt:6}),d:700,e:'back'}]},
explore:{loop:1,k:[{p:{view:'q',flip:1,x:-60},d:500},g('walk',1,40,2200),{p:{view:'q',flip:1,x:40,rot:12,y:5,look:1.4,lookY:.8,eyes:'wide',tilt:8,rhx:22,rhy:-56},d:600,e:'out'},{p:{view:'q',flip:1,x:40,rot:12,y:5,look:1.4,lookY:.8,eyes:'wide',tilt:8,rhx:22,rhy:-56,mouth:'o'},d:1100},
  ...turnTo(-1,40),g('walk',-1,-40,1800),{p:{view:'q',flip:-1,x:-40,lookY:-1.2,look:.6,tilt:-6,brows:'up',mouth:'o'},d:700,e:'out'},{p:{view:'q',flip:-1,x:-40,lookY:-1.2,look:1,eyes:'happy',mouth:'open',rhx:70,rhy:-108},d:1000},...turnTo(1,-60)]},
ball:{loop:1,k:[{p:{ball:1,ballY:110,lhx:-16,lhy:-52,rhx:16,rhy:-52,lookY:.6},d:500,e:'out'},
  {p:{ball:1,ballY:118,y:8,sx:1.06,sy:.94,lhx:-16,lhy:-44,rhx:16,rhy:-44,lookY:.4},d:220,e:'out'},                         // anticipation
  {p:{ball:1,ballY:-40,y:-3,sy:1.05,lhx:-30,lhy:-112,rhx:30,rhy:-112,lookY:-1.2,mouth:'open'},d:520,e:'out'},          // toss
  {p:{ball:1,ballY:28,lookY:-1.2,lhx:-40,lhy:-90,rhx:40,rhy:-90,eyes:'wide',mouth:'o'},d:420,e:'in'},                   // falls on head
  {p:{ball:1,ballY:-10,y:5,sy:.9,sx:1.08,eyes:'closed',mouth:'grin',lookY:-1},d:330,e:'out'},                          // bounce off
  {p:{ball:1,ballY:110,lhx:-16,lhy:-52,rhx:16,rhy:-52,eyes:'happy',mouth:'big',lookY:.4},d:420,e:'in'},                // catch
  {p:{ball:1,ballY:110,lhx:-16,lhy:-52,rhx:16,rhy:-52,eyes:'happy',mouth:'smile'},d:500}]},
clap:{loop:1,k:rep(4,[{p:{lhx:-34,lhy:-58,rhx:34,rhy:-58,eyes:'happy',mouth:'open',y:-2},d:130,e:'out'},{p:{lhx:-6,lhy:-54,rhx:6,rhy:-38,eyes:'happy',mouth:'big',y:1,sy:.98},d:100,e:'in'}]).concat([{p:{lhx:-34,lhy:-58,rhx:34,rhy:-58,eyes:'happy',mouth:'big'},d:500,e:'out'}])},
highFive:{loop:1,k:[{p:{},d:500},{p:{fh:.6,look:1.2,eyes:'wide',mouth:'o'},d:500,e:'out'},{p:{fh:.75,look:1.2,rhx:66,rhy:-112,rot:2,mouth:'open',sy:.96},d:400,e:'back'},{p:{fh:.75,rhx:56,rhy:-104,rot:-2,y:4,sy:.94,look:1.2,mouth:'open'},d:160,e:'out'},
  {p:{fh:1,rhx:84,rhy:-112,rot:8,x:6,eyes:'happy',mouth:'big',extra:'spark',hair:1.4},d:110,e:'in'},{p:{fh:.8,rhx:72,rhy:-118,rot:3,eyes:'happy',mouth:'big',extra:'spark',hair:1.3},d:400,e:'out'},{p:{fh:0,eyes:'happy',mouth:'smile'},d:700,e:'inout'}]},
dance:{loop:1,k:rep(2,[{p:{rot:-10,y:-2,lhx:-70,lhy:-112,rhx:56,rhy:-24,lfy:8,lfa:-10,mouth:'grin',tilt:-6,extra:'notes',hair:1.25},d:280,e:'inout'},{p:{rot:0,y:5,sx:1.05,sy:.95,lhx:-60,lhy:-60,rhx:60,rhy:-60,mouth:'grin',extra:'notes'},d:200,e:'out'},{p:{rot:10,y:-2,lhx:-56,lhy:-24,rhx:70,rhy:-112,rfy:8,rfa:10,mouth:'grin',tilt:6,extra:'notes',hair:1.25},d:280,e:'inout'},{p:{rot:0,y:5,sx:1.05,sy:.95,lhx:-60,lhy:-60,rhx:60,rhy:-60,mouth:'grin',extra:'notes'},d:200,e:'out'}]).concat([{p:{view:'q',y:-6,lhx:-80,lhy:-100,rhx:80,rhy:-100,mouth:'grin',extra:'notes'},d:150},{p:{view:'side',y:-10,mouth:'grin',extra:'notes'},d:150},{p:{view:'back',y:-12,extra:'notes'},d:150},{p:{view:'side',flip:-1,y:-8,extra:'notes'},d:150},{p:{view:'q',flip:-1,y:-4,extra:'notes'},d:150},{p:{y:4,sx:1.08,sy:.92,lhx:-82,lhy:-100,rhx:82,rhy:-100,mouth:'big',extra:'spark'},d:250,e:'out'},{p:{lhx:-82,lhy:-100,rhx:82,rhy:-100,mouth:'big',extra:'spark'},d:500,e:'back'}])},
stretch:{loop:1,k:[{p:m(SIT,{prop:'book',lhx:-32,lhy:-40,rhx:32,rhy:-40,lookY:1}),d:900},{p:m(SIT,{lookY:-.4,squint:.4}),d:400,e:'inout'},{p:m(CROUCH,{}),d:350,e:'inout'},{p:{y:-3,sy:1.05},d:300,e:'out'},
  {p:m({lhx:-50,lhy:-124,rhx:50,rhy:-124},{sy:1.13,sx:.93,y:-4,eyes:'closed',mouth:'o',hair:1.2,lfa:20,rfa:20,lfy:3,rfy:3}),d:800,e:'out'},{p:{lhx:-30,lhy:-124,rhx:70,rhy:-114,sy:1.1,sx:.94,rot:10,eyes:'closed',mouth:'o',lfy:2,rfy:2},d:600,e:'inout'},{p:{lhx:-70,lhy:-114,rhx:30,rhy:-124,sy:1.1,sx:.94,rot:-10,eyes:'closed',mouth:'o',lfy:2,rfy:2},d:700,e:'inout'},
  {p:{sy:.94,sx:1.05,y:2,eyes:'happy',mouth:'smile'},d:350,e:'out'},{p:{eyes:'happy',mouth:'open'},d:500,e:'back'},{p:{},d:600}]},
mirror:{loop:1,k:[{p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,look:1.2},d:700,e:'inout'},{p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,look:1.2,eyes:'wide',brows:'up',mouth:'o'},d:500},
  {p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,look:1.2,rhx:30,rhy:-118,tilt:6,mouth:'smile'},d:500,e:'inout'},{p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,look:1.2,rhx:40,rhy:-122,tilt:-4,mouth:'smile',hair:1.3},d:400,e:'inout'},
  {p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,look:1.2,eyes:'wink',mouth:'grin',rhx:70,rhy:-60,blush:.6},d:500,e:'back'},{p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,look:1.2,eyes:'wink',mouth:'grin',rhx:70,rhy:-60,blush:.6},d:700},
  {p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,sy:1.06,rot:-3,lhx:-38,lhy:-26,rhx:38,rhy:-26,eyes:'happy',mouth:'smile',hair:1.4,look:1},d:500,e:'back'},{p:{scene:'mirror',mir:1,view:'q',flip:1,x:-40,sy:1.06,rot:-3,lhx:-38,lhy:-26,rhx:38,rhy:-26,eyes:'happy',mouth:'smile',hair:1.4},d:1300}]},
waveBye:{loop:1,k:[{p:{},d:400},...rep(3,[{p:{rhx:86,rhy:-104,mouth:'open',tilt:4,rot:2},d:220,e:'inout'},{p:{rhx:62,rhy:-120,mouth:'open',eyes:'happy',tilt:4,rot:2},d:220,e:'inout'}]),
  ...turnTo(1,0,{rhx:70,rhy:-110}),g('walk',1,180,2400,{rhx:70,rhy:-110,eyes:'happy'}),{p:{view:'q',flip:1,x:-190},d:1},{p:{view:'q',flip:1,x:-190},d:300},g('walk',1,0,2600),{p:{},d:600,e:'out'}]},
/* ---- extras ---- */
point:{loop:1,k:[{p:{},d:400},{p:{rhx:30,rhy:-40,sy:.97},d:200,e:'out'},{p:{rhx:92,rhy:-78,look:1.3,mouth:'open',rot:3,tilt:4},d:320,e:'back'},{p:{rhx:92,rhy:-78,look:1.3,talk:1,rot:3,tilt:4},d:1600},{p:{},d:600,e:'inout'}]},
thumbsUp:{loop:1,k:[{p:{},d:400},{p:{rhx:40,rhy:-30,sy:.96,y:2},d:200,e:'out'},{p:{rhx:66,rhy:-80,eyes:'wink',mouth:'grin',rot:3,tilt:5,sy:1.03},d:340,e:'back'},{p:{rhx:66,rhy:-82,eyes:'wink',mouth:'grin',rot:3,tilt:5},d:1300},{p:{},d:600,e:'inout'}]},
wave:{loop:1,k:[{p:{rhx:86,rhy:-104,mouth:'open'},d:240,e:'back'},{p:{rhx:62,rhy:-120,mouth:'open'},d:220,e:'inout'},{p:{rhx:86,rhy:-104,eyes:'happy',mouth:'open'},d:220,e:'inout'},{p:{rhx:62,rhy:-120,eyes:'happy',mouth:'big'},d:220,e:'inout'},{p:{},d:500,e:'out'},{p:{},d:600}]},
talk:{loop:1,k:[{p:{talk:1,rot:-2,rhx:44,rhy:-50},d:700,e:'inout'},{p:{talk:1,rot:2,rhx:56,rhy:-60,brows:'up'},d:700,e:'inout'},{p:{talk:1,lhx:-46,lhy:-52},d:700,e:'inout'}]},
think:{loop:1,k:[{p:{look:1,lookY:-1,mouth:'flat',rhx:30,rhy:-42,extra:'q',tilt:6},d:600,e:'inout'},{p:{look:-1,lookY:-1,mouth:'flat',rhx:30,rhy:-42,extra:'q',tilt:-4},d:900,e:'inout'},{p:{y:-10,eyes:'wide',mouth:'open',hair:1.5,extra:'bang',rhx:70,rhy:-118},d:260,e:'back'},{p:{eyes:'happy',mouth:'big',rhx:70,rhy:-118,hair:1.3},d:700}]},
cheer:{loop:1,k:[{p:m(HV,{mouth:'big',y:-6,hair:1.3,extra:'spark'}),d:240,e:'out'},{p:m(HU,{mouth:'big',y:-16,fa:.3,hair:1.45,extra:'spark'}),d:220,e:'out'},{p:m(HV,{mouth:'big',y:3,sx:1.08,sy:.92,hair:1.2,extra:'spark'}),d:200,e:'in'}]},
flameUp:{loop:1,k:[{p:m(CROUCH,{hair:.6}),d:400,e:'in'},{p:m(HU,{hair:2.1,heat:.6,sy:1.12,sx:.92,y:-8,eyes:'wide',mouth:'big',extra:'spark'}),d:300,e:'back'},{p:m(HV,{hair:1.8,heat:.5,eyes:'happy',mouth:'big',extra:'spark'}),d:900,e:'inout'},{p:{},d:800,e:'inout'}]},
dizzy:{loop:1,k:[{p:{eyes:'spiral',mouth:'wobble',rot:-8,tilt:-8,extra:'dizzy',lfy:3,lhx:-70,lhy:-50},d:500,e:'inout'},{p:{eyes:'spiral',mouth:'wobble',rot:8,tilt:8,extra:'dizzy',rfy:3,rhx:70,rhy:-50},d:500,e:'inout'}]},
love:{loop:1,k:[{p:{mouth:'open',lhx:-14,lhy:-56,rhx:14,rhy:-56,rot:-3,tilt:-6,extra:'hearts',blush:.8},d:700,e:'inout'},{p:{mouth:'smile',lhx:-14,lhy:-56,rhx:14,rhy:-56,rot:3,tilt:6,extra:'hearts',blush:.8},d:700,e:'inout'}]}
};
G.FLAME_ACTIONS=A;
/* ---- every action has its own eyes (lidT upper lid, lidA lid tilt +angry/-sad, lidB lower lid, pup pupil size, shine, asym) ---- */
G.FLAME_EYES={
 idle:{lidT:.08},walk:{lidT:.14,look:.6},run:{lidT:.32,lidA:12,pup:.9},tiptoe:{pup:.62,lidB:.08,brows:'up'},skip:{lidB:.38,shine:1.35},
 jump:{pup:1.1,shine:1.3},hop:{lidB:.32,shine:1.25},turnLeft:{lidT:.1},turnRight:{lidT:.1},turnAround:{lidT:.06,shine:1.2},
 sit:{lidT:.26},standUp:{lidT:.12},crouch:{lidT:.4,lidA:9,pup:.85},lieDown:{lidT:.45},getUp:{lidT:.35},sleep:{lidT:.3},
 cry:{eyes:'teary',lidT:.22,lidA:-14,pup:1.12},laugh:{eyes:'squeeze'},embarrassed:{lidT:.45,lidA:-9,lidB:.22,pup:.8},
 angry:{lidT:.5,lidA:26,pup:.82,brows:''},excited:{eyes:'star'},confused:{asym:.42,pup:.9,lidA:-4},scared:{eyes:'wide',pup:.42},
 sad:{lidT:.36,lidA:-20,pup:1.05,shine:1.4},proud:{lidT:.4,lidA:5,lidB:.16,pup:.95},curious:{pup:1.28,shine:1.45,asym:-.0},
 love:{lidT:.42,lidA:-6,lidB:.25,pup:.95},dizzy:{},read:{lidT:.32,pup:.92},write:{lidT:.38,lidA:7,pup:.88},laptop:{lidT:.24,pup:.8,shine:1.3},
 explore:{pup:1.15,shine:1.3},ball:{pup:1.12,shine:1.2},clap:{lidB:.42},highFive:{pup:1.1,shine:1.3},dance:{lidT:.18,lidB:.2,shine:1.3,look:1.2,pup:1.05},
 stretch:{lidT:.3},mirror:{lidT:.2,lidB:.15,shine:1.3},waveBye:{lidB:.25,lidA:-7,shine:1.4},wave:{lidB:.3,shine:1.3},
 point:{lidT:.2,lidA:7},thumbsUp:{lidB:.2},talk:{lidT:.1},think:{lidT:.3,asym:.25,lookY:-1},cheer:{eyes:'star'},flameUp:{pup:.9,shine:1.4}};

G.FLAME_GROUPS=[['Movement',['idle','walk','run','jump','hop','turnLeft','turnRight','turnAround','sit','standUp','crouch','lieDown','getUp','tiptoe','skip']],
 ['Sleeping',['sleep']],
 ['Emotions',['cry','laugh','embarrassed','angry','excited','confused','scared','sad','proud','curious','love','dizzy']],
 ['Activities',['read','write','laptop','explore','ball','clap','highFive','dance','stretch','mirror','waveBye']],
 ['Extras',['wave','point','thumbsUp','talk','think','cheer','flameUp']]];
})(typeof window!=='undefined'?window:globalThis);
