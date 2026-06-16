let processes = [];

// Dictionary holding algorithmic theory metadata for our visual companion panel
const theoryDatabase = {
    FCFS: {
        title: "First-Come, First-Served (FCFS)",
        desc: "Executes processes in the exact order they arrive in the ready queue. Simple and fair layout management system, but highly susceptible to the Convoy Effect—where short processes become bottlenecked behind highly intensive computing blocks.",
        preemptive: false
    },
    SJF: {
        title: "Shortest Job First (Non-Preemptive)",
        desc: "Analyzes the ready queue and allocates the execution window to whichever process has the smallest overall Burst Time. Minimizes wait profiles effectively but can create task Starvation profiles for highly compute-heavy processes.",
        preemptive: false
    },
    SRTF: {
        title: "Shortest Remaining Time First (Preemptive)",
        desc: "A highly dynamic preemptive variant of SJF. Every time an index ticks or an arrival is registered, the scheduling algorithm computes remaining times. If a newly arrived process is shorter than the ongoing task block, context switching intercepts the current block.",
        preemptive: true
    },
    Priority: {
        title: "Priority Scheduling (Non-Preemptive)",
        desc: "Allocates the processing unit based on external prioritization tiers assigned during deployment metrics. Higher ranks run instantly while lower ones wait in queues. Starvation handling requires programmatic 'Aging' routines in production architectures.",
        preemptive: false
    },
    RR: {
        title: "Round Robin (Time Sharing System)",
        desc: "Cyclically services processes inside a FIFO queue structure utilizing a static execution parameter called a Time Quantum. Ensures cyclic scheduling integrity across systems, ideal for interactive environments and client-server architectures.",
        preemptive: true
    }
};

function updateUI() {
    const algo = document.getElementById('algoSelector').value;
    
    // Toggle relevant conditional input forms
    document.getElementById('priorityInput').style.display = (algo === 'Priority') ? 'block' : 'none';
    document.getElementById('quantumInput').style.display = (algo === 'RR') ? 'block' : 'none';

    // Synchronize and update the dynamic reference guide
    const info = theoryDatabase[algo];
    const titleElem = document.getElementById('theory-title');
    const descElem = document.getElementById('theory-desc');
    const badgeElem = document.getElementById('theory-badges');

    titleElem.innerText = info.title;
    descElem.innerText = info.desc;
    badgeElem.innerHTML = info.preemptive ? 
        `<span class="badge badge-preemptive">Preemptive</span>` : 
        `<span class="badge badge-nonpreemptive">Non-Preemptive</span>`;

    // Re-trigger animation on change for visual satisfaction
    const guideBox = document.querySelector('.theory-section');
    guideBox.style.animation = 'none';
    guideBox.offsetHeight; // Trigger reflow hack
    guideBox.style.animation = 'slideUp var(--anim-speed) cubic-bezier(0.16, 1, 0.3, 1) forwards';
}

window.onload = updateUI;

function addProcess() {
    const pidInput = document.getElementById('pid');
    const atInput = document.getElementById('at');
    const btInput = document.getElementById('bt');
    const prioInput = document.getElementById('priority');

    const pid = pidInput.value || `P${processes.length + 1}`;
    const at = parseInt(atInput.value);
    const bt = parseInt(btInput.value);
    const priority = parseInt(prioInput.value) || 0;

    if (isNaN(at) || isNaN(bt)) {
        alert("Please input numerical metrics for arrival and burst dimensions.");
        return;
    }

    processes.push({ pid, at, bt, priority, originalBT: bt });
    alert(`Process structural array generated successfully for item: ${pid}`);
    pidInput.value = "";
}

function clearAll() {
    processes = [];
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('welcome-msg').classList.remove('hidden');
    alert("Simulation volatile memory components cleared.");
}

