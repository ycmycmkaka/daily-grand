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

  for (let i = 0; i < lines.length; i++) {
    const weekdayLine = lines[i];

    if (weekdayLine !== "Monday" && weekdayLine !== "Thursday") {
      continue;
    }

    const dateLine = lines[i + 1] || "";
    const isDateLine = /^[A-Za-z]+ \d{1,2} \d{4}$/.test(dateLine);
    if (!isDateLine) {
      continue;
    }

    const date = toIsoDate(dateLine);
    if (!date) {
      continue;
    }

    const nums = [];
    let j = i + 2;

    while (j < lines.length && nums.length < 6) {
      const m = lines[j].match(/^\*\s*(\d{1,2})$/);
      if (m) {
        nums.push(Number(m[1]));
      }
      j += 1;
    }

    if (nums.length === 6) {
      const mainNumbers = nums.slice(0, 5);
      const special = nums[5];

      if (
        mainNumbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 49) &&
        Number.isInteger(special) &&
        special >= 1 &&
        special <= 7
      ) {
        draws.push({
          date,
          numbers: mainNumbers.sort((a, b) => a - b),
          special
        });
      }
    }
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
  const draws = extractDrawsFromYearPage(html);
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
    try {
      const draws = await fetchYear(year);
      all.push(...draws);
    } catch (err) {
      console.error(`Error fetching ${year}: ${err.message}`);
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

  if (finalData.length === 0) {
    throw new Error("No draws were parsed. Check page structure.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
