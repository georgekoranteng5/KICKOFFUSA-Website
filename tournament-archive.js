/**
 * Last completed tournament (static results when no live tournament in DB)
 */
const LAST_TOURNAMENT = {
  id: 'archive-kickoff-cup',
  name: 'KICKOFF Cup',
  status: 'completed',
  champion: 'Real Santana',
  subtitle: 'Final group standings & knockout results',
  groups: [
    {
      group_name: 'A',
      teams: [
        { team_name: 'Clarkston All Stars', points: 11, wins: 3, ties: 2, losses: 0 },
        { team_name: 'Tramore', points: 11, wins: 3, ties: 2, losses: 0 },
        { team_name: 'Midcity FC', points: 8, wins: 2, ties: 2, losses: 1 },
        { team_name: 'International Allstars', points: 8, wins: 2, ties: 2, losses: 1 },
        { team_name: 'PLAYHOUSE FC', points: 3, wins: 1, ties: 0, losses: 4 },
        { team_name: 'Trendish FC', points: 0, wins: 0, ties: 0, losses: 5 }
      ]
    },
    {
      group_name: 'B',
      teams: [
        { team_name: 'Real Santana', points: 15, wins: 5, ties: 0, losses: 0 },
        { team_name: 'Mi Abuela Maria', points: 9, wins: 3, ties: 0, losses: 2 },
        { team_name: 'FUTSAL United', points: 6, wins: 2, ties: 0, losses: 3 },
        { team_name: 'TEAM FODA', points: 6, wins: 2, ties: 0, losses: 3 },
        { team_name: 'Jugadores', points: 6, wins: 2, ties: 0, losses: 3 },
        { team_name: 'FC Leopold', points: 3, wins: 1, ties: 0, losses: 4 }
      ]
    }
  ],
  knockout: [
    {
      round: 'Semi-Final',
      team1_name: 'Clarkston All Stars',
      team2_name: 'Mi Abuela Maria',
      team1_score: 2,
      team2_score: 1,
      winner: 'Clarkston All Stars'
    },
    {
      round: 'Semi-Final',
      team1_name: 'Real Santana',
      team2_name: 'Tramore',
      team1_score: 5,
      team2_score: 0,
      winner: 'Real Santana'
    },
    {
      round: 'Final',
      team1_name: 'Real Santana',
      team2_name: 'Clarkston All Stars',
      team1_score: 4,
      team2_score: 0,
      winner: 'Real Santana'
    }
  ]
};

function renderLastTournamentArchive() {
  const t = LAST_TOURNAMENT;

  const standingsEl = document.getElementById('groupStandings');
  if (standingsEl) {
    let html = `
      <p class="archive-section-lead">Final group stage, sorted by points (PTS), then goal difference (GD).</p>
      <div class="archive-groups-grid">
    `;

    t.groups.forEach((group) => {
      html += `
        <div class="archive-group-card">
          <h4 class="archive-group-title">Group ${group.group_name}</h4>
          <div class="archive-table-wrap">
            <table class="archive-standings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>PTS</th>
                  <th>W</th>
                  <th>T</th>
                  <th>L</th>
                </tr>
              </thead>
              <tbody>
      `;

      group.teams.forEach((team, index) => {
        const qualified = index < 2 ? ' archive-row--qualified' : '';
        html += `
          <tr class="${qualified}">
            <td>${index + 1}</td>
            <td class="archive-team-cell">${team.team_name}</td>
            <td><strong>${team.points}</strong></td>
            <td>${team.wins}</td>
            <td>${team.ties}</td>
            <td>${team.losses}</td>
          </tr>
        `;
      });

      html += '</tbody></table></div></div>';
    });

    html += `
      </div>
      <p class="archive-legend">Top 2 from each group advanced to the knockout stage.</p>
    `;
    standingsEl.innerHTML = html;
  }

  const knockoutEl = document.getElementById('knockoutStage');
  if (knockoutEl) {
    const semis = t.knockout.filter((m) => m.round === 'Semi-Final');
    const final = t.knockout.find((m) => m.round === 'Final');

    let html = '<div class="archive-knockout">';

    if (semis.length) {
      html += '<div class="archive-knockout-round"><h4 class="archive-round-title">Semi-Finals</h4><div class="archive-matches">';
      semis.forEach((match) => {
        html += buildArchiveMatchCard(match);
      });
      html += '</div></div>';
    }

    if (final) {
      html += '<div class="archive-knockout-round archive-knockout-round--final"><h4 class="archive-round-title">Final</h4>';
      html += buildArchiveMatchCard(final, true);
      html += '</div>';
    }

    html += '</div>';
    knockoutEl.innerHTML = html;
  }

  currentTournament = { id: t.id, name: t.name, status: t.status };
}

function buildArchiveMatchCard(match, isFinal) {
  const finalClass = isFinal ? ' archive-match-card--final' : '';
  return `
    <div class="archive-match-card${finalClass}">
      <div class="archive-match-teams">
        <span class="archive-match-team${match.winner === match.team1_name ? ' is-winner' : ''}">${match.team1_name}</span>
        <span class="archive-match-score">${match.team1_score} – ${match.team2_score}</span>
        <span class="archive-match-team${match.winner === match.team2_name ? ' is-winner' : ''}">${match.team2_name}</span>
      </div>
      ${isFinal ? '<p class="archive-match-champion">🏆 Tournament champions</p>' : ''}
    </div>
  `;
}
