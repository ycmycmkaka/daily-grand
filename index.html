import fs from "fs/promises";

const END_YEAR = new Date().getFullYear();
const START_YEAR = END_YEAR - 3;

function decodeHtmlEntities(str) {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function htmlToPlainText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style[\s\S]*?<\/style>/gi, "\n")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "\n")
      .replace(/<svg[\s\S]*?<\/svg>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|section|article|tr|table|ul|ol|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<[^>]+>/g, "\n")
      .replace(/\r/g, "")
  );
}

function toIsoDate(text) {
  const d = new Date(text.replace(/\s+/g, " ").trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function extractDrawsFromText(text) {
  const lines = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const draws = [];
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    const weekday = lines[i];

    if (weekday !== "Monday" && weekday !== "Thursday") continue;

    let dateLine = "";
    let j = i + 1;

    while (j < lines.length && j <= i + 5) {
      if (/^[A-Za-z]+ \d{1,2} \d{4}$/.test(lines[j])) {
        dateLine = lines[j];
        break;
      }
      j++;
    }

    if (!dateLine) continue;

    const date = toIsoDate(dateLine);
    if (!date) continue;

    const nums = [];
    let k = j + 1;

    while (k < lines.length && k <= j + 30 && nums.length < 6) {
      const line = lines[k];

      if (/^\d{1,2}$/.test(line)) {
        nums.push(Number(line));
      } else {
        const starMatch = line.match(/^\*\s*(\d{1,2})$/);
        if (starMatch) nums.push(Number(starMatch[1]));
      }

      k++;
    }

    if (nums.length !== 6) continue;

    const mainNumbers = nums.slice(0, 5);
    const special = nums[5];

    if (
      !mainNumbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 49) ||
      !Number.isInteger(special) ||
      special < 1 ||
      special > 7
    ) {
      continue;
    }

    const key = `${date}|${mainNumbers.join("-")}|${special}`;
    if (seen.has(key)) continue;
    seen.add(key);

    draws.push({
      date,
      numbers: [...mainNumbers].sort((a, b) => a - b),
      special
    });
  }

  return draws;
}

async function fetchYear(year) {
  const url = `https://ca.lottonumbers.com/daily-grand/numbers/${year}`;
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0",
      "accept-language": "en-CA,en;q=0.9"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${year}: ${res.status}`);
  }

  const html = await res.text();
  const text = htmlToPlainText(html);
  const draws = extractDrawsFromText(text);

  console.log(`Fetched ${year}: ${draws.length} draws`);
  return draws;
}

function dedupeDraws(draws) {
  const map = new Map();

  for (const draw of draws) {
    const key = `${draw.date}|${draw.numbers.join("-")}|${draw.special}`;
    map.set(key, draw);
  }

  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
}

async function main() {
  const all = [];

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const draws = await fetchYear(year);
    all.push(...draws);
  }

  const finalData = dedupeDraws(all);

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(
    "data/daily_grand_results.json",
    JSON.stringify(finalData, null, 2),
    "utf8"
  );

  console.log(`Saved ${finalData.length} draws to data/daily_grand_results.json`);

  if (finalData.length === 0) {
    throw new Error("No draws were parsed. Check page structure.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
