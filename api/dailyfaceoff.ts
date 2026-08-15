export const config = {
  runtime: 'edge',
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// DailyFaceoff's own team-page slugs, pulled directly from their site's team
// list rather than guessed — several don't match the NHL's own abbreviations
// (e.g. NJD/TBL/VGK here vs NJ/TB/VEG as DailyFaceoff's own shortName).
const TEAM_SLUGS: Record<string, string> = {
  ANA: 'anaheim-ducks', BOS: 'boston-bruins', BUF: 'buffalo-sabres', CGY: 'calgary-flames',
  CAR: 'carolina-hurricanes', CHI: 'chicago-blackhawks', COL: 'colorado-avalanche',
  CBJ: 'columbus-blue-jackets', DAL: 'dallas-stars', DET: 'detroit-red-wings',
  EDM: 'edmonton-oilers', FLA: 'florida-panthers', LAK: 'los-angeles-kings',
  MIN: 'minnesota-wild', MTL: 'montreal-canadiens', NSH: 'nashville-predators',
  NJD: 'new-jersey-devils', NYI: 'new-york-islanders', NYR: 'new-york-rangers',
  OTT: 'ottawa-senators', PHI: 'philadelphia-flyers', PIT: 'pittsburgh-penguins',
  SJS: 'san-jose-sharks', SEA: 'seattle-kraken', STL: 'st-louis-blues',
  TBL: 'tampa-bay-lightning', TOR: 'toronto-maple-leafs', UTA: 'utah-mammoth',
  VAN: 'vancouver-canucks', VGK: 'vegas-golden-knights', WSH: 'washington-capitals',
  WPG: 'winnipeg-jets',
};

// Even-strength forward-line/D-pair slot order, matching LineupConfig's
// [LW, C, RW] / [LD, RD] convention.
const FORWARD_SLOT: Record<string, number> = { lw: 0, c: 1, rw: 2 };
const DEFENSE_SLOT: Record<string, number> = { ld: 0, rd: 1 };

function playersInGroup(players: any[], prefix: string, index: number, slotOrder: Record<string, number>): string[] {
  const groupId = `${prefix}${index}`;
  const matches = players.filter(p => p.groupIdentifier === groupId);
  const slots: string[] = [];
  matches.forEach(p => {
    const slot = slotOrder[p.positionIdentifier];
    if (slot !== undefined) slots[slot] = p.name;
  });
  return slots;
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = (searchParams.get('team') || '').toUpperCase();
  const slug = TEAM_SLUGS[team];

  if (!slug) {
    return jsonResponse({ error: `Unknown or unsupported team abbreviation: ${team}` }, 400);
  }

  try {
    const pageRes = await fetch(`https://www.dailyfaceoff.com/teams/${slug}/line-combinations/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
    });

    if (!pageRes.ok) {
      return jsonResponse({ error: `DailyFaceoff returned ${pageRes.status}` }, 502);
    }

    const html = await pageRes.text();
    const match = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
    if (!match) {
      return jsonResponse({ error: 'Could not find line data on the page (DailyFaceoff may have changed its layout)' }, 502);
    }

    const nextData = JSON.parse(match[1]);
    const combos = nextData?.props?.pageProps?.combinations;
    if (!combos) {
      return jsonResponse({ error: 'No line combination data found for this team' }, 404);
    }

    const evPlayers: any[] = (combos.players || []).filter((p: any) => p.categoryIdentifier === 'ev');

    const forwards = [1, 2, 3, 4].map(i => {
      const line = playersInGroup(evPlayers, 'f', i, FORWARD_SLOT);
      return [line[0] || '', line[1] || '', line[2] || ''];
    });

    const defense = [1, 2, 3].map(i => {
      const pair = playersInGroup(evPlayers, 'd', i, DEFENSE_SLOT);
      return [pair[0] || '', pair[1] || ''];
    });

    const goalies = ['g1', 'g2'].map(slot =>
      evPlayers.find(p => p.groupIdentifier === 'g' && p.positionIdentifier === slot)?.name || ''
    );

    return jsonResponse({
      teamName: combos.teamName,
      sourceName: combos.sourceName,
      updatedAt: combos.updatedAt,
      forwards,
      defense,
      goalies,
    }, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message }, 500);
  }
}
