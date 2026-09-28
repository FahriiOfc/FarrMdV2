// plugins/game/raceway.js
// 🏁 HILL CLIMB RACING - Rich Message HTML Game

// ════════════════════════════════════════════════════════════
// ✅ HTML PAYLOAD
// ════════════════════════════════════════════════════════════
function createRaceHtml() {
  return `
<style>
*{
box-sizing:border-box;
-webkit-tap-highlight-color:transparent;
-webkit-user-select:none;
user-select:none;
margin:0;
padding:0;
}

html,
body{
width:100%;
overflow:hidden;
background:transparent;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
color:#fff;
}

.rwWrap{
width:100%;
padding:6px;
border:1px solid rgba(34,197,94,.18);
border-radius:22px;
background:#000;
box-shadow:
0 14px 34px rgba(0,0,0,.75),
inset 0 1px 0 rgba(255,255,255,.05);
}

.rwCard{
position:relative;
overflow:hidden;
border-radius:18px;
background:
radial-gradient(ellipse at top left, rgba(34,197,94,.18) 0%, transparent 55%),
radial-gradient(ellipse at bottom right, rgba(139,92,246,.10) 0%, transparent 55%),
linear-gradient(180deg,#0d1420 0%,#0b1220 55%,#060a12 100%);
display:flex;
flex-direction:column;
min-height:520px;
}

.page{
display:none;
flex-direction:column;
width:100%;
height:100%;
animation:pageFade .25s ease;
}

.page.active{display:flex;}

@keyframes pageFade{
from{opacity:0;transform:translateY(8px);}
to{opacity:1;transform:translateY(0);}
}

.rwHud{
display:flex;
align-items:center;
justify-content:space-between;
gap:8px;
padding:10px 12px;
background:rgba(0,0,0,.5);
border-bottom:1px solid rgba(255,255,255,.08);
flex-shrink:0;
}

.rwHudLeft{
display:flex;
gap:6px;
flex-wrap:wrap;
}

.rwHudRight{
display:flex;
flex-direction:column;
align-items:flex-end;
gap:4px;
}

.rwHudChip{
display:inline-flex;
align-items:center;
gap:5px;
padding:5px 9px;
border-radius:11px;
background:rgba(255,255,255,.06);
font:800 11px -apple-system,Arial,sans-serif;
letter-spacing:.4px;
border:1px solid rgba(255,255,255,.12);
}

.rwHudChip .ico{font-size:12px;}
.rwHudChip b{color:#fff;font-weight:900;}
.rwHudChip .lbl{color:rgba(255,255,255,.55);font-weight:700;font-size:9px;letter-spacing:.8px;text-transform:uppercase;}

.rwFuel{
width:90px;
height:7px;
border-radius:6px;
background:rgba(0,0,0,.6);
border:1px solid rgba(255,255,255,.15);
overflow:hidden;
padding:1px;
}

.rwFuelFill{
height:100%;
border-radius:4px;
background:linear-gradient(90deg,#f97316,#facc15);
transition:width .3s linear;
}

.rwCanvasWrap{
position:relative;
width:100%;
aspect-ratio:4 / 3;
background:#87CEEB;
flex-shrink:0;
overflow:hidden;
}

.rwCanvas{
display:block;
width:100%;
height:100%;
background:#87CEEB;
}

.rwControls{
display:flex;
gap:10px;
padding:10px 12px 12px;
background:rgba(0,0,0,.5);
border-top:1px solid rgba(255,255,255,.08);
flex-shrink:0;
}

.rwBtn{
flex:1;
height:60px;
border:none;
border-radius:14px;
font:900 14px -apple-system,Arial,sans-serif;
letter-spacing:2px;
color:#fff;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
box-shadow:0 6px 14px rgba(0,0,0,.4);
transition:transform .08s ease;
cursor:pointer;
touch-action:manipulation;
}

.rwBtn:active{transform:scale(.94);}

.rwBtnBrake{background:linear-gradient(180deg,#ef4444 0%,#b91c1c 100%);border:1px solid rgba(255,255,255,.18);}
.rwBtnGas{background:linear-gradient(180deg,#22c55e 0%,#15803d 100%);border:1px solid rgba(255,255,255,.18);}

.rwMenu{
padding:22px 16px 20px;
display:flex;
flex-direction:column;
align-items:center;
flex:1;
justify-content:flex-start;
}

.rwMenuTitle{
color:#fff;
font:900 24px -apple-system,Arial,sans-serif;
letter-spacing:-.4px;
text-align:center;
margin-bottom:4px;
text-shadow:0 4px 20px rgba(34,197,94,.35);
}

.rwMenuTitle .green{color:#22c55e;}

.rwMenuSubtitle{
color:rgba(255,255,255,.5);
font:700 10px -apple-system,Arial,sans-serif;
letter-spacing:2px;
text-transform:uppercase;
margin-bottom:22px;
text-align:center;
}

.rwLabel{
color:#facc15;
font:900 11px -apple-system,Arial,sans-serif;
letter-spacing:1.8px;
text-transform:uppercase;
align-self:flex-start;
margin-bottom:10px;
}

.rwGrid{
display:grid;
gap:10px;
width:100%;
margin-bottom:18px;
}

.rwGridCols2{grid-template-columns:repeat(2,1fr);}
.rwGridCols3{grid-template-columns:repeat(3,1fr);}

.rwSelCard{
position:relative;
padding:14px 10px;
border:1.5px solid rgba(255,255,255,.12);
border-radius:14px;
background:rgba(255,255,255,.045);
color:#fff;
text-align:center;
cursor:pointer;
transition:all .18s ease;
touch-action:manipulation;
-webkit-tap-highlight-color:rgba(34,197,94,.3);
}

.rwSelCard:active{transform:scale(.95);}

.rwSelCard.sel{
border-color:#22c55e;
background:rgba(34,197,94,.15);
box-shadow:0 0 20px rgba(34,197,94,.4);
}

.rwSelIcon{font-size:32px;margin-bottom:6px;line-height:1;}
.rwSelName{font:800 13px -apple-system,Arial,sans-serif;letter-spacing:.3px;margin-bottom:2px;}
.rwSelStat{font:700 9.5px -apple-system,Arial,sans-serif;color:rgba(255,255,255,.45);letter-spacing:.6px;text-transform:uppercase;}
.rwSelCard.sel .rwSelStat{color:rgba(34,197,94,.85);}

.rwInfo{
margin-top:8px;
padding:10px 14px;
border:1px solid rgba(255,255,255,.08);
border-radius:12px;
background:rgba(255,255,255,.03);
color:rgba(255,255,255,.55);
font:700 10.5px -apple-system,Arial,sans-serif;
letter-spacing:.5px;
text-align:center;
width:100%;
}

.rwInfo b{color:#22c55e;font-weight:900;}

.rwResult{
padding:22px 16px 20px;
display:flex;
flex-direction:column;
align-items:center;
flex:1;
justify-content:center;
}

.rwResultIcon{font-size:58px;margin-bottom:6px;filter:drop-shadow(0 0 20px rgba(250,204,21,.5));}
.rwResultTitle{font:900 24px -apple-system,Arial,sans-serif;letter-spacing:-.3px;margin-bottom:14px;}

.rwStatRow{
display:flex;
justify-content:space-between;
width:100%;
padding:11px 14px;
border:1px solid rgba(255,255,255,.09);
border-radius:12px;
background:rgba(255,255,255,.04);
font:800 13px -apple-system,Arial,sans-serif;
margin-bottom:8px;
}

.rwStatRow .lbl{
color:rgba(255,255,255,.5);
font-weight:700;
letter-spacing:.8px;
text-transform:uppercase;
font-size:10.5px;
}

.rwStatRow .val{color:#fff;font-weight:900;}
.rwStatRow.highlight .val{color:#22c55e;font-size:16px;}

.rwRetryRow{
display:flex;
gap:10px;
width:100%;
margin-top:8px;
}

.rwRetryBtn{
flex:1;
padding:14px;
border:none;
border-radius:13px;
font:900 12px -apple-system,Arial,sans-serif;
letter-spacing:1.5px;
color:#fff;
transition:transform .1s ease;
cursor:pointer;
touch-action:manipulation;
}

.rwRetryBtn:active{transform:scale(.96);}

.rwRetryAgain{background:linear-gradient(180deg,#3b82f6 0%,#1d4ed8 100%);}
.rwRetryMenu{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.15);}
</style>


<div class="rwWrap">
<div class="rwCard">

  <div class="page active" id="pageCar">
    <div class="rwMenu">
      <div class="rwMenuTitle">HILL <span class="green">CLIMB</span> RACING</div>
      <div class="rwMenuSubtitle">Langkah 1 dari 2</div>

      <div class="rwLabel">🚗 Pilih Mobil</div>
      <div class="rwGrid rwGridCols2" id="rwCars">
        <div class="rwSelCard" data-car="jeep" onclick="window.selectCar('jeep')">
          <div class="rwSelIcon">🚙</div>
          <div class="rwSelName">Jeep</div>
          <div class="rwSelStat">Balanced</div>
        </div>
        <div class="rwSelCard" data-car="sport" onclick="window.selectCar('sport')">
          <div class="rwSelIcon">🏎️</div>
          <div class="rwSelName">Sport</div>
          <div class="rwSelStat">Cepat</div>
        </div>
        <div class="rwSelCard" data-car="monster" onclick="window.selectCar('monster')">
          <div class="rwSelIcon">🚜</div>
          <div class="rwSelName">Monster</div>
          <div class="rwSelStat">Kuat</div>
        </div>
        <div class="rwSelCard" data-car="truck" onclick="window.selectCar('truck')">
          <div class="rwSelIcon">🚚</div>
          <div class="rwSelName">Truck</div>
          <div class="rwSelStat">Berat</div>
        </div>
      </div>

      <div class="rwInfo">👆 Ketuk mobil untuk lanjut pilih map</div>
    </div>
  </div>

  <div class="page" id="pageMap">
    <div class="rwMenu">
      <div class="rwMenuTitle">PILIH <span class="green">MAP</span></div>
      <div class="rwMenuSubtitle">Langkah 2 dari 2</div>

      <div class="rwInfo" style="margin-bottom:14px;" id="rwChosenCar">
        🚗 Mobil: <b id="rwChosenCarName">-</b>
      </div>

      <div class="rwLabel">🗺️ Pilih Map</div>
      <div class="rwGrid rwGridCols3" id="rwMaps">
        <div class="rwSelCard" data-map="countryside" onclick="window.selectMap('countryside')">
          <div class="rwSelIcon">⛰️</div>
          <div class="rwSelName">Countryside</div>
          <div class="rwSelStat">Easy</div>
        </div>
        <div class="rwSelCard" data-map="desert" onclick="window.selectMap('desert')">
          <div class="rwSelIcon">🏜️</div>
          <div class="rwSelName">Desert</div>
          <div class="rwSelStat">Medium</div>
        </div>
        <div class="rwSelCard" data-map="moon" onclick="window.selectMap('moon')">
          <div class="rwSelIcon">🌙</div>
          <div class="rwSelName">Moon</div>
          <div class="rwSelStat">Hard</div>
        </div>
      </div>

      <div class="rwInfo">👆 Ketuk map untuk mulai bermain</div>
    </div>
  </div>

  <div class="page" id="pageGame">
    <div class="rwHud">
      <div class="rwHudLeft">
        <div class="rwHudChip">
          <span class="ico">🏁</span>
          <span class="lbl">Jarak</span>
          <b id="rwDist">0 m</b>
        </div>
        <div class="rwHudChip">
          <span class="ico">🪙</span>
          <b id="rwCoins">0</b>
        </div>
      </div>
      <div class="rwHudRight">
        <div class="rwHudChip">
          <span class="lbl">Fuel</span>
          <b id="rwFuelTxt">100%</b>
        </div>
        <div class="rwFuel">
          <div class="rwFuelFill" id="rwFuelFill" style="width:100%"></div>
        </div>
      </div>
    </div>

    <div class="rwCanvasWrap" id="rwCanvasWrap">
      <canvas id="rwCanvas" class="rwCanvas" width="720" height="540"></canvas>
    </div>

    <div class="rwControls">
      <button class="rwBtn rwBtnBrake" id="rwBrake" 
        ontouchstart="window.pressBrake(true)" 
        ontouchend="window.pressBrake(false)" 
        onmousedown="window.pressBrake(true)" 
        onmouseup="window.pressBrake(false)" 
        onmouseleave="window.pressBrake(false)">⏪ REM</button>
      <button class="rwBtn rwBtnGas" id="rwGas" 
        ontouchstart="window.pressGas(true)" 
        ontouchend="window.pressGas(false)" 
        onmousedown="window.pressGas(true)" 
        onmouseup="window.pressGas(false)" 
        onmouseleave="window.pressGas(false)">GAS ⏩</button>
    </div>
  </div>

  <div class="page" id="pageResult">
    <div class="rwResult">
      <div class="rwResultIcon" id="rwResultIcon">🏆</div>
      <div class="rwResultTitle" id="rwResultTitle">GAME OVER</div>

      <div class="rwStatRow highlight">
        <span class="lbl">Jarak</span>
        <span class="val" id="rwResultDist">0 m</span>
      </div>
      <div class="rwStatRow">
        <span class="lbl">🪙 Koin</span>
        <span class="val" id="rwResultCoins">0</span>
      </div>
      <div class="rwStatRow">
        <span class="lbl">⭐ Skor</span>
        <span class="val" id="rwResultScore">0</span>
      </div>
      <div class="rwStatRow">
        <span class="lbl">🚗 Mobil</span>
        <span class="val" id="rwResultCar">-</span>
      </div>
      <div class="rwStatRow">
        <span class="lbl">🗺️ Map</span>
        <span class="val" id="rwResultMap">-</span>
      </div>

      <div class="rwRetryRow">
        <button class="rwRetryBtn rwRetryMenu" id="rwRetryMenu" onclick="window.retryMenu()">MENU</button>
        <button class="rwRetryBtn rwRetryAgain" id="rwRetryAgain" onclick="window.retryAgain()">ULANGI</button>
      </div>
    </div>
  </div>

</div>
</div>


<script>
(function(){

const CARS = {
  jeep:    { name:'Jeep',    color:'#22c55e', color2:'#166534', speed:1.00, mass:1.00, torque:1.00 },
  sport:   { name:'Sport',   color:'#ef4444', color2:'#7f1d1d', speed:1.35, mass:0.80, torque:0.90 },
  monster: { name:'Monster', color:'#a855f7', color2:'#581c87', speed:0.85, mass:1.30, torque:1.40 },
  truck:   { name:'Truck',   color:'#3b82f6', color2:'#1e3a8a', speed:0.90, mass:1.50, torque:1.15 },
}

const MAPS = {
  countryside: { name:'Countryside', sky:['#87CEEB','#c9e8ff'], ground:'#4a7c3a', ground2:'#2d4a22', hills:'#5a9c47', rough:1.0, gravity:1.00, bumps:0.06 },
  desert:      { name:'Desert',      sky:['#ffd89b','#ffb347'], ground:'#c2955a', ground2:'#8a6535', hills:'#d4a76a', rough:1.4, gravity:1.05, bumps:0.10 },
  moon:        { name:'Moon',        sky:['#0b0b28','#1a1a4a'], ground:'#5a5a7a', ground2:'#3a3a52', hills:'#7a7a9a', rough:1.8, gravity:0.55, bumps:0.14 },
}

const canvas = document.getElementById('rwCanvas')
const ctx = canvas.getContext('2d')
let W = canvas.width
let H = canvas.height

let gameState = 'menu'
let selectedCar = 'jeep'
let selectedMap = 'countryside'
let canvasReady = false

const physics = {
  x: 0, y: 0, vx: 0, vy: 0,
  angle: 0, angularVel: 0,
  distance: 0, coins: 0, fuel: 100,
  camX: 0, camY: 0,
  gas: false, brake: false,
  lastT: 0,
}

let terrain = []
let coinsList = []

function showPage(name){
  ['pageCar','pageMap','pageGame','pageResult'].forEach(id=>{
    document.getElementById(id).classList.remove('active')
  })
  document.getElementById(name).classList.add('active')
}

function syncCanvasSize(){
  const wrap = document.getElementById('rwCanvasWrap')
  if(!wrap) return
  const cssW = wrap.clientWidth
  const cssH = wrap.clientHeight
  if(cssW <= 0 || cssH <= 0) return

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const targetW = Math.floor(cssW * dpr)
  const targetH = Math.floor(cssH * dpr)
  if(canvas.width !== targetW || canvas.height !== targetH){
    canvas.width = targetW
    canvas.height = targetH
    W = targetW
    H = targetH
    canvasReady = true
    generateTerrain(selectedMap)
  }
}

function generateTerrain(mapKey){
  if(!canvasReady) return
  const map = MAPS[mapKey]
  terrain = []
  coinsList = []
  const segLen = 20
  const totalSegs = 800
  const seed1 = Math.random() * 1000
  const seed2 = Math.random() * 1000
  const freq = 0.02
  const amp = 30

  for (let i = 0; i < totalSegs; i++) {
    const x = i * segLen
    const h1 = Math.sin((i + seed1) * freq) * amp * map.rough
    const h2 = Math.sin((i + seed2) * freq * 2.7) * amp * 0.4 * map.rough
    const h3 = Math.sin((i + seed1) * freq * 0.35) * amp * 1.8
    const bump = (Math.random() - 0.5) * 100 * map.bumps
    const groundY = H * 0.65 - h1 - h2 - h3 - bump
    terrain.push({ x, y: groundY })
    if (i > 20 && i < totalSegs - 20 && Math.random() < 0.08) {
      coinsList.push({ x, y: groundY - 40, taken: false, spin: Math.random() * Math.PI * 2 })
    }
  }
}

function getGroundY(x){
  if(terrain.length < 2) return H * 0.65
  const segLen = 20
  const idx = Math.max(0, Math.min(terrain.length - 2, Math.floor(x / segLen)))
  const a = terrain[idx]
  const b = terrain[idx + 1] || a
  const t = (x - a.x) / segLen
  return a.y + (b.y - a.y) * t
}

function getCar(){
  const spec = CARS[selectedCar]
  return { w: 60, h: 26, wheelR: 12, wheelBase: 42, ...spec }
}

function resetGame(){
  if(!canvasReady) syncCanvasSize()
  generateTerrain(selectedMap)
  const car = getCar()
  physics.x = 100
  physics.y = getGroundY(100) - car.h - car.wheelR - 10
  physics.vx = 0
  physics.vy = 0
  physics.angle = 0
  physics.angularVel = 0
  physics.distance = 0
  physics.coins = 0
  physics.fuel = 100
  physics.camX = 0
  physics.camY = 0
  physics.gas = false
  physics.brake = false
  physics.lastT = performance.now()
}

function updatePhysics(dt){
  if (gameState !== 'playing') return
  if (!terrain.length) return

  const car = getCar()
  const map = MAPS[selectedMap]
  const GRAVITY = 1400 * map.gravity
  let forceX = 0
  let torque = 0

  if (physics.gas && physics.fuel > 0) {
    forceX += 900 * car.torque * car.speed / car.mass
    torque -= 0.9
    physics.fuel = Math.max(0, physics.fuel - 6 * dt)
  }
  if (physics.brake) {
    forceX -= 400 / car.mass
    torque += 0.7
    physics.fuel = Math.max(0, physics.fuel - 2 * dt)
  }

  physics.vy += GRAVITY * dt
  physics.vx += forceX * dt
  physics.angularVel += torque * dt * 3
  physics.angularVel *= 0.92
  physics.angle += physics.angularVel * dt * 3
  physics.x += physics.vx * dt
  physics.y += physics.vy * dt

  const groundY = getGroundY(physics.x)
  const carBottom = physics.y + car.h / 2 + car.wheelR

  if (carBottom >= groundY) {
    physics.y = groundY - car.h / 2 - car.wheelR
    const slope = (getGroundY(physics.x + 20) - getGroundY(physics.x - 20)) / 40
    const normalAngle = Math.atan(slope)
    const vn = physics.vx * Math.sin(normalAngle) - physics.vy * Math.cos(normalAngle)
    if (vn > 0) {
      physics.vx -= Math.sin(normalAngle) * vn * 1.3
      physics.vy -= Math.cos(normalAngle) * vn * 1.3
    }
    const targetAngle = -normalAngle
    physics.angle += (targetAngle - physics.angle) * 0.25
    physics.vx *= 0.985
    physics.vy *= 0.7
    physics.angularVel *= 0.6
  } else {
    physics.angle += physics.angularVel * dt * 2
  }

  physics.distance = Math.max(physics.distance, physics.x - 100)
  physics.camX = Math.max(0, physics.x - W * 0.35)
  physics.camY = Math.min(0, physics.y - H * 0.4)

  for (const c of coinsList) {
    if (c.taken) continue
    const dx = c.x - physics.x
    const dy = c.y - physics.y
    if (dx * dx + dy * dy < 2500) { c.taken = true; physics.coins++ }
    c.spin += dt * 3
  }

  if (physics.fuel <= 0 && Math.abs(physics.vx) < 20) { endGame('⛽', 'FUEL HABIS'); return }
  if (physics.y > H + 200) { endGame('💀', 'JATUH!'); return }
}

function render(){
  if (!canvasReady || !terrain.length) return

  const map = MAPS[selectedMap]
  const car = getCar()

  const sky = ctx.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, map.sky[0])
  sky.addColorStop(1, map.sky[1])
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = map.hills
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.moveTo(0, H)
  for (let x = 0; x <= W; x += 40) {
    const wx = x + physics.camX * 0.4
    const y = H * 0.55 + Math.sin(wx * 0.008) * 30 + Math.cos(wx * 0.015) * 15
    ctx.lineTo(x, y)
  }
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  const startIdx = Math.max(0, Math.floor(physics.camX / 20) - 5)
  const endIdx = Math.min(terrain.length - 1, startIdx + Math.ceil(W / 20) + 20)

  ctx.beginPath()
  ctx.moveTo(terrain[startIdx].x - physics.camX, terrain[startIdx].y - physics.camY)
  for (let i = startIdx; i <= endIdx; i++) {
    const p = terrain[i]
    ctx.lineTo(p.x - physics.camX, p.y - physics.camY)
  }
  ctx.lineTo(terrain[endIdx].x - physics.camX, H + 300 - physics.camY)
  ctx.lineTo(terrain[startIdx].x - physics.camX, H + 300 - physics.camY)
  ctx.closePath()

  const groundGrad = ctx.createLinearGradient(0, 0, 0, H)
  groundGrad.addColorStop(0, map.ground)
  groundGrad.addColorStop(1, map.ground2)
  ctx.fillStyle = groundGrad
  ctx.fill()

  ctx.strokeStyle = 'rgba(0,0,0,.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = startIdx; i <= endIdx; i++) {
    const p = terrain[i]
    const x = p.x - physics.camX
    const y = p.y - physics.camY
    if (i === startIdx) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  for (const c of coinsList) {
    if (c.taken) continue
    const x = c.x - physics.camX
    const y = c.y - physics.camY
    if (x < -50 || x > W + 50) continue
    const scale = Math.abs(Math.cos(c.spin))
    ctx.save()
    ctx.translate(x, y)
    ctx.scale(scale * 0.9 + 0.1, 1)
    ctx.beginPath()
    ctx.arc(0, 0, 12, 0, Math.PI * 2)
    ctx.fillStyle = '#facc15'
    ctx.fill()
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, 7, 0, Math.PI * 2)
    ctx.fillStyle = '#fde047'
    ctx.fill()
    ctx.fillStyle = '#a16207'
    ctx.font = 'bold 11px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('$', 0, 1)
    ctx.restore()
  }

  const carScreenX = physics.x - physics.camX
  const carScreenY = physics.y - physics.camY

  ctx.save()
  ctx.translate(carScreenX, carScreenY)
  ctx.rotate(physics.angle)

  ctx.fillStyle = 'rgba(0,0,0,.25)'
  ctx.beginPath()
  ctx.ellipse(0, car.h / 2 + car.wheelR + 4, car.w / 2 + 4, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  const bodyGrad = ctx.createLinearGradient(0, -car.h / 2, 0, car.h / 2)
  bodyGrad.addColorStop(0, car.color)
  bodyGrad.addColorStop(1, car.color2)
  ctx.fillStyle = bodyGrad
  ctx.strokeStyle = 'rgba(0,0,0,.5)'
  ctx.lineWidth = 2
  roundRect(ctx, -car.w / 2, -car.h / 2, car.w, car.h, 6)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = car.color2
  roundRect(ctx, -car.w / 4, -car.h / 2 - 12, car.w / 2, 14, 4)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = 'rgba(200,230,255,.85)'
  roundRect(ctx, -car.w / 4 + 3, -car.h / 2 - 10, car.w / 4 - 2, 10, 2)
  ctx.fill()
  roundRect(ctx, 0, -car.h / 2 - 10, car.w / 4 - 2, 10, 2)
  ctx.fill()

  ctx.fillStyle = '#fde047'
  ctx.beginPath()
  ctx.arc(car.w / 2 - 3, -2, 3, 0, Math.PI * 2)
  ctx.fill()

  drawWheel(ctx, car.w / 2 - car.wheelBase / 2, car.h / 2, car.wheelR)
  drawWheel(ctx, -car.w / 2 + car.wheelBase / 2, car.h / 2, car.wheelR)

  ctx.restore()

  if (physics.gas) {
    ctx.fillStyle = 'rgba(34,197,94,.85)'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('💨', carScreenX + 40, carScreenY - 40)
  }
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawWheel(ctx, x, y, r){
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = '#1a1a1a'
  ctx.fill()
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2)
  ctx.fillStyle = '#666'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x, y, r * 0.25, 0, Math.PI * 2)
  ctx.fillStyle = '#aaa'
  ctx.fill()
}

function loop(t){
  const dt = Math.min(0.033, (t - physics.lastT) / 1000) || 0.016
  physics.lastT = t
  if (gameState === 'playing') {
    updatePhysics(dt)
    updateHud()
  }
  if (gameState === 'playing') render()
  requestAnimationFrame(loop)
}

function updateHud(){
  document.getElementById('rwDist').textContent = Math.floor(physics.distance / 3) + ' m'
  document.getElementById('rwCoins').textContent = physics.coins
  const fuelPct = Math.max(0, physics.fuel)
  document.getElementById('rwFuelTxt').textContent = Math.floor(fuelPct) + '%'
  document.getElementById('rwFuelFill').style.width = fuelPct + '%'
}

function endGame(icon, title){
  gameState = 'over'
  const distance = Math.floor(physics.distance / 3)
  const score = distance + physics.coins * 10
  document.getElementById('rwResultIcon').textContent = icon
  document.getElementById('rwResultTitle').textContent = title
  document.getElementById('rwResultDist').textContent = distance + ' m'
  document.getElementById('rwResultCoins').textContent = physics.coins
  document.getElementById('rwResultScore').textContent = score
  document.getElementById('rwResultCar').textContent = CARS[selectedCar].name
  document.getElementById('rwResultMap').textContent = MAPS[selectedMap].name
  showPage('pageResult')
}

// ════════════════════════════════════════════════════════════
// ✅ GLOBAL FUNCTIONS (dipanggil dari onclick inline)
// ════════════════════════════════════════════════════════════

window.selectCar = function(carKey) {
  selectedCar = carKey;
  document.querySelectorAll('#rwCars .rwSelCard').forEach(c => c.classList.remove('sel'));
  const card = document.querySelector('#rwCars [data-car="' + carKey + '"]');
  if (card) card.classList.add('sel');
  document.getElementById('rwChosenCarName').textContent = CARS[selectedCar].name;
  showPage('pageMap');
};

window.selectMap = function(mapKey) {
  selectedMap = mapKey;
  document.querySelectorAll('#rwMaps .rwSelCard').forEach(c => c.classList.remove('sel'));
  const card = document.querySelector('#rwMaps [data-map="' + mapKey + '"]');
  if (card) card.classList.add('sel');
  showPage('pageGame');
  gameState = 'playing';
  requestAnimationFrame(() => {
    syncCanvasSize();
    resetGame();
    updateHud();
  });
};

window.pressGas = function(on) {
  physics.gas = on;
  const btn = document.getElementById('rwGas');
  if (btn) btn.style.filter = on ? 'brightness(1.25)' : '';
};

window.pressBrake = function(on) {
  physics.brake = on;
  const btn = document.getElementById('rwBrake');
  if (btn) btn.style.filter = on ? 'brightness(1.25)' : '';
};

window.retryMenu = function() {
  gameState = 'menu';
  showPage('pageCar');
};

window.retryAgain = function() {
  showPage('pageGame');
  gameState = 'playing';
  requestAnimationFrame(() => {
    syncCanvasSize();
    resetGame();
    updateHud();
  });
};

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'd') window.pressGas(true)
  if (e.key === 'ArrowLeft'  || e.key === 'a') window.pressBrake(true)
})
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'd') window.pressGas(false)
  if (e.key === 'ArrowLeft'  || e.key === 'a') window.pressBrake(false)
})

syncCanvasSize()
window.addEventListener('resize', syncCanvasSize)
setTimeout(syncCanvasSize, 100)
setTimeout(syncCanvasSize, 500)

physics.lastT = performance.now()
requestAnimationFrame(loop)

})()
</script>
`
}

