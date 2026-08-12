async function scrapeGoogleLive(query) {
  console.log('\n========================================');
  console.log('Live Google Search Query:', query);
  console.log('========================================');

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });

    const html = await res.text();
    console.log(`Fetched Google HTML length: ${html.length} bytes`);

    // Extract business blocks & phone numbers
    const leads = [];

    // Regex for phone numbers like 094449 17099, 097879 79127, 080124 11219, 0431 241 4455, +91 9876543210
    const phoneMatches = [...html.matchAll(/(?:0|\+91\s*)?[6-9]\d{4}\s*\d{5}|0\d{2,4}\s*\d{6,8}/g)].map(m => m[0].trim());
    console.log('Extracted Phone Numbers from Google:', [...new Set(phoneMatches)]);

    // Extract headings / business titles
    const titleMatches = [...html.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
    console.log(`Extracted ${titleMatches.length} Headings:`);
    titleMatches.slice(0, 10).forEach(t => console.log('  - ', t));

    return {
      phones: [...new Set(phoneMatches)],
      titles: titleMatches
    };

  } catch (err) {
    console.error('Google scrape error:', err);
    return { phones: [], titles: [] };
  }
}

async function main() {
  await scrapeGoogleLive('puliyur shops');
  await scrapeGoogleLive('salem textiles');
}

main();
