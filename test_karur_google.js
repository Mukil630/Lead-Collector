import { parseGoogleMapsText } from './src/services/googleParserService.js';

const rawPastedText = `
Skip to main contentAccessibility help
karur shops


AI Mode
All
Maps
Images
News
Shopping
Places
More
Tools
Open now
Top rated
Sponsored
Minister White - Karur
3.8(4) · Men's Clothes Shop
Old · 04324 261 333
Closed · Opens 9:30 am
In-store shopping

POPULAR & CO GIFT & TOY SHOP
4.3(70) · Gift shop
Jawahar Bazaar Rd, opposite to K.p.m Pattu Center, near bazeer delhi sweets · 098948 67786
Closed · Opens 9:30 am
In-store shopping·
Delivery

Idhal creative store for women
4.8(395) · Boutique
No.3, municipal complex, opp prabhu readymade,madavalagam street, road · 091421 92421
Closed · Opens 10 am
Delivery

Unlimited Fashion Store -
4.7(8.1K) · Clothing store
Kovai Main Rd, near Hotel the Residency · 093114 19113
Closed · Opens 10 am
In-store shopping

Karur Paradise
4.2(280) · Cell phone store
12, perrys Plaza, 999, Kovai Main Rd · 098430 59466
Closed · Opens 9:30 am
Delivery

Tip Top Karur
4.7(1.1K) · Toy store
84, Jawahar Bazaar Rd · 081449 32071
Closed · Opens 9:15 am
In-store pick-up·
Delivery

SRI KRISHNA DEPARTMENTAL STORES
4.1(1.2K) · Grocery store
108, Kovai Main Rd · 094867 32555
Closed · Opens 9 am
Delivery

Sri Krishna Departmental Store
4.0(484) · Department store
W4W3+X54, Trichy - Karur Main Rd
Closed · Opens 9 am
Delivery

Poppy Shoppy
5.0(49) · Gift shop
2nd · 093638 33323
Closed · Opens 9:30 am
Delivery

Popular shopping
4.6(209) · Toy store
110, Kovai Main Rd · 099528 87380
Closed · Opens 9:30 am
In-store shopping·
Delivery

SreeVaMi Matchings & Clothings
4.9(23) · Clothing store
50/1, 3rd Cross Rd, opp. to delhi sweets · 098941 81878
Closed · Opens 10:30 am
In-store shopping·
In-store pick-up·
Delivery

KARUR DEPARTMENT STORE
4.7(24) · Department store
LIGHT HOUSE CORNER, 79, Rathinam Salai, opposite to Amutha Theatre · 099527 70097
Closed · Opens 9 am
On-site services

Vijay Krishna Home Needs
4.2(366) · Home goods store
Karur, Tamil Nadu · 094459 76767
Closed · Opens 9 am
Delivery

Sathya Agencies, Karur - Electronics and Home Appliances Store
4.7(659) · Appliance store
No. 977/158, Kovai Main Rd · 099942 33985
Closed · Opens 9:30 am
In-store shopping·
Kerbside pickup·
Delivery

Revathi Stores Malligai
4.2(436) · Department store
X34G+VG9 · 04324 241 731
Closed · Opens 9 am
Delivery

Queen's Shopping
5.0(4) · Boutique
276 · 099521 54566
Closed · Opens 9 am
"Nice products awesome"

Sris Gugan Inner Zone
3.8(69) · Clothing store
145, Kovai Main Rd, near AKC petrol bunk · 090430 19119
Closed · Opens 9 am
Delivery

Blueberries Men's Clothing Shop
4.6(1K) · Men's clothing store
Siva Textile, 256, Jawahar Bazaar Rd · 097905 07999
Closed · Opens 10 am
In-store shopping·
Delivery

RR Complex
4.1(61) · Shopping mall
X386+WJH, Thirukampuliyur Street, New Salem Byepass Road, NH 44 · 099524 10279
Closed · Opens 9 am

Azhagi Sarees@Salwars
4.8(22) · Clothing store
Shop No:1, Municipal Complex, GH Hospital Road, Old, GH Road, opp. Prabhu Readymade · 086677 17527
Closed · Opens 10 am
In-store pick-up

Crocodile Showroom - Karur
4.5(100) · Men's clothing store
Shop No 156/1, Coimbatore - Trichy Rd · 044 4813 3519
Closed · Opens 10 am
In-store shopping·
Delivery
`;

const extractedLeads = parseGoogleMapsText(rawPastedText, 'Karur, Tamil Nadu');

console.log('=====================================================');
console.log(`Extracted Total ${extractedLeads.length} Shop Leads from Karur Google Output!`);
console.log('=====================================================');

extractedLeads.forEach((l, idx) => {
  console.log(`\n[${idx + 1}] ${l.name}`);
  console.log(`    Category: ${l.category}`);
  console.log(`    Rating: ${l.rating} (${l.reviewsCount} reviews)`);
  console.log(`    Phone: ${l.phone || l.mobile}`);
  console.log(`    Address: ${l.address}`);
});