function getColor(id) {
    if (id === 'Idle') return '#1e1e30'; // Dark matching block for empty cycles
    
    // High-visibility futuristic neon tones
    const colors = [
        '#00f0ff', '#bd00ff', '#39ff14', '#ff0055', 
        '#ff9f1c', '#00b4d8', '#9d4edd', '#ff5400',
        '#06d6a0', '#ef476f', '#ffd166', '#118ab2'
    ];
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

function calculate() {
    if (processes.length === 0) return alert("Initialize allocation blocks prior to executing simulator arrays.");
    
    const algo = document.getElementById('algoSelector').value;
    let result;

    switch(algo) {
        case "FCFS": result = solveFCFS(); break;
        case "SJF": result = solveSJF(); break;
        case "SRTF": result = solveSRTF(); break;
        case "Priority": result = solvePriority(); break;
        case "RR": result = solveRR(); break;
    }

    render(result);
}

function solveFCFS() {
    let local = [...processes].sort((a, b) => a.at - b.at);
    let time = 0, gantt = [];
    local.forEach(p => {
        if (time < p.at) {
            gantt.push({id: 'Idle', start: time, end: p.at});
            time = p.at;
        }
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
        if (idx === -1) {
            let nextArrival = Math.min(...local.filter((_, i) => !isDone[i]).map(p => p.at));
            gantt.push({id: 'Idle', start: time, end: nextArrival});
            time = nextArrival;
            continue;
        }
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

        if (idx === -1) {
            let nextArr = Math.min(...local.filter(p => p.rem > 0).map(p => p.at));
            gantt.push({id: 'Idle', start: time, end: nextArr});
            time = nextArr; lastId = 'Idle'; continue;
        }

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
    const q = parseInt(document.getElementById('quantum').value) || 2;
    let local = processes.map(p => ({...p, rem: p.bt}));
    let time = 0, gantt = [], queue = [], completed = 0;
    local.sort((a,b) => a.at - b.at);
    
    let visited = new Set();
    time = local[0].at;
    if(time > 0) gantt.push({id: 'Idle', start: 0, end: time});
    
    queue.push(local[0]);
    visited.add(0);

    while (completed < local.length) {
        let p = queue.shift();
        if (!p) {
            let next = local.findIndex((lp, i) => lp.at > time && !visited.has(i));
            gantt.push({id: 'Idle', start: time, end: local[next].at});
            time = local[next].at;
            queue.push(local[next]); visited.add(next);
            continue;
        }
        
        let take = Math.min(p.rem, q);
        gantt.push({id: p.pid, start: time, end: time + take});
        time += take;
        p.rem -= take;

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
        if (idx === -1) {
            let next = Math.min(...local.filter((_,i)=>!isDone[i]).map(p=>p.at));
            gantt.push({id: 'Idle', start: time, end: next});
            time = next; continue;
        }
        let start = time; time += local[idx].bt;
        local[idx].ct = time; local[idx].tat = time - local[idx].at; local[idx].wt = local[idx].tat - local[idx].bt;
        isDone[idx] = true; completed++;
        gantt.push({id: local[idx].pid, start, end: time});
    }
    return { processes: local, gantt };
}

function render(res) {
    document.getElementById('welcome-msg').classList.add('hidden');
    const resSec = document.getElementById('result-section');
    resSec.classList.remove('hidden');
    
    // Clear and re-trigger overall page entry fade
    resSec.style.animation = 'none';
    resSec.offsetHeight; 
    resSec.style.animation = 'structuralBlink 0.4s ease-out';

    let gHtml = "", tHtml = "", tWT = 0, tTAT = 0;
    const totalTime = res.gantt[res.gantt.length - 1].end;

    // Loop through Gantt Chart elements to apply staggered delays
    res.gantt.forEach((g, index) => {
        let width = ((g.end - g.start) / totalTime) * 100;
        let color = getColor(g.id);
        let textColor = (g.id === 'Idle') ? '#64748b' : '#ffffff';
        
        // This variable controls how fast the sequence steps through (e.g., 0.15s per block)
        let delay = index * 0.15; 

        gHtml += `
            <div class="gantt-block" style="width: ${width}%; background-color: ${color}; color: ${textColor}; --block-delay: ${delay}s;">
                <div class="block-label">${g.id}</div>
                <span class="time-stamp">${g.end}</span>
            </div>`;
    });

    // Loop through data table records
    res.processes.forEach((p, index) => {
        tWT += p.wt; tTAT += p.tat;
        let rowDelay = index * 0.08; // Staggered row slide-in
        
        tHtml += `
            <tr style="animation: tableRowFadeIn 0.4s ease-out both; animation-delay: ${rowDelay}s;">
                <td><b>${p.pid}</b></td>
                <td>${p.at}ms</td>
                <td>${p.bt}ms</td>
                <td>${p.ct}ms</td>
                <td>${p.tat}ms</td>
                <td>${p.wt}ms</td>
            </tr>`;
    });

    document.getElementById('gantt-chart-wrapper').innerHTML = gHtml;
    document.getElementById('tableBody').innerHTML = tHtml;
    
    // Animate the numeric counters smoothly
    animateCounter('avgWT', tWT / res.processes.length);
    animateCounter('avgTAT', tTAT / res.processes.length);
}

// Helper function to count up numbers smoothly instead of snapping instantly
function animateCounter(elementId, targetValue) {
    const obj = document.getElementById(elementId);
    let current = 0;
    const duration = 1000; // 1 second animation duration
    const start = performance.now();
    
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic calculation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        current = easeProgress * targetValue;
        obj.innerText = current.toFixed(2) + "ms";
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}
