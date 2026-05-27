const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const start = document.getElementById("start");
const gameScreen = document.getElementById("game");
const ending = document.getElementById("ending");
const play = document.getElementById("play");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const choices = document.getElementById("choices");
const hint = document.getElementById("hint");

const zoneUI = document.getElementById("zone");
const lifeUI = document.getElementById("life");
const objectiveUI = document.getElementById("objective");

const bossImg = new Image();
bossImg.src = "assets/avatar_boss.png";

const keys = {};
const W = canvas.width, H = canvas.height;
let camera = 0;
let puzzleIndex = 0;
let fragments = 3;
let bossWrong = 0;
let corruption = 0;
let inModal = false;
let current = null;

const player = {x:90,y:548,w:42,h:68,speed:5,facing:1};
const worldW = 2400;

const puzzles = [
 {zone:"Le Réel", objective:"Trouve le robot différent", x:310, title:"Les Trois Robots", text:"Trois robots gardent le chemin. Deux sont presque identiques. Un seul est différent. Observe leurs yeux : lequel ne ressemble pas aux autres ?", answers:[["Le robot de gauche",false],["Le robot du milieu",true],["Le robot de droite",false]], ok:"Le robot du milieu s’allume en bleu. Il te reconnaît.", fail:"Les robots se réécrivent. Tu perds tes fragments.", kind:"robots"},
 {zone:"Le Réel", objective:"Pose la boule sur le bon pilier", x:680, title:"Les Trois Piliers", text:"L’inscription dit : « Le vrai pilier ne regarde jamais l’ombre. » Un seul pilier n’a pas d’ombre. Où poses-tu la boule ?", answers:[["Pilier gauche",false],["Pilier du milieu",false],["Pilier droit",true]], ok:"La boule devient bleue. La pierre se souvient de toi.", fail:"La boule devient rouge. Les piliers changent.", kind:"pillars"},
 {zone:"L’Entre-Deux", objective:"Choisis le vrai miroir", x:1060, title:"La Salle des Reflets", text:"Tous les miroirs mentent sauf un. Le bon miroir est celui qui bouge exactement comme toi. Lequel choisis-tu ?", answers:[["Miroir gauche",false],["Miroir du milieu",true],["Miroir droit",false]], ok:"Le reflet sourit après toi, pas avant. La porte apparaît.", fail:"Ton reflet bouge trop tôt. Quelque chose s’est trompé dans le monde.", kind:"mirrors"},
 {zone:"L’Entre-Deux", objective:"Trouve la porte discrète", x:1440, title:"Les Portes Discrètes", text:"Le texte dit : « La vraie porte n’attend pas qu’on la regarde. » Une seule porte bouge quand tu détournes les yeux. Laquelle ?", answers:[["Porte gauche",false],["Porte du milieu",false],["Porte droite",true]], ok:"La porte droite s’ouvre toute seule, très doucement.", fail:"Les portes échangent leur place dans un bruit de verre.", kind:"doors"},
 {zone:"L’Artificiel", objective:"Écoute l’oiseau imparfait", x:1800, title:"Les Oiseaux Mécaniques", text:"Quatre oiseaux chantent. Trois répètent une boucle parfaite. Un seul fait une petite erreur, presque vivante. Lequel ?", answers:[["Premier oiseau",false],["Deuxième oiseau",false],["Troisième oiseau",true],["Quatrième oiseau",false]], ok:"L’oiseau imparfait bat des ailes comme un vrai.", fail:"La chanson devient trop parfaite. Elle n’a plus d’air.", kind:"birds"},
 {zone:"Boss Final", objective:"Résiste à l’Avatar", x:2180, title:"L’Avatar", text:"Je peux copier ton visage, ta voix et tes souvenirs. Qu’est-ce que je ne peux pas voler ?", answers:[["Le choix que je fais maintenant",true],["Mes pixels",false],["Ma vitesse",false],["Mon inventaire",false]], ok:"L’Avatar recule. Il peut copier ta forme, pas ton choix.", fail:"L’Avatar apprend. Le monde devient plus artificiel.", kind:"boss"}
];

play.onclick=()=>{start.classList.remove("active");gameScreen.classList.add("active")};
document.addEventListener("keydown",e=>{keys[e.key]=true;if(e.code==="Space"&&current&&!inModal)openPuzzle(puzzles[puzzleIndex])});
document.addEventListener("keyup",e=>keys[e.key]=false);

