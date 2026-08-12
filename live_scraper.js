async function liveSearchScrape(query) {
  console.log('\n========================================');
  console.log('Live Web Search Query:', query);
  console.log('========================================');

  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' phone number address')}`;

  try {
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = await res.text();
    console.log(`Fetched HTML length: ${html.length} bytes`);

    // Match DuckDuckGo result snippets
    const titleRegex = /<a class="result__a"[^>]*>(.*?)<\/a>/g;
    const snippetRegex = /<a class="result__snippet"[^>]*>(.*?)<\/a>/g;

    const titles = [];
    let match;
    while ((match = titleRegex.exec(html)) !== null) {
      titles.push(match[1].replace(/<[^>]+>/g, '').trim());
    }

    const snippets = [];
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
    }

    console.log(`Found ${titles.length} title results and ${snippets.length} snippet results.`);

    const leads = [];
    const phoneRegex = /(?:0|\+91\s*)?\d{4,5}\s*\d{5,6}|\b09\d{9}\b|\b0431\s*\d{6}\b/;

    for (let i = 0; i < Math.min(titles.length, snippets.length); i++) {
      const title = titles[i];
      const snippet = snippets[i];
      const phoneMatch = snippet.match(phoneRegex) || title.match(phoneRegex);
      const phone = phoneMatch ? phoneMatch[0] : '';

      leads.push({
        title: title,
        snippet: snippet,
        phone: phone
      });
    }

    leads.slice(0, 8).forEach((l, idx) => {
      console.log(`\n[${idx + 1}] ${l.title}`);
      console.log(`    Snippet: ${l.snippet.slice(0, 100)}...`);
      console.log(`    Extracted Phone: ${l.phone || 'None'}`);
    });

    return leads;

  } catch (err) {
    console.error('Scrape error:', err);
    return [];
  }
}

async function main() {
  await liveSearchScrape('puliyur shops');
  await liveSearchScrape('salem textiles');
  await liveSearchScrape('trichy hotels');
}

main();
