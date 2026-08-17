import { LineupConfig, TweetEmbed } from "./types";

// Maps a player's "First Last" name to their headshot photo URL.
export type HeadshotMap = Record<string, string>;

// Formats a single player's name for one lineup slot (plain, or with a headshot prefixed).
type PlayerFormatter = (name: string) => string;

export interface FormatRenderer {
  id: string;
  name: string;
  renderBold(text: string): string;
  renderItalic(text: string): string;
  renderCenter(text: string): string;
  renderTable(headers: string[], rows: string[][]): string;
  renderColor(text: string, color: string): string;
  renderSize(text: string, size: string): string;
  renderImage(url: string, alt: string, size?: number): string;
  renderLineup(lineup: LineupConfig): string;
  renderLineupWithPhotos(lineup: LineupConfig, headshots: HeadshotMap): string;
  renderQuote(author: string, role: string, text: string): string;
  renderTweets(tweets: TweetEmbed[]): string;
}

export class BbCodeRenderer implements FormatRenderer {
  id = "bbcode";
  name = "XenForo BBCode";

  renderBold(text: string): string {
    return `[B]${text}[/B]`;
  }

  renderItalic(text: string): string {
    return `[I]${text}[/I]`;
  }

  renderCenter(text: string): string {
    return `[CENTER]${text}[/CENTER]`;
  }

  renderColor(text: string, color: string): string {
    return `[COLOR=${color}]${text}[/COLOR]`;
  }

  renderSize(text: string, size: string): string {
    // XenForo sizes are usually 1-7 or direct px. We assume standard 1-7 size scale where 4 is default, 5 is large, 6 is huge.
    return `[SIZE=${size}]${text}[/SIZE]`;
  }

  renderImage(url: string, _alt: string, size = 48): string {
    return `[IMG width=${size} height=${size}]${url}[/IMG]`;
  }

  renderTable(headers: string[], rows: string[][]): string {
    let out = "[TABLE]\n";

    // Headers
    out += "  [TR]\n";
    headers.forEach(h => {
      out += `    [TH]${h}[/TH]\n`;
    });
    out += "  [/TR]\n";

    // Rows
    rows.forEach(row => {
      out += "  [TR]\n";
      row.forEach(cell => {
        out += `    [TD]${cell}[/TD]\n`;
      });
      out += "  [/TR]\n";
    });

    out += "[/TABLE]";
    return out;
  }

  private buildLineup(lineup: LineupConfig, player: PlayerFormatter): string {
    let out = "";

    out += `[B][SIZE=4]Forwards[/SIZE][/B]\n`;
    lineup.forwards.forEach((line, idx) => {
      out += `Line ${idx + 1}: ${player(line[0])} - ${player(line[1])} - ${player(line[2])}\n`;
    });

    out += `\n[B][SIZE=4]Defense[/SIZE][/B]\n`;
    lineup.defense.forEach((pair, idx) => {
      out += `Pair ${idx + 1}: ${player(pair[0])} - ${player(pair[1])}\n`;
    });

    out += `\n[B][SIZE=4]Goalies[/SIZE][/B]\n`;
    out += `Starter: ${player(lineup.goalies[0])}\n`;
    out += `Backup: ${player(lineup.goalies[1])}\n`;

    if (lineup.scratches && lineup.scratches.length > 0) {
      out += `\n[I]Scratches: ${lineup.scratches.join(", ")}[/I]\n`;
    }
    if (lineup.notes) {
      out += `\n[SIZE=2]Notes: ${lineup.notes}[/SIZE]\n`;
    }

    return out;
  }

  renderLineup(lineup: LineupConfig): string {
    return this.buildLineup(lineup, name => name || "TBD");
  }

  renderLineupWithPhotos(lineup: LineupConfig, headshots: HeadshotMap): string {
    return this.buildLineup(lineup, name => {
      if (!name) return "TBD";
      const headshot = headshots[name];
      return headshot ? `[IMG width=24 height=24]${headshot}[/IMG] ${name}` : name;
    });
  }

  renderQuote(author: string, role: string, text: string): string {
    const citation = role ? `${author} (${role})` : author;
    return `[QUOTE="${citation}"]${text}[/QUOTE]`;
  }