function openPuzzle(p){
 inModal=true; modal.classList.remove("hidden"); modalTitle.textContent=p.title; modalText.textContent=p.text; choices.innerHTML="";
 p.answers.forEach(([label,good])=>{const b=document.createElement("button");b.textContent=label;b.onclick=()=>answer(p,good);choices.appendChild(b)});
}
function answer(p,good){
 if(good){
  modalText.textContent=p.ok; choices.innerHTML="";
  const b=document.createElement("button"); b.textContent=p.kind==="boss"?"Finir":"Continuer";
  b.onclick=()=>{modal.classList.add("hidden");inModal=false;if(p.kind==="boss"){gameScreen.classList.remove("active");ending.classList.add("active")}else{puzzleIndex++;fragments=3;player.x+=120}};
  choices.appendChild(b); return;
 }
 corruption++; canvas.classList.add("glitch"); setTimeout(()=>canvas.classList.remove("glitch"),900);
 if(p.kind==="boss"){bossWrong++;fragments=Math.max(0,fragments-1); if(bossWrong>=3){modalText.textContent="Le monde devient entièrement artificiel. Réinitialisation. Ton humanité reste non vérifiée.";choices.innerHTML="";const r=document.createElement("button");r.textContent="Recommencer le combat";r.onclick=()=>{bossWrong=0;fragments=3;modal.classList.add("hidden");inModal=false;player.x=2100};choices.appendChild(r);return;}}
 else fragments=0;
 modalText.textContent=p.fail+" L’énigme revient dans une autre version."; choices.innerHTML="";
 const retry=document.createElement("button"); retry.textContent="Réessayer"; retry.onclick=()=>{fragments=3;modal.classList.add("hidden");inModal=false}; choices.appendChild(retry);
}

function update(){
 if(!inModal){
  if(keys.ArrowRight){player.x+=player.speed;player.facing=1}
  if(keys.ArrowLeft){player.x-=player.speed;player.facing=-1}
 }
 player.x=Math.max(60,Math.min(worldW-80,player.x));
 camera=Math.max(0,Math.min(worldW-W,player.x-W/2));
 const p=puzzles[puzzleIndex]||puzzles[puzzles.length-1];
 zoneUI.textContent=p.zone; objectiveUI.textContent=p.objective; lifeUI.textContent=fragments+"/3";
 current = Math.abs(player.x-p.x)<105 ? p : null;
 hint.classList.toggle("show",!!current&&!inModal);
}

