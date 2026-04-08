import fs from "fs/promises";

const END_YEAR = new Date().getFullYear();
const START_YEAR = END_YEAR - 3;

function toIsoDate(text) {
  const d = new Date(text.replace(/\s+/g, " ").trim());
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function extractDrawsFromYearPage(html) {
  const lines = html
    .split("\n")
    .map((s) => s.replace(/\r/g, "").trim())
    .filter(Boolean);

  const draws = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const dateMatch = line.match(/^(Monday|Thursday)\s+([A-Za-z]+ \d{1,2} \d{4})$/);

    if (!dateMatch) {
      i += 1;
      continue;
    }

    const dateText = dateMatch[2];
    const nums = [];
    let j = i + 1;

    while (j < lines.length && nums.length < 6) {
      const m = lines[j].match(/^\*\s*(\d{1,2})$/);
      if (m) nums.push(Number(m[1]));
      j += 1;
    }

    if (nums.length === 6) {
      draws.push({
        date: toIsoDate(dateText),
        numbers: nums.slice(0, 5).sort((a, b) => a - b),
        special: nums[5]
      });
    }

    i = j;
  }

  return draws.filter(
    (d) =>
      d.date &&
      d.numbers.length === 5 &&
      d.numbers.every((n) => n >= 1 && n <= 49) &&
      d.special >= 1 &&
      d.special <= 7
  );
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
  return extractDrawsFromYearPage(html);
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
    try {
      console.log(`Fetching ${year}...`);
      const draws = await fetchYear(year);
      console.log(`Fetched ${year}: ${draws.length} draws`);
      all.push(...draws);
    } catch (err) {
      console.error(`Error fetching ${year}:`, err.message);
    }
  }

  const finalData = dedupeDraws(all);

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(
    "data/daily_grand_results.json",
    JSON.stringify(finalData, null, 2),
    "utf8"
  );

  console.log(`Saved ${finalData.length} draws to data/daily_grand_results.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
