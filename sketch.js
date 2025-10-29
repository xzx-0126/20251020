let circles = []; 
let colors = ['#ca6effff', '#ffb0c3ff', '#ff5090ff', '#ad55ffff', '#fc6bbbff']; 
let particles = []; // 全域粒子陣列，用來管理所有爆破粒子
let score = 0; // 玩家得分

function setup() { //setup函式只會執行函式只會執行一次
  
  //建立一個全螢幕的畫布
  createCanvas(windowWidth,windowHeight);
  for (let i = 0; i < 50; i++) {
    let chosenHex = random(colors);
    let c = {
      x: random(width), //隨機x座標
      y: random(height), //隨機y座標
      r: random(50, 200), //隨機半徑
      hex: chosenHex, // 儲存原始 hex 字串以便比對
      color: color(chosenHex), //隨機顏色
      alpha: random(80, 255), //隨機透明度
      speed: random(1, 5) //隨機速度
    };
    c.color.setAlpha(c.alpha); //設定顏色透明度
    circles.push(c); //把物件放進陣列
  }
  noStroke(); 
}

// 粒子類別 - 單一爆破粒子
class Particle {
  constructor(x, y, baseColor) {
    this.pos = createVector(x, y);
    let angle = random(TWO_PI);
    let speed = random(1, 6);
    this.vel = p5.Vector.fromAngle(angle).mult(speed * random(0.4, 1.2));
    this.acc = createVector(0, 0.02); // 模擬重力微弱下墜
    this.size = random(2, 8);
    this.life = 255;
    this.base = color(baseColor);
  }

  update() {
    this.vel.mult(0.99);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.life -= random(3, 6);
  }

  finished() {
    return this.life <= 0;
  }

  show() {
    push();
    noStroke();
    // 使用原始氣球顏色，但以 life 作為 alpha
    fill(red(this.base), green(this.base), blue(this.base), this.life);
    ellipse(this.pos.x, this.pos.y, this.size, this.size);
    pop();
  }
}

// 建立爆破：在 (x,y) 位置產生 n 個粒子，使用 color
function explode(x, y, col, n = 30) {
  for (let i = 0; i < n; i++) {
    particles.push(new Particle(x, y, col));
  }
}

function draw() { //draw函式會持續進行
  //background(220);//
  //產生背景顏色為A0DDE6設定背景顏色為灰色
  background('#A0DDE6'); //設定背景為綠色
//畫一個圓,圓心在滑鼠位置,直徑為50,顏色為A0DDE6,採用ellipse函式
  for (let c of circles) {
    fill(c.color); //設定填滿顏色
    ellipse(c.x, c.y, c.r, c.r); //畫一個圓
    // 新增：在圓的右上方畫正方形
    let squareSize = c.r / 10; //正方形縮小一半
    // 計算正方形中心點座標（圓心往右上偏移，確保方形在圓內）
    let offset = c.r / 2 - squareSize / 2;
    let squareX = c.x + offset * 0.65;
    let squareY = c.y - offset * 0.65;
    fill(255, 180); //白色，透明度180
    rectMode(CENTER);
    rect(squareX, squareY, squareSize, squareSize);
    c.y -= c.speed;   //圓往上移動
    // （改為由滑鼠點擊觸發爆破，故移除隨機爆破機率）

    if (c.y < -c.r / 2) {  //如果圓移動到畫面上方外
      c.y = height + c.r / 2;  //圓移動到畫面下方外
    }
  }

  // 更新並繪製所有粒子（後往前移除已結束的粒子）
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.show();
    if (p.finished()) {
      particles.splice(i, 1);
    }
  }

  // 左上角固定文字
  push();
  textAlign(LEFT, TOP);
  textSize(30);
  fill('#eb6424');
  noStroke();
  text('414730423', 10, 6);
  pop();

  // 右上角顯示分數
  push();
  textAlign(RIGHT, TOP);
  textSize(20);
  fill(0);
  noStroke();
  text('Score: ' + score, width - 10, 10);
  pop();
}

// 滑鼠點擊時檢查是否點到氣球，若有則爆破並處理得分與重生
function mousePressed() {
  // 由於可能有重疊，從後往前檢查（視覺上後出現的在上面）
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < c.r / 2) {
      // 點中氣球：產生爆破粒子
      explode(c.x, c.y, c.color, floor(random(20, 40)));
      // 判斷顏色分數：符合 '#ca6effff' 則加一分，否則扣一分
      if (c.hex === '#ca6effff') {
        score += 1;
      } else {
        score -= 1;
      }
      // 重生此氣球
      let chosenHex = random(colors);
      c.x = random(width);
      c.y = height + c.r / 2 + random(20, 200);
      c.r = random(50, 200);
      c.hex = chosenHex;
      c.color = color(chosenHex);
      c.alpha = random(80, 255);
      c.color.setAlpha(c.alpha);
      c.speed = random(1, 5);
      // 只處理第一個被點中的氣球
      break;
    }
  }
}
