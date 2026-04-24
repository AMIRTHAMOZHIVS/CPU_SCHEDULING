<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CPU Scheduling Simulator Pro</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-container">
        <aside class="sidebar">
            <div class="brand">
                <h2>OS Scheduler</h2>
                <p>Project Dashboard</p>
            </div>

            <div class="input-section">
                <h3>Add Process</h3>
                <div class="input-group">
                    <label>Process ID</label>
                    <input type="text" id="pid" placeholder="P1, P2...">
                    
                    <label>Arrival Time</label>
                    <input type="number" id="at" value="0" min="0">
                    
                    <label>Burst Time</label>
                    <input type="number" id="bt" value="1" min="1">

                    <div id="priorityInput" class="extra-field">
                        <label>Priority (Lower = Higher)</label>
                        <input type="number" id="priority" value="0">
                    </div>
                </div>
                <button onclick="addProcess()" class="btn-add">Add to Queue</button>
            </div>

            <div class="algo-section">
                <h3>Algorithm Settings</h3>
                <select id="algoSelector" onchange="updateUI()">
                    <option value="FCFS">First Come First Served</option>
                    <option value="SJF">SJF (Non-Preemptive)</option>
                    <option value="SRTF">SRTF (Preemptive SJF)</option>
                    <option value="Priority">Priority (Non-Preemptive)</option>
                    <option value="RR">Round Robin</option>
                </select>

                <div id="quantumInput" class="extra-field">
                    <label>Time Quantum</label>
                    <input type="number" id="quantum" value="2" min="1">
                </div>

                <button onclick="calculate()" class="btn-run">Run Simulation</button>
                <button onclick="clearAll()" class="btn-clear">Reset All</button>
            </div>

            <div class="team-section">
                <h3>Presented by</h3>
                <ul class="team-list">
                    <li>24CSR019 - AMIRTHAMOZHI V S</li>
                    <li>24CSR029 - ASMA THASNIM H</li>
                    <li>24CSR057 - DHARANEESH S C</li>
                </ul>
            </div>
        </aside>

        <main class="main-content">
            <div id="welcome-msg">
                <h1>CPU Scheduling Simulator</h1>
                <p>Enter processes on the left and select an algorithm to begin.</p>
            </div>

            <div id="result-section" class="hidden">
                <div class="card">
                    <h3>Gantt Chart</h3>
                    <div id="gantt-chart-wrapper" class="gantt-wrapper"></div>
                </div>

                <div class="card table-card">
                    <h3>Calculated Metrics</h3>
                    <table id="statsTable">
                        <thead>
                            <tr>
                                <th>PID</th>
                                <th>Arrival</th>
                                <th>Burst</th>
                                <th>Finish</th>
                                <th>Turnaround</th>
                                <th>Waiting</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody"></tbody>
                    </table>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <small>Avg Waiting Time</small>
                        <h2 id="avgWT">0.00</h2>
                    </div>
                    <div class="stat-card">
                        <small>Avg Turnaround Time</small>
                        <h2 id="avgTAT">0.00</h2>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <script src="script.js"></script>
</body>
</html>
