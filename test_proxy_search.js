async function testProxySearch(query) {
  console.log('\n========================================');
  console.log('Testing Proxy Google Search for:', query);
  console.log('========================================');

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;

  try {
    // Try via allorigins
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(googleUrl)}`;
    const res = await fetch(proxyUrl);
    const html = await res.text();

    console.log(`Fetched Proxy HTML length: ${html.length} bytes`);

    // Clean HTML
    const textNoHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                           .replace(/<style[\s\S]*?<\/style>/gi, '')
                           .replace(/<[^>]+>/g, '\n');

    const lines = textNoHtml.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log(`Extracted ${lines.length} lines from proxy!`);

    lines.slice(0, 30).forEach((l, i) => console.log(`[${i}] ${l}`));

  } catch (err) {
    console.error('Proxy search error:', err);
  }
}

testProxySearch('puliyur shops');
testProxySearch('salem textiles');
