export const DEFAULT_TEMPLATES: Record<string, string> = {
  bbcode: `[CENTER]
[SIZE=6][B]{{away_team}} @ {{home_team}}[/B][/SIZE]
[SIZE=4][B]Game Discussion Thread[/B][/SIZE]
[I]{{game_date}} - {{game_time}} | {{venue}}[/I]

[B]TV Broadcasts:[/B] {{tv_broadcasts}}

[HR][/HR]

[B][SIZE=5]Team Comparison[/SIZE][/B]
{{team_comparison_table}}

[HR][/HR]

[B][SIZE=5]Lineups[/SIZE][/B]
[TABLE]
[TR]
[TH][CENTER]{{away_team}} Projected Lineup[/CENTER][/TH]
[TH][CENTER]{{home_team}} Projected Lineup[/CENTER][/TH]
[/TR]
[TR]
[TD]
{{away_lineup}}
[/TD]
[TD]
{{home_lineup}}
[/TD]
[/TR]
[/TABLE]

[HR][/HR]

[B][SIZE=5]Recent Quotes[/SIZE][/B]
{{quotes}}

[HR][/HR]

[B][SIZE=5]Media Tweets[/SIZE][/B]
{{tweets}}

[HR][/HR]

[B][SIZE=5]Standings[/SIZE][/B]
{{standings_table}}
[/CENTER]`,

  markdown: `# {{away_team}} @ {{home_team}}
### Game Discussion Thread
*{{game_date}} - {{game_time}} | {{venue}}*

**TV Broadcasts:** {{tv_broadcasts}}

---

## Team Comparison
{{team_comparison_table}}

---

## Projected Lineups

### {{away_team}} Lineup
{{away_lineup}}

### {{home_team}} Lineup
{{home_lineup}}

---

## Recent Quotes
{{quotes}}

---

## Media Tweets
{{tweets}}

---

## Standings
{{standings_table}}`,

  html: `<div style="max-width: 800px; margin: 0 auto; font-family: sans-serif; color: #333; line-height: 1.6; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 32px; margin-bottom: 5px;">{{away_team}} @ {{home_team}}</h1>
    <h3 style="font-size: 20px; color: #666; margin-top: 0;">Game Discussion Thread</h3>
    <p style="font-style: italic; color: #888;">{{game_date}} - {{game_time}} | {{venue}}</p>
    <p><strong>TV Broadcasts:</strong> {{tv_broadcasts}}</p>
  </div>

  <hr style="border: 0; border-top: 1px solid #ccc; margin: 30px 0;" />

  <h2 style="font-size: 24px; color: #111; margin-bottom: 15px;">Team Comparison</h2>
  {{team_comparison_table}}

  <hr style="border: 0; border-top: 1px solid #ccc; margin: 30px 0;" />

  <h2 style="font-size: 24px; color: #111; margin-bottom: 15px;">Projected Lineups</h2>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
    <div>
      <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">{{away_team}}</h3>
      {{away_lineup}}
    </div>
    <div>
      <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">{{home_team}}</h3>
      {{home_lineup}}
    </div>
  </div>

  <hr style="border: 0; border-top: 1px solid #ccc; margin: 30px 0;" />

  <h2 style="font-size: 24px; color: #111; margin-bottom: 15px;">Recent Quotes</h2>
  {{quotes}}

  <hr style="border: 0; border-top: 1px solid #ccc; margin: 30px 0;" />

  <h2 style="font-size: 24px; color: #111; margin-bottom: 15px;">Media Tweets</h2>
  {{tweets}}

  <hr style="border: 0; border-top: 1px solid #ccc; margin: 30px 0;" />

  <h2 style="font-size: 24px; color: #111; margin-bottom: 15px;">Standings</h2>
  {{standings_table}}
</div>`
};

export class TemplateEngine {
  static render(template: string, values: Record<string, string>): string {
    let rendered = template;
    
    // Perform standard replacement
    Object.entries(values).forEach(([key, val]) => {
      const placeholder = new RegExp(`{{${key}}}`, "g");
      rendered = rendered.replace(placeholder, val);
    });

    return rendered;
  }
}
