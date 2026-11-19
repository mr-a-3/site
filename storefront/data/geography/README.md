# Bangladesh checkout locations

Bundled client/server data: public/bd-upazilas.json. 64 district keys normalized to public/bd-districts.json, 500 named upazilas. EN and Bangla labels; downloaded 2026-10-31. No external requests from checkout.

Base 495 entries: https://github.com/iqbalhasandev/bangladesh-geo-json (MIT; LICENSE retained here). Original downloaded source is source.json; district aliases Comilla/Cumilla, Coxsbazar/Cox's Bazar, Barisal/Barishal, Jhalakathi/Jhalokati normalized.

Five additions: Mokamtola (Bogura), Matamuhuri (Cox's Bazar), Chandraganj (Lakshmipur), Ruhia and Bhully (Thakurgaon). Government notices: https://www.dpp.gov.bd/bgpress/index.php/document/extraordinary_gazettes_monthly/2026-05-18 and https://pressinform.gov.bd/pages/all-notes/handout-8-may-2026-8fzo01-69fd65c09d0e57ba598bf59e .

Metropolitan police thanas are distinct from upazilas. An explicit Other thana / area selection reveals a required text field; this also accommodates future administrative changes. Server validates selected upazilas against the district, while explicitly entered other areas are accepted as customer address text. Changing district clears area and custom text. Historical orders are unchanged.
Dhaka additionally includes a curated alphabetical delivery-area list (city neighbourhoods plus the original upazilas). These are checkout area choices, not an official upazila classification. Other districts retain their existing lists. The API validates against the same JSON.
