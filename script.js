let processes = [];

function updateUI() {
    const algo = document.getElementById('algoSelector').value;
    document.getElementById('priorityInput').style.display = (algo === 'Priority') ? 'block' : 'none';
    document.getElementById('quantumInput').style.display = (algo === 'RR') ? 'block' : 'none';
}

function addProcess() {
    const pid = document.getElementById('pid').value || `P${processes.length + 1}`;
    const at = parseInt(document.getElementById('at').value);
    const bt = parseInt(document.getElementById('bt').value);
    const priority = parseInt(document.getElementById('priority').value) || 0;

    if (isNaN(at) || isNaN(bt)) return alert("Please enter valid times");

    processes.push({ pid, at, bt, priority });
    alert(`Process ${pid} added.`);
    document.getElementById('pid').value = "";
}

function calculate() {
    if (processes.length === 0) return alert("Add some processes first!");
    
    const algo = document.getElementById('algoSelector').value;
    let result;

    if (algo === "FCFS") result = solveFCFS();
    else if (algo === "SJF") result = solveSJF();
    else if (algo === "SRTF") result = solveSRTF();
    else if (algo === "Priority") result = solvePriority();
    else if (algo === "RR") result = solveRR();

    render(result);
}

function solveFCFS() {
    let local = [...processes].sort((a, b) => a.at - b.at);
    let time = 0, gantt = [];
    local.forEach(p => {
        if (time < p.at) { gantt.push({id: 'Idle', start: time, end: p.at}); time = p.at; }
        let start = time;
        time += p.bt;
        p.ct = time; p.tat = p.ct - p.at; p.wt = p.tat - p.bt;
        gantt.push({id: p.pid, start, end: time});
    });
    return { processes: local, gantt };
}

function solveSJF() {
    let local = processes.map(p => ({...p}));
    let time = 0, completed = 0, n = local.length, gantt = [];
    let isDone = Array(n).fill(false);

    while (completed < n) {
        let idx = -1, minBT = Infinity;
        for (let i = 0; i < n; i++) {
            if (local[i].at <= time && !isDone[i] && local[i].bt < minBT) {
                minBT = local[i].bt; idx = i;
            }
        }
        if (idx === -1) { time++; continue; }
        let start = time;
        time += local[idx].bt;
        local[idx].ct = time; local[idx].tat = time - local[idx].at; local[idx].wt = local[idx].tat - local[idx].bt;
        isDone[idx] = true; completed++;
        gantt.push({id: local[idx].pid, start, end: time});
    }
    return { processes: local, gantt };
}

function solveSRTF() {
    let local = processes.map(p => ({...p, rem: p.bt}));
    let time = 0, completed = 0, n = local.length, gantt = [];
    let lastId = null;

    while (completed < n) {
        let idx = -1, minRem = Infinity;
        for (let i = 0; i < n; i++) {
            if (local[i].at <= time && local[i].rem > 0 && local[i].rem < minRem) {
                minRem = local[i].rem; idx = i;
            }
        }
        if (idx === -1) { time++; continue; }

        if (lastId === local[idx].pid) {
            gantt[gantt.length - 1].end++;
        } else {
            gantt.push({id: local[idx].pid, start: time, end: time + 1});
            lastId = local[idx].pid;
        }

        local[idx].rem--;
        time++;
        if (local[idx].rem === 0) {
            local[idx].ct = time; local[idx].tat = time - local[idx].at; local[idx].wt = local[idx].tat - local[idx].bt;
            completed++; lastId = null;
        }
    }
    return { processes: local, gantt };
}

function solveRR() {
    const q = parseInt(document.getElementById('quantum').value);
    let local = processes.map(p => ({...p, rem: p.bt}));
    let time = 0, gantt = [], queue = [], completed = 0;
    local.sort((a,b) => a.at - b.at);
    
    let visited = new Set();
    time = local[0].at;
    queue.push(local[0]);
    visited.add(0);

    while (completed < local.length) {
        let p = queue.shift();
        if (!p) { time++; local.forEach((lp, i) => { if(lp.at <= time && !visited.has(i)) { queue.push(lp); visited.add(i); }}); continue; }
        
        let start = time;
        let take = Math.min(p.rem, q);
        p.rem -= take;
        time += take;
        gantt.push({id: p.pid, start, end: time});

        local.forEach((lp, i) => {
            if (!visited.has(i) && lp.at <= time) { visited.add(i); queue.push(lp); }
        });
        if (p.rem > 0) queue.push(p);
        else { p.ct = time; p.tat = p.ct - p.at; p.wt = p.tat - p.bt; completed++; }
    }
    return { processes: local, gantt };
}

function solvePriority() {
    let local = processes.map(p => ({...p}));
    let time = 0, completed = 0, n = local.length, gantt = [];
    let isDone = Array(n).fill(false);
    while (completed < n) {
        let idx = -1, minPrio = Infinity;
        for (let i = 0; i < n; i++) {
            if (local[i].at <= time && !isDone[i] && local[i].priority < minPrio) {
                minPrio = local[i].priority; idx = i;
            }
        }
        if (idx === -1) { time++; continue; }
        let start = time; time += local[idx].bt;
        local[idx].ct = time; local[idx].tat = time - local[idx].at; local[idx].wt = local[idx].tat - local[idx].bt;
        isDone[idx] = true; completed++;
        gantt.push({id: local[idx].pid, start, end: time});
    }
    return { processes: local, gantt };
}

function render(res) {
    document.getElementById('welcome-msg').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');
    let gHtml = "", tHtml = "", tWT = 0, tTAT = 0;
    
    const totalTime = res.gantt[res.gantt.length - 1].end;
    res.gantt.forEach(g => {
        let width = ((g.end - g.start) / totalTime) * 100;
        gHtml += `<div class="gantt-block ${g.id==='Idle'?'idle-bg':'p-bg'}" style="width:${width}%">${g.id}<span>${g.end}</span></div>`;
    });

    res.processes.forEach(p => {
        tWT += p.wt; tTAT += p.tat;
        tHtml += `<tr><td>${p.pid}</td><td>${p.at}</td><td>${p.bt}</td><td>${p.ct}</td><td>${p.tat}</td><td>${p.wt}</td></tr>`;
    });

    document.getElementById('gantt-chart-wrapper').innerHTML = gHtml;
    document.getElementById('tableBody').innerHTML = tHtml;
    document.getElementById('avgWT').innerText = (tWT / res.processes.length).toFixed(2);
    document.getElementById('avgTAT').innerText = (tTAT / res.processes.length).toFixed(2);
}

function clearAll() { processes = []; location.reload(); }