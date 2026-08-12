async function testGoogleMobile(query) {
  console.log('\n========================================');
  console.log('Testing Mobile Google Search for:', query);
  console.log('========================================');

  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=in&hl=en`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const html = await res.text();
    console.log(`Fetched Mobile Google HTML length: ${html.length} bytes`);

    // Clean HTML tags to inspect text lines
    const textNoHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                           .replace(/<style[\s\S]*?<\/style>/gi, '')
                           .replace(/<[^>]+>/g, '\n');

    const lines = textNoHtml.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log(`Extracted ${lines.length} lines from mobile Google!`);

    lines.slice(0, 45).forEach((line, idx) => {
      console.log(`[Line ${idx}] ${line}`);
    });

  } catch (err) {
    console.error(err);
  }
}

testGoogleMobile('puliyur shops');
