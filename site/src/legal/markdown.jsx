// A small Markdown subset for the policy files, so the School and its advisers can edit plain text.
// Blocks: ## / ### / #### headings, paragraphs, "- " and "1. " lists, | tables |, and fenced
// containers ":::box Title", ":::note Title", ":::values" and ":::contact Heading", closed by ":::".
// Inline: **bold**, *italic* and [links](/path).

const headingId = (text) => {
  const numbered = text.match(/^(\d+(?:\.\d+)*)\.?\s/);
  if (numbered) return `s-${numbered[1].replace(/\./g, "-")}`;
  return text.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};

export function parse(source) {
  const lines = source.replace(/\r/g, "").split("\n");
  let index = 0;

  const readBlocks = (inContainer) => {
    const blocks = [];
    let paragraph = [];
    const flush = () => { if (paragraph.length) { blocks.push({ type: "p", text: paragraph.join(" ") }); paragraph = []; } };
    while (index < lines.length) {
      const line = lines[index].trim();
      if (line === ":::" && inContainer) { index += 1; break; }
      if (!line) { flush(); index += 1; continue; }
      const container = line.match(/^:::(\w+)\s*(.*)$/);
      if (container) {
        flush(); index += 1;
        const [, kind, title] = container;
        const children = readBlocks(true);
        blocks.push({ type: "container", kind, title, id: kind === "contact" ? headingId(title) : undefined, children });
        continue;
      }
      const heading = line.match(/^(#{2,4})\s+(.*)$/);
      if (heading) { flush(); blocks.push({ type: `h${heading[1].length}`, text: heading[2], id: headingId(heading[2]) }); index += 1; continue; }
      if (/^(- |\d+\.\s)/.test(line)) {
        flush();
        const ordered = /^\d+\.\s/.test(line);
        const items = [];
        while (index < lines.length && (ordered ? /^\d+\.\s/ : /^- /).test(lines[index].trim())) {
          items.push(lines[index].trim().replace(ordered ? /^\d+\.\s+/ : /^- /, ""));
          index += 1;
        }
        blocks.push({ type: ordered ? "ol" : "ul", items });
        continue;
      }
      if (line.startsWith("|")) {
        flush();
        const rows = [];
        while (index < lines.length && lines[index].trim().startsWith("|")) {
          const cells = lines[index].trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
          if (!cells.every((cell) => /^-+$/.test(cell))) rows.push(cells);
          index += 1;
        }
        blocks.push({ type: "table", head: rows[0], rows: rows.slice(1) });
        continue;
      }
      paragraph.push(line);
      index += 1;
    }
    flush();
    return blocks;
  };

  return readBlocks(false);
}

export function Inline({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, key) => {
    if (part.startsWith("**")) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return <a key={key} href={link[2]} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{link[1]}</a>;
    }
    return part;
  });
}
