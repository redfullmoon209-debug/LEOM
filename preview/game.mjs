// LEOM FREE 3D browser test, standalone fallback while Unity WebGL cloud build is blocked.
// Temporary meshes and map are procedural; no original Leoonline FBX/map is imported.
// Uses permissive MIT-licensed three.js hosted as a local pinned Pages build asset.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.176.0/build/three.module.js';
import {RPG} from './rpg.mjs';
import {createUI} from './panels.mjs';

const $=(id)=>document.getElementById(id);
const keys=new Set(),pad=new Set();
const cap=(x,a,b)=>Math.min(b,Math.max(a,x));
const now=()=>performance.now()/1000;
const vm=(x,z)=>new THREE.Vector3(x,0,z);
function material(color,metalness=0.02){
 return new THREE.MeshStandardMaterial({color,metalness,roughness:.82});
}
function mesh(type,color,parent,pos,scale,collide=false){
 const geometries={
  box:()=>new THREE.BoxGeometry(1,1,1),
  sphere:()=>new THREE.SphereGeometry(.5,12,9),
  cylinder:()=>new THREE.CylinderGeometry(.5,.5,1,10),
  capsule:()=>new THREE.CapsuleGeometry(.5,1,5,10),
  cone:()=>new THREE.ConeGeometry(.5,1,8),
  plane:()=>new THREE.PlaneGeometry(1,1)
 };
 const obj=new THREE.Mesh(geometries[type](),material(color));
 obj.position.set(...pos);obj.scale.set(...scale);obj.userData.solid=collide;
 if(parent)parent.add(obj);
 return obj;
}
function makeHero(){
 const root=new THREE.Group();root.name='LEOM TEMP Humanoid';
 const armor='#2c75b2',trim='#e2c17e',skin='#d39f7d',hair='#1a263b',pants='#202f4d';
 mesh('capsule',armor,root,[0,1.43,0],[.80,.75,.64]);
 mesh('sphere',skin,root,[0,2.3,0],[.72,.72,.69]);
 mesh('sphere',hair,root,[0,2.62,-.10],[.78,.30,.72]);
 for(const s of [-1,1]){
  const arm=mesh('capsule',skin,root,[s*.57,1.43,0],[.31,.72,.34]);arm.rotation.z=s*.18;
  mesh('sphere',trim,root,[s*.65,.82,0],[.29,.29,.29]);
  mesh('capsule',pants,root,[s*.24,.52,0],[.38,.65,.43]);
  mesh('box',hair,root,[s*.24,.16,.22],[.42,.29,.75]);
  mesh('sphere','#1b2930',root,[s*.17,2.39,.30],[.10,.10,.08]);
 }
 mesh('cylinder',trim,root,[.76,.83,.15],[.12,.52,.12]);
 mesh('box','#bfcbd1',root,[.76,.25,.15],[.18,.91,.09]);
 mesh('box',trim,root,[.76,.58,.15],[.57,.09,.12]);
 mesh('sphere',trim,root,[0,1.49,.34],[.26,.28,.11]);
 return root;
}
function makeNpc(world,x,z,color,label){
 const group=makeHero();
 group.position.set(x,0,z);group.rotation.y=Math.PI;
 const torso=group.children[0];torso.material=material(color);
 group.name=label;
 world.add(group);
 return group;
}
function makeMob(world,x,z,i){
 const group=new THREE.Group();
 group.name='Training Spirit '+(i+1);
 group.position.set(x,0,z);
 const color=i%3===0?'#cf554e':i%3===1?'#ab6b45':'#804dbb';
 const body=mesh('sphere',color,group,[0,.77,0],[1.55,1.32,1.25]);
 const belly=mesh('sphere','#e7baa0',group,[0,.54,.49],[.95,.66,.31]);
 for(const s of [-1,1]){
  const horn=mesh('cone','#e7c391',group,[s*.48,1.51,0],[.37,.78,.37]);horn.rotation.z=-s*.24;
  mesh('sphere','#141e2b',group,[s*.36,.90,.58],[.20,.20,.18]);
 }
 const hpBack=mesh('box','#142731',group,[0,2.12,0],[1.6,.17,.10]);
 const hpBar=mesh('box','#d65959',group,[0,2.12,.09],[1.55,.12,.09]);
 world.add(group);
 return {group,body,hpBack,hpBar,hp:60,maxHp:60,home:new THREE.Vector3(x,0,z),
  attackAt:0,respawnAt:0,alive:true,rewardExp:35,rewardGold:'20',index:i,flashUntil:0};
}
function tree(world,x,z,s){
 mesh('cylinder','#68513a',world,[x,1.1*s,z],[.42*s,2.2*s,.42*s]);
 mesh('sphere','#397054',world,[x,2.55*s,z],[2.8*s,2.45*s,2.8*s]);
 mesh('sphere','#52916b',world,[x+.7*s,3*s,z-.3*s],[1.8*s,1.65*s,1.8*s]);
}
function pillar(world,x,z,color){
 mesh('cylinder',color,world,[x,1.5,z],[1.2,3,1.2]);
 mesh('box','#34495c',world,[x,3.10,z],[1.75,.4,1.75]);
}
function makeWorld(scene){
 mesh('box','#335d44',scene,[0,-.65,0],[145,1.3,145],true);
 // Safe town plaza, arena, guild territory are visual guides, NOT network PvP areas.
 mesh('box','#7b837f',scene,[-31,.05,-16],[25,.12,21]);
 mesh('box','#91645a',scene,[32,.04,31],[21,.12,21]);
 mesh('box','#5e6888',scene,[-34,.04,35],[27,.12,24]);
 for(const [x,z,size,roof] of [
  [-40,-23,6,'#435d6e'],[-20,-23,5,'#77574f'],[-37,-11,5,'#436b67'],[-22,-10,5,'#584f71']
 ]){
  mesh('box','#b5a592',scene,[x,1.55,z],[size,3,size*.8]);
  const top=mesh('cone',roof,scene,[x,3.7,z],[size*1.6,2.4,size*1.6]);top.rotation.y=Math.PI/4;
 }
 // Blue portal to test arena.
 const portal=mesh('cylinder','#406f9b',scene,[32,.33,31],[4,.7,4]);portal.material.emissive=new THREE.Color('#0f283e');
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3;
  pillar(scene,32+Math.cos(a)*10,31+Math.sin(a)*10,'#a94e4b');
 }
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7;
  pillar(scene,-34+Math.cos(a)*12,35+Math.sin(a)*10,'#5b6c96');
 }
 for(let i=0;i<10;i++){
  const a=i*Math.PI*2/10;
  const p=mesh('cylinder','#818e8d',scene,[Math.cos(a)*24,1.1,Math.sin(a)*24],[1.45,2.2,1.45]);
  p.rotation.z=i%2?.10:-.09;
  mesh('sphere','#b4a56c',scene,[Math.cos(a)*24,2.5,Math.sin(a)*24],[.5,.5,.5]);
 }
 let seed=2728;const rand=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
 for(let i=0;i<110;i++){
  const x=rand()*131-65.5,z=rand()*131-65.5;
  if(Math.hypot(x,z)<29 || (x>-46&&x<-17&&z>-28&&z<-4)||
     (x>19&&x<46&&z>18&&z<44)||(x<-17&&x>-51&&z>18&&z<52))continue;
  if(i%5===0)mesh('box','#626b69',scene,[x,.48,z],[.9+rand()*2,1,1.5+rand()*2]);
  else tree(scene,x,z,.75+rand()*.85);
 }
 makeNpc(scene,-36,-15,'#c9a259','Shop NPC (temporary)');
 makeNpc(scene,-26,-15,'#52a0a4','Storage NPC (temporary)');
}
class Game {
 constructor(rpg){
  this.rpg=rpg;this.auto=false;this.mobs=[];this.drops=[];
  this.target=null;this.attackAt=0;this.skillUntil={};this.respawnAt=0;
  this.orbitY=.25;this.orbitPitch=.37;this.zoom=9.2;
  this.jumpY=0;this.jumpSpeed=0;this.facing=0;
  this.scene=new THREE.Scene();
  this.scene.background=new THREE.Color('#86b7cf');
  this.scene.fog=new THREE.Fog('#86b7cf',72,160);
  this.camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,280);
  this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'default'});
  this.renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
  this.renderer.setSize(innerWidth,innerHeight);
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  $('world').appendChild(this.renderer.domElement);
  this.scene.add(new THREE.HemisphereLight('#e8f5ff','#5c654f',1.8));
  const sun=new THREE.DirectionalLight('#fff4dd',2.1);
  sun.position.set(-23,47,25);this.scene.add(sun);
  makeWorld(this.scene);
  this.hero=makeHero();
  this.hero.position.set(this.rpg.state.position.x,0,this.rpg.state.position.z);
  this.scene.add(this.hero);
  for(let i=0;i<12;i++){
   const a=i*Math.PI*2/12;
   this.mobs.push(makeMob(this.scene,Math.sin(a)*13,Math.cos(a)*13,i));
  }
  this.ring=new THREE.Mesh(
   new THREE.RingGeometry(1.05,1.28,40),
   new THREE.MeshBasicMaterial({color:'#ffd56a',side:THREE.DoubleSide,depthWrite:false,transparent:true,opacity:.94})
  );
  this.ring.rotation.x=-Math.PI/2;this.ring.position.y=.055;this.ring.visible=false;this.scene.add(this.ring);
  this.mouseDrag=null;
  this.ui=createUI(this.rpg,this);
  this.attachControls();
  addEventListener('resize',()=>this.resize());
  this.resize();
  this.last=now();this.lastHUD=0;this.lastSave=now();
  this.animating=true;
  this.frame();
 }
 targetName(){return this.target?.alive?this.target.group.name:'ไม่มี';}
 zoneName(){
  const {x,z}=this.hero.position;
  if(x>-45&&x<-17&&z>-27&&z<-5)return 'เมืองปลอดภัย';
  if(x>19&&x<46&&z>18&&z<46)return 'Arena (จำลอง)';
  if(x>-50&&x<-17&&z>18&&z<50)return 'Guild War (จำลอง)';
  return 'เขตฟาร์ม';
 }
 resize(){
  const w=innerWidth,h=innerHeight;
  this.camera.aspect=w/h;this.camera.updateProjectionMatrix();
  this.renderer.setSize(w,h);
 }
 tell(msg){this.rpg.say(msg);}
 nearest(range=22){
  let best=null,bestDistance=range;
  for(const m of this.mobs){
   if(!m.alive)continue;
   const d=m.group.position.distanceTo(this.hero.position);
   if(d<bestDistance){bestDistance=d;best=m;}
  }
  return best;
 }
 select(){this.target=this.nearest(19);this.tell('เลือกเป้า: '+this.targetName());}
 combatTarget(range){
  if(this.target?.alive&&this.target.group.position.distanceTo(this.hero.position)<=range)return this.target;
  return this.nearest(range);
 }
 face(target){
  const p=this.hero.position,q=target.group.position;
  this.hero.rotation.y=Math.atan2(q.x-p.x,q.z-p.z);
 }
 hit(mob,amount,label='โจมตี'){
  if(!mob?.alive)return;
  mob.hp=Math.max(0,mob.hp-Math.max(1,Math.round(amount)));
  mob.flashUntil=now()+.13;
  mob.hpBar.scale.x=1.55*mob.hp/mob.maxHp;
  mob.hpBar.position.x=-.775+mob.hpBar.scale.x*.5;
  this.tell(label+' -'+Math.round(amount)+' HP');
  if(mob.hp<=0)this.kill(mob);
 }
 basic(){
  if(this.rpg.hp<=0||now()<this.attackAt||this.ui.isOpen())return;
  this.attackAt=now()+.52;
  const m=this.combatTarget(3.6);
  if(!m){this.tell('มอนสเตอร์อยู่นอกระยะโจมตี');return;}
  this.face(m);
  this.hit(m,10+this.rpg.effectiveStat('strength')*.35+
    this.rpg.effectiveStat('dexterity')*.20,'⚔️ โจมตี');
 }
 castSlot(i){const id=this.rpg.state.hotbar[i];if(id)this.cast(id);}
 cast(id,fromMenu=false){
  if((this.ui.isOpen()&&!fromMenu)||this.rpg.hp<=0)return;
  const sk=this.rpg.skills.get(id);
  if(!sk||sk.job!==this.rpg.state.job){this.tell('ยังไม่มีสกิลนี้ในอาชีพ');return;}
  if(sk.kind==='passive'){this.tell('สกิลติดตัวต้องอัปเกรด ไม่ต้องกดใช้');return;}
  if(sk.kind==='timed_buff'){this.rpg.buff(id);return;}
  if(!sk.implemented){this.tell('สกิลอาชีพนี้อยู่ระหว่างย้ายระบบ ยังต่อสู้ไม่ได้');return;}
  const t=now(),expiry=this.skillUntil[id]||0;
  if(t<expiry){this.tell('คูลดาวน์ '+(expiry-t).toFixed(1)+' วินาที');return;}
  if(id==='novice_guard'){
   if(this.rpg.sp<15){this.tell('SP ไม่พอ (15)');return;}
   this.rpg.sp-=15;this.rpg.guardUntil=t+5;this.skillUntil[id]=t+10;
   this.tell('🛡️ โล่ป้องกัน ลดความเสียหาย 65% / 5 วินาที');return;
  }
  const maxRange=id==='novice_rush'?12:3.6;
  const enemy=this.combatTarget(maxRange);
  if(!enemy){this.tell('หาเป้าหมายในระยะ '+maxRange+' เมตรไม่เจอ');return;}
  if(id==='novice_rush'){
   if(this.rpg.sp<20){this.tell('SP ไม่พอ (20)');return;}
   this.rpg.sp-=20;
   const delta=enemy.group.position.clone().sub(this.hero.position);delta.y=0;
   const travel=Math.max(0,Math.min(7,delta.length()-1.6));
   this.hero.position.add(delta.normalize().multiplyScalar(travel));
   this.skillUntil[id]=t+3;
   this.face(enemy);
   this.hit(enemy,27+this.rpg.effectiveStat('strength')*.6,'⚡ Azure Rush');
  }else if(id==='novice_slash'){
   this.skillUntil[id]=t+.8;
   this.face(enemy);
   this.hit(enemy,19+this.rpg.effectiveStat('strength')*.75+
     this.rpg.effectiveStat('dexterity')*.5,'🗡️ First Strike');
  }
 }
 toggleAuto(){
  this.auto=!this.auto;
  if(this.auto&&!this.target?.alive)this.target=this.nearest(30);
  this.tell(this.auto?'เปิดฟาร์มอัตโนมัติ (Q เพื่อปิด)':'หยุดฟาร์มอัตโนมัติ');
 }
 loot(){
  if(!this.drops.length){this.tell('ไม่มีของดรอปใกล้ตัว');return;}
  let chosen=null,distance=2.9;
  for(const d of this.drops){
   const n=d.group.position.distanceTo(this.hero.position);
   if(n<distance){distance=n;chosen=d;}
  }
  if(!chosen){this.tell('เข้าใกล้ไอเทมเพื่อเก็บ');return;}
  if(this.rpg.addItem(chosen.id))this.removeDrop(chosen);
 }
 removeDrop(drop){
  this.scene.remove(drop.group);drop.group.traverse(o=>{o.geometry?.dispose();});
  this.drops=this.drops.filter(d=>d!==drop);
 }
 spawnDrop(pos,id){
  const group=new THREE.Group();
  mesh('box',id==='sword'?'#dfe5c3':id==='potion'?'#e67e69':'#f6cd78',
   group,[0,.4,0],[.55,.55,.55]);
  group.position.copy(pos);this.scene.add(group);
  this.drops.push({group,id,created:now()});
 }
 kill(mob){
  mob.alive=false;mob.group.visible=false;mob.respawnAt=now()+9;
  this.rpg.rewardMonster(mob.rewardExp,mob.rewardGold);
  this.tell('กำจัด '+mob.group.name+' +'+mob.rewardExp+' EXP +'+mob.rewardGold+' Gold');
  const seed=Math.random();
  if(seed<.8)this.spawnDrop(mob.group.position,seed<.09?'sword':seed<.18?'potion':'wood');
  if(mob===this.target)this.target=null;
 }
 damage(amount){
  if(this.rpg.hp<=0)return;
  const reduction=Math.min(.4,Math.max(0,(this.rpg.effectiveStat('vitality')-10)*.012));
  const guard=now()<this.rpg.guardUntil?.35:1;
  const damage=Math.max(1,Math.round(amount*(1-reduction)*guard));
  this.rpg.hp=Math.max(0,this.rpg.hp-damage);
  if(this.rpg.hp===0){
   this.auto=false;this.respawnAt=now()+8;
   this.tell('☠️ ตัวละครล้ม รอเกิดใหม่ 8 วินาที');
  }
 }
 revive(){
  this.rpg.hp=this.rpg.maxHp();this.rpg.sp=100;
  this.hero.position.set(0,0,0);this.target=null;this.respawnAt=0;
  this.rpg.persist();this.tell('เกิดใหม่ที่จุดเริ่มต้น');
 }
 attachControls(){
  const canvas=this.renderer.domElement;
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
   if(e.pointerType==='mouse'&&e.button===0)this.basic();
   if(e.pointerType==='touch'||e.button===2){
    this.mouseDrag={id:e.pointerId,x:e.clientX,y:e.clientY};
    canvas.setPointerCapture?.(e.pointerId);
   }
  });
  canvas.addEventListener('pointermove',e=>{
   if(!this.mouseDrag||this.mouseDrag.id!==e.pointerId)return;
   const dx=e.clientX-this.mouseDrag.x,dy=e.clientY-this.mouseDrag.y;
   this.orbitY-=dx*.004;
   this.orbitPitch=cap(this.orbitPitch+dy*.003,-.08,1.08);
   this.mouseDrag.x=e.clientX;this.mouseDrag.y=e.clientY;
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture'])
   canvas.addEventListener(event,()=>{this.mouseDrag=null;});
  canvas.addEventListener('wheel',e=>{this.zoom=cap(this.zoom+Math.sign(e.deltaY)*.8,4,17);e.preventDefault();},{passive:false});
  addEventListener('keydown',e=>{
   if(e.target?.closest?.('input,textarea,select'))return;
   const k=e.key.toLowerCase();
   if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
   keys.add(k);
   if(e.repeat)return;
   if(k==='t')this.select();
   if(k==='q')this.toggleAuto();
   if(k==='e')this.loot();
   if(k==='j')this.basic();
   if(k==='1'||k==='2'||k==='3')this.castSlot(Number(k)-1);
   if(k===' '||k==='spacebar')this.jump();
   if(k==='f5'){this.rpg.persist();this.tell('บันทึกตัวละคร');}
  });
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  addEventListener('blur',()=>{keys.clear();pad.clear();});
  document.querySelectorAll('[data-dir]').forEach(btn=>{
   const dir=btn.dataset.dir;
   btn.addEventListener('pointerdown',e=>{e.preventDefault();pad.add(dir);btn.setPointerCapture?.(e.pointerId);});
   for(const ev of ['pointerup','pointercancel','lostpointercapture','pointerleave'])
    btn.addEventListener(ev,()=>pad.delete(dir));
  });
  $('target-btn').addEventListener('click',()=>this.select());
  $('attack-btn').addEventListener('click',()=>this.basic());
  $('auto-btn').addEventListener('click',()=>this.toggleAuto());
  $('pick-btn').addEventListener('click',()=>this.loot());
  $('jump-btn').addEventListener('click',()=>this.jump());
  document.querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('click',()=>this.castSlot(+b.dataset.skill)));
  addEventListener('beforeunload',()=>this.save());
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.save();});
 }
 jump(){if(this.jumpY<=.001&&this.rpg.hp>0&&!this.ui.isOpen())this.jumpSpeed=5.2;}
 save(){
  this.rpg.state.position.x=+this.hero.position.x.toFixed(3);
  this.rpg.state.position.z=+this.hero.position.z.toFixed(3);
  this.rpg.persist();
 }
 move(dt){
  if(this.rpg.hp<=0||this.ui.isOpen())return;
  let x=0,z=0;
  if(keys.has('w')||keys.has('arrowup')||pad.has('up'))z-=1;
  if(keys.has('s')||keys.has('arrowdown')||pad.has('down'))z+=1;
  if(keys.has('a')||keys.has('arrowleft')||pad.has('left'))x-=1;
  if(keys.has('d')||keys.has('arrowright')||pad.has('right'))x+=1;
  const manual=Math.hypot(x,z)>.01;
  if(manual&&this.auto){this.auto=false;this.tell('หยุดออโต้เนื่องจากสั่งเดิน');}
  const speed=keys.has('shift')?7:4.8;
  if(manual){
   const normalized=vm(x,z).normalize();
   const vx=normalized.x*Math.cos(this.orbitY)+normalized.z*Math.sin(this.orbitY);
   const vz=normalized.z*Math.cos(this.orbitY)-normalized.x*Math.sin(this.orbitY);
   this.hero.position.x+=vx*speed*dt;
   this.hero.position.z+=vz*speed*dt;
   this.hero.rotation.y=Math.atan2(vx,vz);
  }else if(this.auto){
   if(!this.target?.alive || this.target.group.position.distanceTo(this.hero.position)>28)
    this.target=this.nearest(28);
   const m=this.target;
   if(m){
    const diff=m.group.position.clone().sub(this.hero.position);diff.y=0;
    if(diff.length()>3.0){
     diff.normalize();this.hero.position.addScaledVector(diff,dt*6.9);
     this.face(m);
    }else this.basic();
   }
  }
  this.hero.position.x=cap(this.hero.position.x,-68,68);
  this.hero.position.z=cap(this.hero.position.z,-68,68);
  if(this.jumpY>0||this.jumpSpeed>0){
   this.jumpSpeed-=14*dt;
   this.jumpY=Math.max(0,this.jumpY+this.jumpSpeed*dt);
   if(this.jumpY===0)this.jumpSpeed=0;
  }
 }
 update(dt){
  this.rpg.tick(dt);
  this.move(dt);
  for(const m of this.mobs){
   if(!m.alive){
    if(now()>=m.respawnAt){
     m.alive=true;m.hp=m.maxHp;m.group.position.copy(m.home);
     m.group.visible=true;m.hpBar.scale.x=1.55;m.hpBar.position.x=0;
     m.attackAt=0;
    }
    continue;
   }
   m.body.material.emissive=new THREE.Color(now()<m.flashUntil?'#772f34':'#000000');
   const d=m.group.position.distanceTo(this.hero.position);
   if(d<9&&this.rpg.hp>0&&!this.zoneName().includes('ปลอดภัย')){
    const delta=this.hero.position.clone().sub(m.group.position);
    delta.y=0;
    if(delta.length()>1.65){
     delta.normalize();m.group.position.addScaledVector(delta,dt*1.55);
     m.group.rotation.y=Math.atan2(delta.x,delta.z);
    }else if(now()>=m.attackAt){
     m.attackAt=now()+2.2;this.damage(8+m.index*.25);
    }
   }else if(d>13){
    m.group.position.lerp(m.home,dt*.4);
   }
   m.group.position.y=Math.sin(now()*2.3+m.index)*.08;
  }
  for(const drop of [...this.drops]){
   drop.group.rotation.y+=dt*1.9;
   drop.group.position.y=Math.sin(now()*2)*.10;
   if(now()-drop.created>90)this.removeDrop(drop);
  }
  if(this.rpg.hp<=0&&this.respawnAt>0&&now()>=this.respawnAt)this.revive();
  this.ring.visible=Boolean(this.target?.alive);
  if(this.ring.visible){
   this.ring.position.x=this.target.group.position.x;
   this.ring.position.z=this.target.group.position.z;
   this.ring.rotation.z+=dt*1.3;
  }
  // Smooth 3rd-person camera and mobile drag orbit.
  const focus=this.hero.position.clone().add(new THREE.Vector3(0,1.7+this.jumpY,0));
  const distance=this.zoom;
  const horizontal=Math.cos(this.orbitPitch)*distance;
  const desired=focus.clone().add(new THREE.Vector3(
   Math.sin(this.orbitY)*horizontal,
   Math.sin(this.orbitPitch)*distance+1.2,
   Math.cos(this.orbitY)*horizontal
  ));
  this.camera.position.lerp(desired,Math.min(1,dt*8));
  this.camera.lookAt(focus);
  if(now()-this.lastSave>20){this.lastSave=now();this.save();}
  if(now()-this.lastHUD>.16){this.lastHUD=now();this.ui.updateHUD();}
 }
 frame(){
  if(!this.animating)return;
  requestAnimationFrame(()=>this.frame());
  const t=now(),dt=cap(t-this.last,0,.055);this.last=t;
  this.update(dt);
  this.renderer.render(this.scene,this.camera);
 }
}
function toast(message){
 const el=$('toast');el.textContent=message;el.style.display='block';
 clearTimeout(window.__leomToastTimer);
 window.__leomToastTimer=setTimeout(()=>{el.style.display='none';},2500);
}
async function main(){
 const start=$('start');start.disabled=true;
 const note=$('load-note');
 try{
  note.textContent='กำลังอ่านข้อมูลระบบ LEOM ...';
  const response=await fetch('./catalog.json',{cache:'no-store'});
  if(!response.ok)throw Error('โหลดข้อมูลเกมไม่สำเร็จ: HTTP '+response.status);
  const catalog=await response.json();
  if(catalog.items?.length!==31||catalog.offers?.length!==21||catalog.skills?.length!==171)
   throw Error('ข้อมูล LEOM ยังไม่ครบ กรุณาตรวจไฟล์ catalog.json');
  note.textContent='กำลังสร้างแผนที่และตัวละคร 3D ชั่วคราว ...';
  const rpg=new RPG(catalog,toast);
  const game=new Game(rpg);
  $('start').addEventListener('click',()=>{$('start-screen').classList.add('hidden');rpg.say('ยินดีต้อนรับสู่ LEOM 3D Browser Test');});
  start.disabled=false;note.textContent='พร้อมเล่น • '+catalog.items.length+' ไอเทม • '+catalog.skills.length+' สกิล • ฟรี';
  game.ui.updateHUD();
 }catch(error){
  console.error('LEOM test boot failed:',error);
  note.textContent='เปิดเกมไม่สำเร็จ: '+error.message;
  note.style.color='#ffb1b2';
  start.disabled=true;
 }
}
main();