  renderTweets(tweets: TweetEmbed[]): string {
    // Bare URLs — XenForo auto-embeds a pasted tweet link into a rich card itself.
    return tweets.map(t => t.url).join("\n\n");
  }
}

export class MarkdownRenderer implements FormatRenderer {
  id = "markdown";
  name = "Markdown (Reddit)";

  renderBold(text: string): string {
    return `**${text}**`;
  }

  renderItalic(text: string): string {
    return `*${text}*`;
  }

  renderCenter(text: string): string {
    // Markdown doesn't support center natively, fall back to HTML or normal text
    return `<center>${text}</center>`;
  }

  renderColor(text: string, _color: string): string {
    // Markdown has no text color support
    return text;
  }

  renderSize(text: string, size: string): string {
    const sizeNum = parseInt(size, 10) || 4;
    if (sizeNum >= 6) return `### ${text}`;
    if (sizeNum >= 5) return `#### ${text}`;
    return `**${text}**`;
  }

  renderImage(url: string, alt: string, _size = 48): string {
    return `![${alt}](${url})`;
  }

  renderTable(headers: string[], rows: string[][]): string {
    let out = "\n";

    // Headers
    out += `| ${headers.join(" | ")} |\n`;
    // Separator
    out += `| ${headers.map(() => "---").join(" | ")} |\n`;

    // Rows
    rows.forEach(row => {
      out += `| ${row.join(" | ")} |\n`;
    });

    return out + "\n";
  }

  private buildLineup(lineup: LineupConfig, player: PlayerFormatter): string {
    let out = "";

    out += `### Forwards\n`;
    lineup.forwards.forEach((line, idx) => {
      out += `* **Line ${idx + 1}**: ${player(line[0])} - ${player(line[1])} - ${player(line[2])}\n`;
    });

    out += `\n### Defense\n`;
    lineup.defense.forEach((pair, idx) => {
      out += `* **Pair ${idx + 1}**: ${player(pair[0])} - ${player(pair[1])}\n`;
    });

    out += `\n### Goalies\n`;
    out += `* **Starter**: ${player(lineup.goalies[0])}\n`;
    out += `* **Backup**: ${player(lineup.goalies[1])}\n`;

    if (lineup.scratches && lineup.scratches.length > 0) {
      out += `\n*Scratches: ${lineup.scratches.join(", ")}*\n`;
    }
    if (lineup.notes) {
      out += `\n*Notes: ${lineup.notes}*\n`;
    }

    return out;
  }

  renderLineup(lineup: LineupConfig): string {
    return this.buildLineup(lineup, name => name || "TBD");
  }

  renderLineupWithPhotos(lineup: LineupConfig, headshots: HeadshotMap): string {
    return this.buildLineup(lineup, name => {
      if (!name) return "TBD";
      const headshot = headshots[name];
      return headshot ? `![${name}](${headshot}) ${name}` : name;
    });
  }

  renderQuote(author: string, role: string, text: string): string {
    const citation = role ? `${author} (${role})` : author;
    return `> "${text}"\n> — *${citation}*\n`;
  }

  renderTweets(tweets: TweetEmbed[]): string {
    // Bare URLs — Reddit auto-embeds a pasted tweet link itself.
    return tweets.map(t => t.url).join("\n\n");
  }
}

export class HtmlRenderer implements FormatRenderer {
  id = "html";
  name = "HTML Blog Post";

  renderBold(text: string): string {
    return `<strong style="font-weight: bold;">${text}</strong>`;
  }

  renderItalic(text: string): string {
    return `<em style="font-style: italic;">${text}</em>`;
  }

  renderCenter(text: string): string {
    return `<div style="text-align: center;">${text}</div>`;
  }

  renderColor(text: string, color: string): string {
    return `<span style="color: ${color};">${text}</span>`;
  }

  renderSize(text: string, size: string): string {
    const sizeNum = parseInt(size, 10) || 4;
    const pxSize = sizeNum === 7 ? "32px" : sizeNum === 6 ? "24px" : sizeNum === 5 ? "20px" : "16px";
    return `<span style="font-size: ${pxSize};">${text}</span>`;
  }

  renderImage(url: string, alt: string, size = 48): string {
    return `<img src="${url}" alt="${alt}" style="height: ${size}px; width: ${size}px; border-radius: 50%; object-fit: cover;">`;
  }

