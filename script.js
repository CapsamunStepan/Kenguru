const textarea = document.getElementById("code");

const clearTextareaButton = document.getElementById("clearTextarea");
const fileInput = document.getElementById("fileInput");
const loadFileButton = document.getElementById("loadFile");
const saveCodeInFileButton = document.getElementById("saveCodeInFile");

const addStepButton = document.getElementById("addStep");
const addTurnButton = document.getElementById("addTurn");
const addJumpButton = document.getElementById("addJump");
const addRepeatXButton = document.getElementById("repeatX");
const addEndRepeatButton= document.getElementById("endRepeat");
const addRemoveLastCommandButton = document.getElementById("removeLastCommand");

clearTextareaButton.addEventListener("click", () => {
    textarea.value = "";
    textarea.dispatchEvent(new Event('input'));
})

loadFileButton.addEventListener("click", () => {
    fileInput.click();
})

fileInput.addEventListener("change", () => {
    if (fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        console.log(reader.result);
        textarea.value = e.target.result;
        textarea.dispatchEvent(new Event("input"));
    };

    reader.readAsText(file, "UTF-8");
});

saveCodeInFileButton.addEventListener("click", async () => {
    const text = textarea.value;
    if (!text.trim()) {
        alert("Нет комманд для сохранения!");
        return;
    }

    const fileHandle = await window.showSaveFilePicker({
        suggestedName: "code.txt",
        types: [
            {
                description: "Текстовые файлы",
                accept: { "text/plain": [".txt"] },
            },
        ],
    });

    const writable = await fileHandle.createWritable();
    await writable.write(text);
    await writable.close();
})

addStepButton.addEventListener("click", () => {
    if (textarea.value && !textarea.value.endsWith("\n")) {
        textarea.value += "\n";
    }
    textarea.value += "Шаг\n";
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('input'));
})

addTurnButton.addEventListener("click", () => {
    if (textarea.value && !textarea.value.endsWith("\n")) {
        textarea.value += "\n";
    }
    textarea.value += "Поворот\n";
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('input'));
})

addJumpButton.addEventListener("click", () => {
    if (textarea.value && !textarea.value.endsWith("\n")) {
        textarea.value += "\n";
    }
    textarea.value += "Прыжок\n";
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('input'));
});

addRepeatXButton.addEventListener("click", () => {
    let count = prompt("Сколько раз повторить?", "2");
    if (count === null) return;
    count = parseInt(count, 10);
    if (isNaN(count) || count <= 0) {
        alert("Введите корректное число!");
        return;
    }
    let lines = textarea.value.split("\n");
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
    }
    lines.push(`Повтори ${count}`);
    textarea.value = lines.join("\n") + "\n";
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('input'));
});

addEndRepeatButton.addEventListener("click", () => {
    if (textarea.value && !textarea.value.endsWith("\n")) {
        textarea.value += "\n";
    }
    textarea.value += "Конец повтора\n";
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('input'));
})

addRemoveLastCommandButton.addEventListener("click", () => {
    let lines = textarea.value.split("\n");
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
    }
    if (lines.length > 0) {
        lines.pop();
    }
    textarea.value = lines.join("\n") + "\n";
    textarea.scrollTop = textarea.scrollHeight;
    textarea.dispatchEvent(new Event('input'));
})

textarea.placeholder = "Повтори 4 раза\nШаг\nПрыжок\nПоворот\nКонец повтора";

textarea.addEventListener('input', () => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 390) + "px";
});

const canva = document.getElementById('canvas');
const ctx = canva.getContext('2d');
let x = 250, y = 250, angle = 0;
const stepSize = 14;

function insideCanvas(nx, ny) {
    return nx >= 0 && ny >= 0 && nx <= canva.width && ny <= canva.height;
}

function drawLine(steps) {
    let nx = x + Math.cos(angle * Math.PI / 180) * steps * stepSize;
    let ny = y + Math.sin(angle * Math.PI / 180) * steps * stepSize;

    if (!insideCanvas(nx, ny)) {
        alert("Вы вышли за пределы зоны!");
        return;
    }
     // запрет выхода
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    x = nx;
    y = ny;
}

function jump(steps) {
    let nx = x + Math.cos(angle * Math.PI / 180) * steps * stepSize;
    let ny = y + Math.sin(angle * Math.PI / 180) * steps * stepSize;

    if (!insideCanvas(nx, ny)) return;
    x = nx;
    y = ny;
}

function parseBlock(lines, i = 0) {
    let commands = [];
    while (i < lines.length) {
        let line = lines[i].trim().toLowerCase();
        if (line.startsWith('повтори')) {
            let n = parseInt(line.split(' ')[1] || '1', 10);
            let [body, ni] = parseBlock(lines, i + 1);
            commands.push({type: 'repeat', count: n, body});
            i = ni;
        } else if (line.startsWith('шаг')) {
            let n = parseInt(line.split(' ')[1] || '1', 10);
            commands.push({type: 'step', count: n});
        } else if (line.startsWith('прыжок')) {
            let n = parseInt(line.split(' ')[1] || '1', 10);
            commands.push({type: 'jump', count: n});
        } else if (line === 'поворот') {
            commands.push({type: 'turn'});
        } else if (line === 'конец повтора') {
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
    ctx.clearRect(0, 0, canva.width, canva.height);
    x = 10;
    y = 10;
    angle = 0;

    const lines = code.value.trim().split(/\n/);
    let [commands] = parseBlock(lines);
    exec(commands);
}