function draw(){
 const p=puzzles[puzzleIndex]||puzzles[puzzles.length-1];
 sky(p.zone); distant(p.zone); temples(); ground(); puzzles.forEach((q,i)=>{if(i<=puzzleIndex)drawPuzzle(q,i===puzzleIndex)}); hero(); effects();
}
function sky(zone){
 const g=ctx.createLinearGradient(0,0,0,H);
 const maps={
  "Le Réel":["#87b9c7","#e8bb7e","#17223d"],
  "L’Entre-Deux":["#4b3769","#9271a8","#151933"],
  "L’Artificiel":["#063650","#097195","#070b16"],
  "Boss Final":["#16091f","#3c143f","#05050a"]
 };
 const m=maps[zone]||maps["Le Réel"]; g.addColorStop(0,m[0]);g.addColorStop(.55,m[1]);g.addColorStop(1,m[2]); ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.fillStyle="rgba(255,226,160,.35)"; ctx.beginPath(); ctx.arc(930-camera*.04,130,70,0,Math.PI*2); ctx.fill();
}
function distant(zone){
 ctx.save();ctx.translate(-camera*.25,0);
 for(let i=-2;i<20;i++){
  const x=i*170, h=180+(i%4)*60;
  ctx.fillStyle=zone==="Le Réel"?"rgba(35,82,70,.35)":"rgba(22,18,45,.48)";
  ctx.beginPath();ctx.moveTo(x,500);ctx.lineTo(x+55,300-h*.3);ctx.lineTo(x+120,500);ctx.fill();
 }
 ctx.restore();
}
function temples(){
 ctx.save();ctx.translate(-camera*.55,0);
 for(let i=0;i<12;i++){
  const x=i*260+40;
  ctx.fillStyle="rgba(18,22,38,.45)"; ctx.fillRect(x,260,120,260);
  ctx.fillStyle="rgba(255,215,137,.13)";
  for(let j=0;j<3;j++)ctx.fillRect(x+22+j*30,300,12,150);
  ctx.strokeStyle="rgba(255,215,137,.18)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+60,260,58,Math.PI,0);ctx.stroke();
 }
 ctx.restore();
}
function ground(){
 ctx.save();ctx.translate(-camera,0);ctx.fillStyle="#26324a";ctx.fillRect(0,610,worldW,110);
 ctx.fillStyle="rgba(255,215,137,.18)";for(let i=0;i<90;i++)ctx.fillRect(i*34,610,22,3);
 ctx.restore();
}
function drawPuzzle(p,active){
 const x=p.x-camera, y=520;
 ctx.save();
 if(active){ctx.shadowColor="#8df5ff";ctx.shadowBlur=18}
 if(p.kind==="robots")robots(x,y);
 if(p.kind==="pillars")pillars(x,y);
 if(p.kind==="mirrors")mirrors(x,y);
 if(p.kind==="doors")doors(x,y);
 if(p.kind==="birds")birds(x,y);
 if(p.kind==="boss")boss(x,y);
 ctx.restore();
}
function robots(x,y){for(let i=0;i<3;i++){ctx.fillStyle="#6e7883";roundRect(x-55+i*55,y-70,38,62,10);ctx.fill();ctx.fillStyle=i===1?"#80f7ff":"#ffd789";ctx.beginPath();ctx.arc(x-36+i*55,y-50,i===1?8:4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#2a3445";ctx.strokeRect(x-50+i*55,y-25,28,12)}}
function pillars(x,y){ctx.fillStyle="#d4bd82";ctx.beginPath();ctx.arc(x,y-105,18,0,Math.PI*2);ctx.fill();for(let i=0;i<3;i++){ctx.fillStyle="#8b8064";ctx.fillRect(x-70+i*70,y-76,36,76);if(i!==2){ctx.fillStyle="rgba(0,0,0,.28)";ctx.fillRect(x-50+i*70,y-8,50,8)}}}
function mirrors(x,y){for(let i=0;i<3;i++){ctx.strokeStyle="#ffd789";ctx.lineWidth=5;ctx.strokeRect(x-72+i*72,y-96,48,92);ctx.fillStyle=i===1?"rgba(116,226,255,.35)":"rgba(132,85,165,.32)";ctx.fillRect(x-68+i*72,y-92,40,84)}}
function doors(x,y){for(let i=0;i<3;i++){ctx.fillStyle=i===2?"#315f7a":"#4a3355";roundRect(x-80+i*80,y-108,54,108,10);ctx.fill();ctx.fillStyle="#ffd789";ctx.beginPath();ctx.arc(x-42+i*80,y-52,4,0,Math.PI*2);ctx.fill()}}
function birds(x,y){for(let i=0;i<4;i++){ctx.strokeStyle=i===2?"#83ffe0":"#ffd789";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-86+i*56,y-66);ctx.quadraticCurveTo(x-68+i*56,y-94,x-50+i*56,y-66);ctx.stroke();ctx.fillStyle="rgba(255,255,255,.16)";ctx.fillRect(x-74+i*56,y-58,16,32)}}
function boss(x,y){
 if(bossImg.complete) ctx.drawImage(bossImg,x-150,y-255,300,245);
 ctx.fillStyle="rgba(226,75,118,.35)";for(let i=0;i<8;i++)ctx.fillRect(x-120+Math.random()*240,y-210+Math.random()*170,4,35);
}
function hero(){
 const x=player.x-camera,y=player.y;ctx.save();ctx.translate(x,y);ctx.scale(player.facing,1);
 ctx.fillStyle="#20364a";roundRect(-20,-42,40,54,13);ctx.fill();
 ctx.fillStyle="#f2c894";ctx.beginPath();ctx.arc(0,-58,20,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#201927";ctx.beginPath();ctx.arc(-4,-66,20,Math.PI,Math.PI*2);ctx.fill();
 ctx.fillStyle="#d8b36e";ctx.fillRect(-24,10,14,36);ctx.fillRect(10,10,14,36);
 ctx.fillStyle="#78dff0";ctx.beginPath();ctx.arc(7,-58,3,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function effects(){if(corruption<1)return;for(let i=0;i<corruption*10;i++){ctx.fillStyle=i%2?"rgba(255,60,120,.22)":"rgba(92,230,255,.17)";ctx.fillRect(Math.random()*W,Math.random()*H,30+Math.random()*90,2)}}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function loop(){update();draw();requestAnimationFrame(loop)}
loop();