  renderTable(headers: string[], rows: string[][]): string {
    let out = `<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif;">\n`;

    // Headers
    out += "  <thead>\n    <tr style=\"background-color: #2a2a2e; border-bottom: 2px solid #444;\">\n";
    headers.forEach(h => {
      out += `      <th style="padding: 10px; text-align: left; color: #fff; font-weight: bold; border: 1px solid #444;">${h}</th>\n`;
    });
    out += "    </tr>\n  </thead>\n  <tbody>\n";

    // Rows
    rows.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? "#1e1e24" : "#121216";
      out += `    <tr style="background-color: ${bg}; border-bottom: 1px solid #333;">\n`;
      row.forEach(cell => {
        out += `      <td style="padding: 10px; border: 1px solid #333; color: #ccc;">${cell}</td>\n`;
      });
      out += "    </tr>\n";
    });

    out += "  </tbody>\n</table>";
    return out;
  }

  private buildLineup(lineup: LineupConfig, player: PlayerFormatter): string {
    let out = `<div style="background-color: #1e1e24; border: 1px solid #333; border-radius: 6px; padding: 15px; font-family: sans-serif; color: #ccc;">\n`;

    out += `  <div style="font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #fff; border-bottom: 1px solid #444; padding-bottom: 5px;">Forwards</div>\n`;
    lineup.forwards.forEach((line, idx) => {
      out += `  <div style="margin: 5px 0;"><strong>Line ${idx + 1}</strong>: ${player(line[0])} - ${player(line[1])} - ${player(line[2])}</div>\n`;
    });

    out += `  <div style="font-weight: bold; font-size: 18px; margin: 15px 0 10px 0; color: #fff; border-bottom: 1px solid #444; padding-bottom: 5px;">Defense</div>\n`;
    lineup.defense.forEach((pair, idx) => {
      out += `  <div style="margin: 5px 0;"><strong>Pair ${idx + 1}</strong>: ${player(pair[0])} - ${player(pair[1])}</div>\n`;
    });

    out += `  <div style="font-weight: bold; font-size: 18px; margin: 15px 0 10px 0; color: #fff; border-bottom: 1px solid #444; padding-bottom: 5px;">Goalies</div>\n`;
    out += `  <div style="margin: 5px 0;"><strong>Starter</strong>: ${player(lineup.goalies[0])}</div>\n`;
    out += `  <div style="margin: 5px 0;"><strong>Backup</strong>: ${player(lineup.goalies[1])}</div>\n`;

    if (lineup.scratches && lineup.scratches.length > 0) {
      out += `  <div style="font-style: italic; margin-top: 15px; border-top: 1px dashed #444; padding-top: 8px;">Scratches: ${lineup.scratches.join(", ")}</div>\n`;
    }
    if (lineup.notes) {
      out += `  <div style="font-size: 12px; color: #888; margin-top: 5px;">Notes: ${lineup.notes}</div>\n`;
    }

    out += "</div>";
    return out;
  }

  renderLineup(lineup: LineupConfig): string {
    return this.buildLineup(lineup, name => name || "TBD");
  }

  renderLineupWithPhotos(lineup: LineupConfig, headshots: HeadshotMap): string {
    return this.buildLineup(lineup, name => {
      if (!name) return "TBD";
      const headshot = headshots[name];
      const img = headshot
        ? `<img src="${headshot}" alt="" style="height: 28px; width: 28px; border-radius: 50%; object-fit: cover; vertical-align: middle; margin-right: 4px;">`
        : "";
      return `${img}${name}`;
    });
  }

  renderQuote(author: string, role: string, text: string): string {
    const citation = role ? `${author}, ${role}` : author;
    return `<blockquote style="border-left: 4px solid #1a73e8; margin: 10px 0; padding: 8px 15px; background-color: #1a1a24; font-style: italic; color: #ddd;">
  <p style="margin: 0 0 5px 0;">"${text}"</p>
  <cite style="font-size: 12px; color: #999; display: block; font-style: normal;">— ${citation}</cite>
</blockquote>`;
  }

  renderTweets(tweets: TweetEmbed[]): string {
    // Twitter's own oEmbed HTML — a real embedded tweet card, not a paraphrase.
    return tweets.map(t => `<div style="margin: 15px 0;">${t.html}</div>`).join("\n");
  }
}
