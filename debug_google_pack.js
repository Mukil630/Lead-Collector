async function inspectGooglePack(query) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&gl=in&hl=en`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  const html = await res.text();

  // Look for text blocks containing ratings like 4.5(20) or phone numbers 09xxx or 0431
  const textNoHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                         .replace(/<style[\s\S]*?<\/style>/gi, '')
                         .replace(/<[^>]+>/g, '\n');

  const lines = textNoHtml.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  console.log(`Extracted ${lines.length} clean text lines from Google for "${query}":`);

  const phoneRegex = /(?:0|\+91\s*)?[6-9]\d{4}\s*\d{5}|\b0\d{2,4}\s*\d{6,8}\b|\b09\d{9}\b/;
  const ratingRegex = /\b[1-5]\.\d\s*\(\d+\)/;

  lines.forEach((line, idx) => {
    if (ratingRegex.test(line) || phoneRegex.test(line) || line.includes('Textiles') || line.includes('Hotels') || line.includes('Mill') || line.includes('Store')) {
      console.log(`Line ${idx}: ${line}`);
    }
  });
}

inspectGooglePack('puliyur shops');
inspectGooglePack('trichy hotels');
