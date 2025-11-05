async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

function pct(x) {
  if (x === null || x === undefined) return "-";
  return (x * 100).toFixed(1) + "%";
}

function num(x) {
  return x === null || x === undefined ? "-" : x;
}

function renderPlayerTable(players) {
  const tbody = document.querySelector("#players-body");
  tbody.innerHTML = "";
  players.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${num(p.gp)}</td>
      <td>${num(p.pts)}</td>
      <td>${num(p.reb)}</td>
      <td>${num(p.ast)}</td>
      <td>${pct(p.ts_pct)}</td>
      <td>${pct(p.fg_pct)}</td>
      <td>${pct(p.twop_pct)}</td>
      <td>${pct(p.threep_pct)}</td>
      <td>${pct(p.ft_pct)}</td>
      <td>${num(p.tov)}</td>
      <td>${num(p.min)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTeamStats(team) {
  const el = document.querySelector("#team-stats");
  const t = team.team_stats || {};
  el.innerHTML = `
    <div class="grid">
      <div class="card"><strong>Season</strong><br>${team.season || "-"}</div>
      <div class="card"><strong>Team</strong><br>${team.team || "-"}</div>
      <div class="card"><strong>Games</strong><br>${num(t.games_played)}</div>
      <div class="card"><strong>W-L</strong><br>${num(t.wins)} - ${num(t.losses)}</div>
      <div class="card"><strong>Net Rating</strong><br>${num(t.net_rating)}</div>
      <div class="card"><strong>Off Rtg</strong><br>${num(t.offensive_rating)}</div>
      <div class="card"><strong>Def Rtg</strong><br>${num(t.defensive_rating)}</div>
    </div>
  `;
}

async function initStats() {
  try {
    const baseurl = document.body.dataset.baseurl || "";
    const players = await loadJSON(`${baseurl}/assets/data/players.json`);
    const team = await loadJSON(`${baseurl}/assets/data/team.json`);
    renderPlayerTable(players.players || []);
    renderTeamStats(team || {});
  } catch (e) {
    console.error(e);
    document.querySelector("#team-stats").innerHTML = "<p>Failed to load stats.</p>";
  }
}

document.addEventListener("DOMContentLoaded", initStats);
