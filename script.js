const c = document.getElementById('c');
const ctx = c.getContext('2d');
let x = 250, y = 250, angle = 0;
const stepSize = 20;

function insideCanvas(nx, ny) {
  return nx >= 0 && ny >= 0 && nx <= c.width && ny <= c.height;
}

function drawLine(steps) {
  let nx = x + Math.cos(angle * Math.PI / 180) * steps * stepSize;
  let ny = y + Math.sin(angle * Math.PI / 180) * steps * stepSize;

  if (!insideCanvas(nx, ny)) {
    alert("Wrong input, you are out of zone!");
    return;
  }; // запрет выхода
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(nx, ny);
  ctx.stroke();
  x = nx; y = ny;
}

function jump(steps) {
  let nx = x + Math.cos(angle * Math.PI / 180) * steps * stepSize;
  let ny = y + Math.sin(angle * Math.PI / 180) * steps * stepSize;

  if (!insideCanvas(nx, ny)) return;
  x = nx; y = ny;
}

function parseBlock(lines, i = 0) {
  let commands = [];
  while (i < lines.length) {
    let line = lines[i].trim().toLowerCase();
    if (line.startsWith('повтори')) {
      let n = parseInt(line.split(' ')[1] || '1', 10);
      let [body, ni] = parseBlock(lines, i + 1);
      commands.push({ type: 'repeat', count: n, body });
      i = ni;
    }
    else if (line.startsWith('шаг')) {
      let n = parseInt(line.split(' ')[1] || '1', 10);
      commands.push({ type: 'step', count: n });
    }
    else if (line.startsWith('прыжок')) {
      let n = parseInt(line.split(' ')[1] || '1', 10);
      commands.push({ type: 'jump', count: n });
    }
    else if (line === 'поворот') {
      commands.push({ type: 'turn' });
    }
    else if (line === 'конец повтора') {
      return [commands, i];
    }
    i++;
  }
  return [commands, i];
}

function exec(commands) {
  for (let cmd of commands) {
    if (cmd.type === 'step') drawLine(cmd.count);
    else if (cmd.type === 'jump') jump(cmd.count);
    else if (cmd.type === 'turn') angle += 90;
    else if (cmd.type === 'repeat') {
      for (let i = 0; i < cmd.count; i++) exec(cmd.body);
    }
  }
}

function run() {
  ctx.clearRect(0, 0, c.width, c.height);
  x = 10; y = 10; angle = 0;

  const lines = code.value.trim().split(/\n/);
  let [commands] = parseBlock(lines);
  exec(commands);
}