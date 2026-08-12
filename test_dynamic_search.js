import { searchPlacesLive } from './src/services/placesService.js';

async function testDynamicQueries() {
  console.log('=====================================================');
  console.log('Testing Dynamic Live Search for Arbitrary Queries');
  console.log('=====================================================');

  const queries = [
    'salem textiles',
    'coimbatore hospitals',
    'madurai restaurants',
    'erode fabrics',
    'dindigul hotels'
  ];

  for (const q of queries) {
    console.log(`\n🔍 Searching: "${q}"...`);
    const results = await searchPlacesLive(q);
    console.log(`✅ Returned ${results.length} shop leads for "${q}"`);
    results.slice(0, 4).forEach((r, idx) => {
      console.log(`  [${idx + 1}] ${r.name} (${r.category})`);
      console.log(`      📞 Phone: ${r.mobile || r.phone}`);
      console.log(`      📍 Addr: ${r.address}`);
    });
  }
}

testDynamicQueries();