// ════════════════════════════════════════════════════════════
// ✅ SEND RICH RACE
// ════════════════════════════════════════════════════════════
async function sendRichRace(conn, jid, html){
  const responseId = `raceway_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const payload = {
    response_id: responseId,
    sections: [{
      view_model: {
        primitive: {
          __typename: 'GenAIaeacdsnwHtmlPrimitive',
          payload: html,
          trusted_sources: []
        },
        __typename: 'GenAISingleLayoutViewModel'
      }
    }]
  }
  const message = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: { messageDisclaimerText: '', botResponseId: responseId }
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: 'Hill Climb Racing' }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify(payload)).toString('base64')
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: conn.user?.id || 'bot@whatsapp.net' },
            forwardOrigin: 4
          }
        }
      }
    }
  }
  await conn.relayMessage(jid, message, { messageId: responseId })
}

// ════════════════════════════════════════════════════════════
// ✅ HANDLER
// ════════════════════════════════════════════════════════════
let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🎮', key: m.key }
    })
  } catch (_) {}

  try {
    const html = createRaceHtml()
    await sendRichRace(conn, m.chat, html)

    try {
      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      })
    } catch (_) {}
  } catch (error) {
    console.error('[RACEWAY ERROR]', error)

    try {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })
    } catch (_) {}

    return conn.sendMessage(m.chat, {
      text: `❌ Gagal membuka game Raceway.\n\nDetail: ${error.message}`
    }, { quoted: m })
  }
}

handler.command = ['raceway', 'hillclimb', 'hillrace'];
handler.ownerOnly = false;
handler.premium = false;
handler.group = false;
handler.admin = false;

export default handler;
