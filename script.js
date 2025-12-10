function generateSprintPattern(initialMaxSpeed, fatigueMinSpeed, totalMinutes = 121, cycleCount = 17) {
  const data = [];
  const avgCycleLength = Math.floor(totalMinutes / cycleCount);
  let currentMaxSpeed = initialMaxSpeed;

  for (let c = 0; c < cycleCount; c++) {
    const sprintSteps = Math.floor((Math.random() * 1.5 + 0.5) * (avgCycleLength / 3));
    const restSteps = avgCycleLength - sprintSteps;

    const sprintDrop = Math.random() * 1.5 + 1.0;
    for (let i = 0; i < sprintSteps && data.length < totalMinutes; i++) {
      const rate = i / sprintSteps;
      const variation = Math.random() * 0.8;
      const speed = currentMaxSpeed - (sprintDrop * rate) - variation;
      data.push(+speed.toFixed(1));
    }

    const restGain = Math.random() * 1.2 + 1.2;
    for (let i = 0; i < restSteps && data.length < totalMinutes; i++) {
      const rate = i / restSteps;
      const variation = Math.random() * 0.6;
      const speed = fatigueMinSpeed + (restGain * rate) + variation;
      data.push(+speed.toFixed(1));
    }

    const fatigueDrop = Math.random() * 0.5;
    const rebound = Math.random() * 0.6 - 0.3;
    currentMaxSpeed -= fatigueDrop;
    currentMaxSpeed += rebound;
    if (currentMaxSpeed < fatigueMinSpeed + 5) currentMaxSpeed = fatigueMinSpeed + 5;
  }

  while (data.length < totalMinutes) {
    data.push(data[data.length - 1]);
  }

  return data;
}

function generateEndurancePattern(mean, length = 121) {
  const fixed = +mean.toFixed(1);
  return Array(length).fill(fixed);
}

document.addEventListener('DOMContentLoaded', () => {
  const totalMinutes = 121;
  const playerDatasets = [
    {
      label: "選手1 - 全力",
      data: generateSprintPattern(40.2, 20.12),
      borderColor: "#ef4444"
    },
    {
      label: "選手1 - 持久",
      data: generateEndurancePattern(28.12),
      borderColor: "#ef444488",
      borderDash: [5, 5]
    },
    {
      label: "選手2 - 全力",
      data: generateSprintPattern(43.8, 21.3),
      borderColor: "#f59e0b"
    },
    {
      label: "選手2 - 持久",
      data: generateEndurancePattern(30.52),
      borderColor: "#f59e0b88",
      borderDash: [5, 5]
    },
    {
      label: "選手3 - 全力",
      data: generateSprintPattern(38.5, 20.2),
      borderColor: "#10b981"
    },
    {
      label: "選手3 - 持久",
      data: generateEndurancePattern(28.31),
      borderColor: "#10b98188",
      borderDash: [5, 5]
    },
    {
      label: "選手4 - 全力",
      data: generateSprintPattern(39.5, 23.51),
      borderColor: "#3b82f6"
    },
    {
      label: "選手4 - 持久",
      data: generateEndurancePattern(30.29),
      borderColor: "#3b82f688",
      borderDash: [5, 5]
    },
    {
      label: "選手5 - 全力",
      data: generateSprintPattern(44.0, 20.12),
      borderColor: "#8b5cf6"
    },
    {
      label: "選手5 - 持久",
      data: generateEndurancePattern(32.57),
      borderColor: "#8b5cf688",
      borderDash: [5, 5]
    }
  ];

  const ctx = document.getElementById('speedChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: totalMinutes }, (_, i) => i),
      datasets: playerDatasets.map(ds => ({
        ...ds,
        fill: false,
        tension: 0.4,
        pointRadius: 0
      }))
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: '選手の速度変化（全力 vs 持久）',
          font: { size: 18 }
        },
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x'
          }
        }
      },
      scales: {
        x: { title: { display: true, text: "時間（分）" } },
        y: {
          title: { display: true, text: "速度（km/h）" },
          suggestedMin: 15,
          suggestedMax: 55
        }
      }
    }
  });

  window.chart = chart;

  document.querySelectorAll('.player-toggle').forEach(cb => {
    cb.addEventListener('change', () => {
      const index = (Number(cb.dataset.player) - 1) * 2;
      chart.getDatasetMeta(index).hidden = !cb.checked;
      chart.getDatasetMeta(index + 1).hidden = !cb.checked;
      chart.update();
      if (document.getElementById('view-table').checked) renderTable();
      updateStats();
    });
  });

  document.querySelectorAll('input[name="view-toggle"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const chartDiv = document.getElementById('chart-container');
      const tableDiv = document.getElementById('table-container');
      if (document.getElementById('view-chart').checked) {
        chartDiv.style.display = 'block';
        tableDiv.style.display = 'none';
      } else {
        chartDiv.style.display = 'none';
        tableDiv.style.display = 'block';
        renderTable();
      }
      updateStats();
    });
  });

  function renderTable() {
    const tableContainer = document.getElementById('table-container');
    let html = "<table><thead><tr><th>時間（分）</th>";
    chart.data.datasets.forEach((ds, idx) => {
      if (chart.isDatasetVisible(idx)) html += `<th>${ds.label}</th>`;
    });
    html += "</tr></thead><tbody>";
    chart.data.labels.forEach((label, i) => {
      html += `<tr><td>${label}</td>`;
      chart.data.datasets.forEach((ds, idx) => {
        if (chart.isDatasetVisible(idx)) {
          html += `<td>${ds.data[i].toFixed(1)}</td>`;
        }
      });
      html += "</tr>";
    });
    html += "</tbody></table>";
    tableContainer.innerHTML = html;
  }

function updateStats() {
  const statsContainer = document.getElementById('player-stats');
  statsContainer.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const sprintIdx = i * 2;
    const enduranceIdx = sprintIdx + 1;

    const isSprintVisible = chart.isDatasetVisible(sprintIdx);
    const isEnduranceVisible = chart.isDatasetVisible(enduranceIdx);

    if (isSprintVisible || isEnduranceVisible) {
      const playerLabel = `選手${i + 1}：`;
      let lines = "";

      if (isEnduranceVisible) {
        const data = chart.data.datasets[enduranceIdx].data;
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        const dist = avg * 2; // ★ 距離 = 平均時速 × 2（2時間）
        lines += `　・持久的：平均速度 ${avg.toFixed(2)} km/h ／ 距離 ${dist.toFixed(2)} km<br>`;
      }

      if (isSprintVisible) {
        const data = chart.data.datasets[sprintIdx].data;
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = sum / data.length;
        const dist = avg * 2; // ★ 同様に2時間計算
        lines += `　・全力　：平均速度 ${avg.toFixed(2)} km/h ／ 距離 ${dist.toFixed(2)} km<br>`;
      }

      const div = document.createElement('div');
      div.innerHTML = `<strong>${playerLabel}</strong><br>${lines}`;
      statsContainer.appendChild(div);
    }
  }
}


  renderTable();
  updateStats();
});
