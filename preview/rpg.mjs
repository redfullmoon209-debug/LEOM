// LEOM standalone browser fallback (NOT Unity WebGL).
// All balances are exact decimal strings. Local browser state is NOT multiplayer authority.
export const CAP = 999999999999999999999n;
export const CURRENCIES = ['gold', 'blue', 'purple', 'green'];
export const EQUIP_SLOTS = [
 'hat','shirt','gloves','pants','shoes','weapon_right','weapon_left',
 'bracelet_left','ring_left','necklace','ring_right','bracelet_right',
 'pet','mount','fashion_hat','fashion_shirt','fashion_gloves','fashion_pants',
 'fashion_shoes','fashion_weapon_right','fashion_weapon_left','fashion_mask','fashion_cape'
];
const SAVE_KEY = 'LEOM_BROWSER_PREVIEW_V1';
const defaultState = () => ({
 version:1, name:'Adventurer', job:'Novice', path:'Unchosen', classTier:0,
 level:1,exp:0,statPoints:0,skillPoints:0,
 attributes:{strength:10,vitality:10,agility:10,intelligence:10,dexterity:10,luck:10},
 pveKills:0,pvpWins:0,pvpLosses:0,
 bag:Array(200).fill(''),storage:Array(200).fill(''),unlocked:40,
 wallet:{gold:'0',blue:'0',purple:'0',green:'0'},
 vault:{gold:'0',blue:'0',purple:'0',green:'0'},
 equipment:{},hotbar:['novice_slash','novice_rush','novice_guard'],passives:{},
 secondsOnline:0,nextReward:18000,
 position:{x:0,z:0}
});
export function isAmount(value){
 if(typeof value!=='string' || !/^\d+$/.test(value))return false;
 try{return BigInt(value)<=CAP;}catch{return false;}
}
export function parseAmount(value){
 if(!isAmount(value))throw new Error('จำนวนเงินไม่ถูกต้องหรือเกิน 21 หลัก');
 return BigInt(value);
}
export function formatted(value){
 try{return BigInt(value).toLocaleString('en-US');}catch{return '0';}
}
export function escapeHtml(raw){
 return String(raw??'').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
}
export class RPG {
 constructor(catalog,notice=()=>{}){
  if(!catalog?.items || !catalog?.offers || !catalog?.jobs || !catalog?.skills)throw new Error('Missing LEOM catalog');
  this.catalog=catalog;this.items=new Map(catalog.items.map(x=>[x.id,x]));
  this.offers=new Map(catalog.offers.map(x=>[x.id,x]));
  this.jobs=new Map(catalog.jobs.map(x=>[x.id,x]));
  this.skills=new Map(catalog.skills.map(x=>[x.id,x]));
  this.notice=notice;this.listeners=[];
  this.state=this.readState();
  this.hp=150;this.sp=100;this.guardUntil=0;this.buffs=new Map();
  this.mission='ฟาร์มมอนสเตอร์ เก็บไอเทม และทดลองระบบ';
 }
 subscribe(fn){this.listeners.push(fn);}
 emit(){this.listeners.forEach(fn=>fn());}
 say(msg){this.notice(msg);this.emit();}
 readState(){
  let s=defaultState();
  try {
   const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
   if(saved && typeof saved==='object' && saved.version===1){
    s={...s,...saved};
    s.bag=Array.isArray(saved.bag)&&saved.bag.length===200?saved.bag.map(x=>this.items.has(x)?x:''):Array(200).fill('');
    s.storage=Array.isArray(saved.storage)&&saved.storage.length===200?saved.storage.map(x=>this.items.has(x)?x:''):Array(200).fill('');
    s.unlocked=Math.min(200,Math.max(40,Math.floor(Number(s.unlocked)||40)));
    s.unlocked=40+Math.floor((s.unlocked-40)/10)*10;
    s.level=Math.max(1,Math.min(999,Math.floor(Number(s.level)||1)));
    s.exp=Math.max(0,Math.floor(Number(s.exp)||0));
    s.statPoints=Math.max(0,Math.floor(Number(s.statPoints)||0));
    s.skillPoints=Math.max(0,Math.floor(Number(s.skillPoints)||0));
    s.secondsOnline=Math.max(0,Number(s.secondsOnline)||0);
    s.nextReward=Math.max(18000,Number(s.nextReward)||18000);
    s.job=this.jobs.has(saved.job)?saved.job:'Novice';
    s.attributes={...defaultState().attributes,...(saved.attributes||{})};
    for(const k of Object.keys(s.attributes)) s.attributes[k]=Math.max(1,Math.min(9999,Math.floor(Number(s.attributes[k])||10)));
    for(const kind of CURRENCIES){
     s.wallet[kind]=isAmount(saved.wallet?.[kind])?BigInt(saved.wallet[kind]).toString():'0';
     s.vault[kind]=isAmount(saved.vault?.[kind])?BigInt(saved.vault[kind]).toString():'0';
    }
    s.equipment={};
    for(const [slot,id] of Object.entries(saved.equipment||{})){
     if(EQUIP_SLOTS.includes(slot) && this.items.get(id)?.slot===slot)s.equipment[slot]=id;
    }
    s.hotbar=Array.isArray(saved.hotbar)&&saved.hotbar.length===3?saved.hotbar.map(id=>this.skills.has(id)?id:''):
      ['novice_slash','novice_rush','novice_guard'];
    s.passives={};
    for(const [id,level] of Object.entries(saved.passives||{})){
     if(this.skills.get(id)?.kind==='passive')s.passives[id]=Math.max(0,Math.min(10,Math.floor(Number(level)||0)));
    }
    s.position={x:Math.max(-65,Math.min(65,Number(saved.position?.x)||0)),
      z:Math.max(-65,Math.min(65,Number(saved.position?.z)||0))};
   }
  }catch(e){console.warn('Cannot parse saved LEOM preview character',e);}
  return s;
 }
 persist(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(this.state));}
  catch(e){console.warn('LEOM local save unavailable',e);}
  this.emit();
 }
 expRequired(){return 100+(this.state.level-1)*50;}
 bagUsed(){return this.state.bag.filter(Boolean).length;}
 storageUsed(){return this.state.storage.filter(Boolean).length;}
 emptyBag(){return this.state.bag.findIndex((v,i)=>i<this.state.unlocked&&!v);}
 emptyStorage(){return this.state.storage.findIndex(v=>!v);}
 fullItem(id){return this.items.get(id);}
 money(kind='gold',place='wallet'){return formatted(this.state[place]?.[kind]??'0');}
 credit(kind,amount,place='wallet'){
  if(!CURRENCIES.includes(kind)||!isAmount(String(amount)))return false;
  const n=parseAmount(this.state[place][kind])+BigInt(amount);
  if(n>CAP)return false;
  this.state[place][kind]=n.toString();this.persist();return true;
 }
 spend(kind,amount,place='wallet'){
  if(!CURRENCIES.includes(kind)||!isAmount(String(amount)))return false;
  let n=parseAmount(this.state[place][kind]),cost=BigInt(amount);
  if(n<cost)return false;
  this.state[place][kind]=(n-cost).toString();this.persist();return true;
 }
 transferMoney(kind,amount,withdraw=false){
  try{
   if(!CURRENCIES.includes(kind))throw new Error('ไม่พบสกุลเงิน');
   let value=parseAmount(String(amount).trim());
   if(value===0n)throw new Error('กรอกจำนวนมากกว่า 0');
   let from=withdraw?'vault':'wallet',to=withdraw?'wallet':'vault';
   let src=parseAmount(this.state[from][kind]),dst=parseAmount(this.state[to][kind]);
   if(src<value)throw new Error('เงินไม่พอ');
   if(dst+value>CAP)throw new Error('ปลายทางเกินเพดาน 21 หลัก');
   this.state[from][kind]=(src-value).toString();this.state[to][kind]=(dst+value).toString();
   this.persist();this.say(withdraw?'ถอนเงินสำเร็จ':'ฝากเงินสำเร็จ');return true;
  }catch(e){this.say(e.message);return false;}
 }
 addItem(id,n=1){
  if(!this.items.has(id)||!Number.isInteger(n)||n<1||n>200){this.say('ไม่มีไอเทมนี้');return false;}
  const empties=[];
  for(let i=0;i<this.state.unlocked;i++)if(!this.state.bag[i])empties.push(i);
  if(empties.length<n){this.say('กระเป๋าเต็ม');return false;}
  for(let i=0;i<n;i++)this.state.bag[empties[i]]=id;
  this.persist();this.say('ได้รับ '+this.items.get(id).name+(n>1?' x'+n:''));return true;
 }
 deposit(i){
  i=Number(i);if(i<0||i>=this.state.unlocked||!this.state.bag[i])return false;
  const index=this.emptyStorage();if(index<0){this.say('คลังเต็ม');return false;}
  this.state.storage[index]=this.state.bag[i];this.state.bag[i]='';this.persist();this.say('ฝากไอเทมแล้ว');return true;
 }
 withdraw(i){
  i=Number(i);if(i<0||i>=200||!this.state.storage[i])return false;
  const index=this.emptyBag();if(index<0){this.say('กระเป๋าเต็ม');return false;}
  this.state.bag[index]=this.state.storage[i];this.state.storage[i]='';this.persist();this.say('ถอนไอเทมแล้ว');return true;
 }
 sortBag(){
  const priority=(id)=>this.items.get(id)?.kind==='weapon'?0:this.items.get(id)?.kind==='armor'?1:2;
  const filled=this.state.bag.slice(0,this.state.unlocked).filter(Boolean).sort((a,b)=>priority(a)-priority(b)||a.localeCompare(b));
  for(let i=0;i<this.state.unlocked;i++)this.state.bag[i]=filled[i]||'';
  this.persist();this.say('เรียงไอเทมสำเร็จ');
 }
 deleteBag(i){
  i=Number(i);if(i<0||i>=this.state.unlocked||!this.state.bag[i])return false;
  this.state.bag[i]='';this.persist();this.say('ทิ้งไอเทมแล้ว');return true;
 }
 unlockScroll(){
  const i=this.state.bag.findIndex((id,i)=>i<this.state.unlocked&&id==='scroll');
  if(i<0||this.state.unlocked>=200){this.say('ไม่มี Bag +10 Scroll หรือปลดครบแล้ว');return false;}
  this.state.bag[i]='';this.state.unlocked+=10;this.persist();this.say('เปิดช่องกระเป๋าเพิ่ม 10');return true;
 }
 equip(i){
  i=Number(i);if(i<0||i>=this.state.unlocked)return false;
  const id=this.state.bag[i];const item=this.items.get(id);
  if(!item?.slot){this.say('ไอเทมนี้สวมใส่ไม่ได้');return false;}
  let previous=this.state.equipment[item.slot]||'';
  this.state.equipment[item.slot]=id;this.state.bag[i]=previous;
  this.persist();this.say('สวมใส่ '+item.name);return true;
 }
 unequip(slot){
  if(!EQUIP_SLOTS.includes(slot)||!this.state.equipment[slot])return false;
  const i=this.emptyBag();if(i<0){this.say('กระเป๋าเต็ม');return false;}
  this.state.bag[i]=this.state.equipment[slot];delete this.state.equipment[slot];
  this.persist();this.say('ถอดอุปกรณ์แล้ว');return true;
 }
 buy(id){
  const offer=this.offers.get(id);if(!offer||!this.items.has(id)){this.say('สินค้าไม่มี');return false;}
  const i=this.emptyBag();if(i<0){this.say('กระเป๋าเต็ม');return false;}
  const balance=parseAmount(this.state.wallet[offer.currency]),cost=parseAmount(offer.price);
  if(balance<cost){this.say('เงินไม่พอ');return false;}
  this.state.wallet[offer.currency]=(balance-cost).toString();
  this.state.bag[i]=id;this.persist();this.say('ซื้อ '+this.items.get(id).name+' สำเร็จ');return true;
 }
 sell(i){
  i=Number(i);if(i<0||i>=this.state.unlocked)return false;
  const id=this.state.bag[i],item=this.items.get(id);
  if(!item)return false;
  const amount=parseAmount(String(item.sell||'0'));
  let current=parseAmount(this.state.wallet.gold);
  if(current+amount>CAP){this.say('เงินทองเกินเพดาน 21 หลัก');return false;}
  this.state.bag[i]='';this.state.wallet.gold=(current+amount).toString();
  this.persist();this.say('ขาย '+item.name+' +'+amount+' Gold');return true;
 }
 use(i){
  i=Number(i);if(i<0||i>=this.state.unlocked)return false;
  const id=this.state.bag[i];
  const hp={hp_potion_small:30,hp_potion_medium:75,hp_potion_large:150,potion:50};
  const sp={sp_potion_small:25,sp_potion_medium:60,sp_potion_large:100};
  if(id in hp){this.hp=Math.min(this.maxHp(),this.hp+hp[id]);}
  else if(id in sp){this.sp=Math.min(100,this.sp+sp[id]);}
  else{this.say('ไอเทมนี้ยังไม่มีความสามารถกดใช้');return false;}
  this.state.bag[i]='';this.persist();this.say('ใช้ '+this.items.get(id).name);return true;
 }
 addExp(value){
  if(value<=0)return;
  this.state.exp+=Math.floor(value);
  while(this.state.exp>=this.expRequired() && this.state.level<999){
   this.state.exp-=this.expRequired();this.state.level++;
   this.state.statPoints++;this.state.skillPoints++;this.hp=this.maxHp();
   this.say('LEVEL UP! เลเวล '+this.state.level);
  }
  this.persist();
 }
 rewardMonster(exp,gold){
  this.state.pveKills++;this.addExp(exp);
  if(!this.credit('gold',String(gold)))this.say('Gold เต็ม 21 หลัก');
 }
 maxHp(){return 150+Math.max(0,this.effectiveStat('vitality')-10)*8;}
 effectiveStat(key){
  let amount=Number(this.state.attributes[key])||10;
  for(const [id,level] of Object.entries(this.state.passives)){
   const sk=this.skills.get(id);
   if(sk&&sk.job===this.state.job&&sk.statKey===key)amount+=sk.statAmount*level;
  }
  for(const [id,expires] of this.buffs){
   const sk=this.skills.get(id);
   if(sk&&sk.statKey===key&&performance.now()/1000<expires)amount+=sk.statAmount;
  }
  return amount;
 }
 addStat(key){
  if(!(key in this.state.attributes)||this.state.statPoints<1){this.say('แต้มค่าสถานะไม่พอ');return false;}
  this.state.attributes[key]++;this.state.statPoints--;this.persist();this.say('เพิ่ม '+key);return true;
 }
 promote(id){
  const job=this.jobs.get(id);
  if(!job||job.tier===0)return false;
  if(job.tier===1&&(this.state.level<10||this.state.job!=='Novice')){
   this.say('ต้องเป็น Novice เลเวล 10 ขึ้นไป');return false;
  }
  if(job.tier===2&&(this.state.level<50||this.state.classTier!==1||this.state.path!==job.path)){
   this.say('ต้องอยู่สายเดิมและเลเวล 50 ขึ้นไป');return false;
  }
  this.state.job=id;this.state.path=job.path;this.state.classTier=job.tier;
  this.state.hotbar=['','',''];this.persist();this.say('เปลี่ยนอาชีพเป็น '+job.nameEn);return true;
 }
 upgradePassive(id){
  const skill=this.skills.get(id);
  if(!skill||skill.job!==this.state.job||skill.kind!=='passive'){
   this.say('สกิลติดตัวไม่ตรงอาชีพ');return false;
  }
  const rank=Number(this.state.passives[id]||0);const cost=BigInt((rank+1)*200);
  if(rank>=10||this.state.skillPoints<1||parseAmount(this.state.wallet.gold)<cost){
   this.say('ต้องการ 1 SP และ '+cost+' Gold (ระดับสูงสุด 10)');return false;
  }
  this.state.wallet.gold=(parseAmount(this.state.wallet.gold)-cost).toString();
  this.state.skillPoints--;this.state.passives[id]=rank+1;
  this.persist();this.say('อัปเกรดสกิลติดตัว '+skill.nameEn);return true;
 }
 equipSkill(id,slot){
  const skill=this.skills.get(id);
  if(!skill||skill.job!==this.state.job||skill.kind==='passive'||slot<0||slot>2){
   this.say('เลือกได้เฉพาะสกิลที่กดใช้ได้ของอาชีพตนเอง');return false;
  }
  this.state.hotbar[slot]=id;this.persist();this.say('ติดตั้งสกิลในช่อง '+(slot+1));return true;
 }
 buff(id){
  const skill=this.skills.get(id);
  if(!skill||skill.kind!=='timed_buff'||skill.job!==this.state.job)return false;
  this.buffs.set(id,performance.now()/1000+Math.max(60,Math.min(180,skill.durationSeconds)));
  this.say('บัฟ '+skill.nameEn+' เริ่มแล้ว');return true;
 }
 tick(dt){
  const now=performance.now()/1000;
  this.sp=Math.min(100,this.sp+dt*14);
  for(const [id,expires] of this.buffs)if(now>=expires)this.buffs.delete(id);
  this.state.secondsOnline+=dt;
  if(this.state.unlocked<200&&this.state.secondsOnline>=this.state.nextReward){
   this.state.unlocked=Math.min(200,this.state.unlocked+10);
   this.state.nextReward+=18000;this.persist();this.say('ปลดล็อกช่องกระเป๋า +10 จากเวลาเล่น 5 ชั่วโมง');
  }
 }
}
