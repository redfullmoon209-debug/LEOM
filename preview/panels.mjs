// Temporary LEOM browser UI: no paid services and no original FBX/maps.
import {CURRENCIES,EQUIP_SLOTS,formatted,escapeHtml} from './rpg.mjs';
const $=(id)=>document.getElementById(id);
const h=escapeHtml;
const label=(item)=>item?.name||item?.id||'';
const group=(children)=>'<div class="list">'+children+'</div>';
const button=(action,name,attrs='')=>'<button data-action="'+h(action)+'" '+attrs+'>'+name+'</button>';
const moneyLabel={gold:'ทอง Gold',blue:'เพชรน้ำเงิน',purple:'เพชรม่วง',green:'เพชรเขียว'};
const defName={strength:'STR',vitality:'VIT',agility:'AGI',intelligence:'INT',dexterity:'DEX',luck:'LUK'};
export function createUI(rpg,game){
 let current='',bagPage=0,bankPage=0,selectedBag=-1,selectedBank=-1;
 let chosenOffer='',skillSlot=0,chosenCurrency='gold',currencyAmount='100',locale='th';
 let confirmAction=null,confirmedMsg='';
 const panel=$('panel'),body=$('panel-body');
 const menuButtons=[...document.querySelectorAll('[data-panel]')];
 const titles={bag:'🎒 กระเป๋า',bank:'🏦 คลังและเงิน',shop:'🛒 ร้านค้าทดสอบ',gear:'🛡️ อุปกรณ์',char:'✨ ตัวละครและอาชีพ',skills:'⚡ สกิล',map:'🗺️ แผนที่ทดสอบ'};
 function show(name){
  if(current===name){close();return;}
  current=name;panel.classList.remove('hidden');menuButtons.forEach(b=>b.classList.toggle('active',b.dataset.panel===name));
  render();
 }
 function close(){current='';panel.classList.add('hidden');menuButtons.forEach(b=>b.classList.remove('active'));hideConfirm();}
 function isOpen(){return current!==''||confirmAction!==null;}
 function ask(text,fn){
  confirmAction=fn;confirmedMsg=text;$('confirm-text').textContent=text;$('confirm').classList.remove('hidden');
 }
 function hideConfirm(){confirmAction=null;$('confirm').classList.add('hidden');}
 $('confirm-yes').addEventListener('click',()=>{const fn=confirmAction;hideConfirm();if(fn)fn();render();});
 $('confirm-no').addEventListener('click',hideConfirm);
 $('close-panel').addEventListener('click',close);
 menuButtons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.panel)));
 window.addEventListener('keydown',e=>{
  if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){
   if(e.key==='Escape')document.activeElement.blur();
   return;
  }
  if(e.key.toLowerCase()==='b')show('bag');
  if(e.key.toLowerCase()==='k')show('skills');
  if(e.key.toLowerCase()==='c')show('char');
  if(e.key==='Escape')close();
 });
 function pageNav(page,count,type){
  return '<div class="page">'+button('page','◀ ก่อนหน้า','data-type="'+type+'" data-direction="-1"')+
   '<span class="pill">หน้า '+(page+1)+' / '+count+'</span>'+
   button('page','ถัดไป ▶','data-type="'+type+'" data-direction="1"')+'</div>';
 }
 function gridSlots(slots,from,unlocked,selected,kind){
  let cells='';
  for(let i=0;i<50;i++){
   const index=from+i,locked=index>=unlocked,id=slots[index];
   const item=id?rpg.fullItem(id):null;
   cells+='<button class="slot'+(locked?' locked':'')+(selected===index?' selected':'')+
     '" data-action="'+(kind==='bag'?'choosebag':'choosebank')+'" data-index="'+index+'" '+(locked?'disabled':'')+
     ' title="'+h(item?.name||'ช่อง '+(index+1))+'"><b>#'+(index+1)+'</b>'+
     (locked?'🔒':id?h(item?.name||id):'·')+'</button>';
  }
  return '<div class="grid-items">'+cells+'</div>';
 }
 function bag(){
  const s=rpg.state;
  let id=selectedBag>=0&&selectedBag<s.unlocked?s.bag[selectedBag]:'';
  let item=id?rpg.fullItem(id):null;
  return '<div class="panel-grid"><div><div class="section-title">ช่อง '+rpg.bagUsed()+' / '+s.unlocked+
    ' (ทั้งหมด 200)</div>'+gridSlots(s.bag,bagPage*50,s.unlocked,selectedBag,'bag')+
    pageNav(bagPage,4,'bag')+'</div><div class="side"><div class="item-title">'+
    (item?h(item.name):'เลือกไอเทมในช่อง')+'</div><div class="small">'+(item?h(item.kind+' / '+(item.slot||'ทั่วไป')):'')+'</div>'+
    button('equip','สวมใส่',item?.slot?'':'disabled')+
    button('deposit','ฝากเข้าคลัง',item?'':'disabled')+
    button('use','ใช้ไอเทม',item?'':'disabled')+
    button('sellbag','ขายไอเทม',item?'':'disabled')+
    button('trash','ทิ้งไอเทม',item?'':'disabled')+
    button('sort','เรียงของ')+
    button('scroll','ใช้คัมภีร์ +10')+
    '<p class="small">เล่นครบทุก 5 ชั่วโมง เปิดกระเป๋าเพิ่ม 10 ช่อง</p></div></div>';
 }
 function bank(){
  const s=rpg.state;
  let inner='<div class="section-title">คลัง '+rpg.storageUsed()+' / 200 · กระเป๋า '+rpg.bagUsed()+
    ' / '+s.unlocked+'</div><div class="panel-grid"><div><div class="small">คลัง 50 ช่องต่อหน้า</div>'+
    gridSlots(s.storage,bankPage*50,200,selectedBank,'bank')+
    pageNav(bankPage,4,'bank')+'</div><div class="side"><div class="item-title">ฝาก / ถอนสิ่งของ</div>'+
    '<div class="small">ช่องคลังที่เลือก: '+(selectedBank+1)+'</div>'+
    '<div class="small">ช่องกระเป๋าที่เลือก: '+(selectedBag+1)+'</div>'+
    button('withdraw','ถอนของที่เลือก')+
    button('deposit','ฝากของจากกระเป๋า')+
    button('openbag','เลือกของในกระเป๋า')+'</div></div>';
  inner+='<h3 class="section-title">ตู้ฝากเงิน 4 สกุล (สูงสุด 21 หลักต่อบัญชี)</h3>'+
    '<div class="wallet">'+CURRENCIES.map(k=>'<div class="money"><strong>'+h(moneyLabel[k])+
    '</strong>กระเป๋า: '+rpg.money(k)+'<div class="small">คลัง: '+rpg.money(k,'vault')+'</div></div>').join('')+'</div>'+
    '<div class="line"><label for="money-currency">สกุลเงิน</label><select class="amount" id="money-currency">'+
    CURRENCIES.map(k=>'<option value="'+k+'" '+(k===chosenCurrency?'selected':'')+'>'+h(moneyLabel[k])+'</option>').join('')+
    '</select></div><input class="amount" id="money-value" inputmode="numeric" placeholder="จำนวนเงิน" value="'+h(currencyAmount)+'">'+
    '<div class="line">'+button('depositmoney','ฝากเงิน')+button('withdrawmoney','ถอนเงิน')+'</div>';
  return inner;
 }
 function shop(){
  const offers=rpg.catalog.offers;
  let offer=rpg.offers.get(chosenOffer)||offers[0],data=rpg.fullItem(offer.id);
  return '<p class="muted">ร้าน NPC ทดสอบ · ข้อมูลสินค้าเดิม 21 รายการ (โครงรองรับ 500 ช่อง) · ทำธุรกรรมในเบราว์เซอร์นี้เท่านั้น</p>'+
  '<div class="panel-grid"><div>'+group(offers.map(x=>{
    const item=rpg.fullItem(x.id);
    return '<div class="list-card"><span class="item-name">'+h(item?.name||x.id)+'</span>'+
      '<span class="pill">'+formatted(x.price)+' Gold</span>'+
      button('chooseoffer','เลือก','data-id="'+h(x.id)+'"')+'</div>';
  }).join(''))+'</div><div class="side"><div class="item-title">'+h(data?.name||offer.id)+'</div>'+
  '<p class="small">ราคาซื้อ: '+formatted(offer.price)+' Gold</p>'+
  '<p class="small">ราคาขาย: '+formatted(offer.sell)+' Gold</p>'+
  '<p class="small">ทองคงเหลือ: '+rpg.money('gold')+'</p>'+button('buy','ซื้อ 1 ชิ้น','data-id="'+h(offer.id)+'"')+
  '<p class="small">ขายของที่เลือกจากหน้ากระเป๋า</p>'+button('sellbag','ขายของที่เลือก')+'</div></div>';
 }
 function gear(){
  return '<p class="muted">อุปกรณ์ 23 ตำแหน่งรวมชุดแฟชั่น · คลิกเพื่อถอดลงกระเป๋า</p>'+
   group(EQUIP_SLOTS.map(slot=>'<div class="list-card"><span class="item-name">'+h(slot)+'</span>'+
     '<span class="pill">'+h(rpg.state.equipment[slot]?rpg.fullItem(rpg.state.equipment[slot])?.name||'':'ว่าง')+'</span>'+
     button('unequip','ถอด','data-slot="'+h(slot)+'" '+(rpg.state.equipment[slot]?'':'disabled'))+
   '</div>').join(''));
 }
 function character(){
  const s=rpg.state;
  let attrs='<div class="section-title">ตัวละคร '+h(s.name)+' · Lv '+s.level+' · '+h(s.job)+'</div>'+
    '<div class="small">แต้มสเตตัส: '+s.statPoints+' · แต้มสกิล: '+s.skillPoints+
    ' · ฆ่ามอนสเตอร์: '+s.pveKills+'</div>'+
    group(Object.keys(s.attributes).map(key=>'<div class="list-card"><span class="item-name">'+
       h(defName[key])+' '+rpg.effectiveStat(key)+'</span>'+button('addstat','+1','data-id="'+key+'" '+(s.statPoints<1?'disabled':''))+
    '</div>').join(''));
  return '<div class="panel-grid"><div>'+attrs+'</div><div><div class="section-title">เปลี่ยนอาชีพ</div>'+
    '<p class="small">Tier 1 เลเวล 10 · Tier 2 เลเวล 50 ตามสายเดิม</p>'+
    group(rpg.catalog.jobs.map(job=>'<div class="list-card"><span class="item-name">'+
       h(locale==='th'?job.nameTh:job.nameEn)+' <span class="pill">T'+job.tier+'</span></span>'+
       button('job','เลือก','data-id="'+h(job.id)+'" '+(job.tier===0?'disabled':''))+'</div>').join(''))+
    '</div></div>';
 }
 function skills(){
  const s=rpg.state;
  const ids=s.hotbar.map((id,i)=>'<span class="pill" style="margin:4px">'+(i+1)+': '+
    h(rpg.skills.get(id)?.nameEn||'empty')+'</span>').join(' ');
  const list=rpg.catalog.skills.filter(sk=>sk.job===s.job);
  return '<p class="muted">คลังสกิลเดิม 171 รายการ · โจมตีได้จริงเฉพาะสกิล Novice 3 ท่า · บัฟ/Passive ทดลองได้</p>'+
    '<p>'+ids+'</p><div class="line"><span>ช่อง Hotbar ที่จะติดตั้ง</span><select id="skill-slot" class="amount">'+
    [0,1,2].map(i=>'<option value="'+i+'" '+(i===skillSlot?'selected':'')+'>'+(i+1)+'</option>').join('')+'</select></div>'+
    group(list.map(sk=>'<div class="list-card"><span class="item-name">'+
    h(locale==='th'?sk.nameTh:sk.nameEn)+' <span class="pill">'+h(sk.kind)+'</span>'+
    (sk.kind==='passive'?' Lv '+(s.passives[sk.id]||0)+'/10':'')+
    (sk.kind==='active'&&!sk.implemented?' <span class="bad">(ยังไม่เปิดใช้)</span>':'')+'</span>'+
    '<div class="buttons">'+button(sk.kind==='passive'?'passive':'cast',sk.kind==='passive'?'อัปเกรด':'ใช้','data-id="'+h(sk.id)+'"')+
    (sk.kind!=='passive'?button('equiphot','ติดตั้ง','data-id="'+h(sk.id)+'"'):'')+'</div></div>').join(''));
 }
 function map(){
  return '<div class="section-title">LEOM Temp World (3D)</div>'+
   '<p class="muted">แผนที่และตัวละครสร้างด้วยรูปทรง 3D เพื่อทดสอบระบบ ไม่ใช้แผนที่/FBX เดิม</p>'+
   '<div class="line">🌾 ศูนย์กลาง (0,0) <span>ฟาร์มมอนสเตอร์ / EXP / ของดรอป</span></div>'+
   '<div class="line">🏠 ทางตะวันตกเฉียงใต้ (-31,-16) <span>เมืองปลอดภัย, NPC ร้านค้าและคลัง</span></div>'+
   '<div class="line">⚔️ ทางตะวันออกเฉียงเหนือ (32,31) <span>สนาม Arena จำลอง ยังไม่ออนไลน์</span></div>'+
   '<div class="line">🏰 ทางตะวันตกเฉียงเหนือ (-34,35) <span>Guild War จำลอง ยังไม่ออนไลน์</span></div>'+
   '<p class="small">เปิด PK / Arena 1v1,3v3,5v5 / Guild Wars ต้องใช้เซิร์ฟเวอร์จริง ไม่ได้เปิดในตัวอย่างนี้</p>'+
   '<p class="small">WASD เดิน, T เลือกเป้า, J ตี, Q ออโต้, E เก็บ, 1-3 สกิล</p>'+
   '<div class="line">'+button('save','บันทึกตัวละคร')+
   button('locale','ภาษา: '+(locale==='th'?'ไทย':'EN'))+'</div>';
 }
 function render(){
  if(!current)return;
  $('panel-title').textContent=titles[current]||current;
  body.innerHTML=({bag,bank,shop,gear,char:character,skills,map})[current]?.()||'';
  if(current==='bank'){
   $('money-currency')?.addEventListener('change',e=>{chosenCurrency=e.target.value});
   $('money-value')?.addEventListener('input',e=>{currencyAmount=e.target.value});
  }
  if(current==='skills')$('skill-slot')?.addEventListener('change',e=>{skillSlot=+e.target.value;});
 }
 body.addEventListener('click',e=>{
  const b=e.target.closest('[data-action]');if(!b||!body.contains(b))return;
  const act=b.dataset.action,idx=Number(b.dataset.index),id=b.dataset.id,slot=b.dataset.slot,s=rpg.state;
  const picked=()=>selectedBag>=0&&selectedBag<s.unlocked?s.bag[selectedBag]:'';
  const idName=(v)=>rpg.fullItem(v)?.name||v;
  switch(act){
   case 'choosebag':selectedBag=idx;break;
   case 'choosebank':selectedBank=idx;break;
   case 'chooseoffer':chosenOffer=id;break;
   case 'page':{
    const n=Number(b.dataset.direction)||0;
    if(b.dataset.type==='bag')bagPage=Math.max(0,Math.min(3,bagPage+n));
    else bankPage=Math.max(0,Math.min(3,bankPage+n));
    break;
   }
   case 'openbag':show('bag');return;
   case 'sort':rpg.sortBag();break;
   case 'scroll':rpg.unlockScroll();break;
   case 'deposit':rpg.deposit(selectedBag);break;
   case 'withdraw':rpg.withdraw(selectedBank);break;
   case 'equip':rpg.equip(selectedBag);break;
   case 'unequip':rpg.unequip(slot);break;
   case 'use':rpg.use(selectedBag);break;
   case 'trash':if(picked()){const previous=picked(),index=selectedBag;
    ask('ทิ้ง '+idName(previous)+' ถาวร?',()=>{if(s.bag[index]===previous)rpg.deleteBag(index);});}break;
   case 'sellbag':if(picked()){const previous=picked(),index=selectedBag;
    ask('ขาย '+idName(previous)+' รับ '+formatted(rpg.fullItem(previous)?.sell||'0')+' Gold?',
     ()=>{if(s.bag[index]===previous)rpg.sell(index);});}else rpg.say('เลือกไอเทมในหน้ากระเป๋าก่อน');break;
   case 'buy':rpg.buy(id);break;
   case 'depositmoney':rpg.transferMoney(chosenCurrency,currencyAmount,false);break;
   case 'withdrawmoney':rpg.transferMoney(chosenCurrency,currencyAmount,true);break;
   case 'addstat':rpg.addStat(id);break;
   case 'job':ask('เลือกอาชีพ '+rpg.jobs.get(id)?.nameEn+'?',()=>rpg.promote(id));break;
   case 'passive':rpg.upgradePassive(id);break;
   case 'equiphot':rpg.equipSkill(id,skillSlot);break;
   case 'cast':game.cast(id,true);break;
   case 'save':rpg.persist();rpg.say('บันทึกเกมในเบราว์เซอร์นี้');break;
   case 'locale':locale=locale==='th'?'en':'th';break;
  }
  render();
 });
 rpg.subscribe(()=>{if(current)render();});
 function updateHUD(){
  const s=rpg.state;
  $('charname').textContent=s.name;$('job').textContent=rpg.jobs.get(s.job)?.nameEn||s.job;
  $('level').textContent='Lv '+s.level;
  const hpMax=rpg.maxHp(),spMax=100,exMax=rpg.expRequired();
  $('hp-fill').style.width=Math.max(0,Math.min(100,rpg.hp/hpMax*100))+'%';
  $('hp-label').textContent='HP '+Math.ceil(rpg.hp)+' / '+hpMax;
  $('sp-fill').style.width=Math.max(0,Math.min(100,rpg.sp/spMax*100))+'%';
  $('sp-label').textContent='SP '+Math.ceil(rpg.sp)+' / 100';
  $('exp-fill').style.width=Math.max(0,Math.min(100,s.exp/exMax*100))+'%';
  $('exp-label').textContent='EXP '+s.exp+'/'+exMax;
  $('gold').textContent='GOLD '+rpg.money('gold');
  $('bag-stat').textContent='BAG '+rpg.bagUsed()+'/'+s.unlocked;
  $('target').textContent=game.targetName();
  $('zone').textContent='• '+game.zoneName();
  $('auto-btn').classList.toggle('active',game.auto);
 }
 return {show,close,isOpen,updateHUD};
}
