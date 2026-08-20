export const propertyStatusOptions = [
  { name: "Rent", value: "rent" },
  { name: "Sale", value: "sale" },
];


export const propertyCategoryOptions = [
  { name: "Residential", value: "residential" },
  { name: "Commercial", value: "commercial" },
  { name: "Industrial", value: "industrial" },
];

// Your structured dynamic category map
export const propertyTypeByCategory: Record<string, { name: string; value: string }[]> = {
  residential: [
    { name: "Self Contain", value: "Self Contain" },
    { name: "Apartment", value: "Apartment" },
    { name: "Detached House", value: "Detached House" },
    { name: "Terrace House", value: "Terrace house" },
    { name: "Semi-detached House", value: "Semi-detached House" },
  ],
  commercial: [
    { name: "Land", value: "Land" },
    { name: "Shop", value: "Shop" },
    { name: "Hotel", value: "Hotel" },
    { name: "Office", value: "Office" },
    { name: "Supermarket/Mall", value: "Supermarket/Mall" },
    { name: "Filling Station", value: "Filling Station" },
    { name: "Restaurant", value: "Restaurant" },
    { name: "Event Centre", value: "Event Centre" },
    { name: "School", value: "School" },
  ],
  industrial: [
    { name: "Factory", value: "Factory" },
    { name: "Power Plant", value: "Power Plant" },
    { name: "Warehouse", value: "Warehouse" },
    { name: "Showroom", value: "Showroom" },
  ],
};

// 🚀 Adjusted Data Bridge: Maps keys to 'name' and 'value' to perfectly match SelectOption type definitions
export const propertyTypeGroupedOptions = Object.entries(propertyTypeByCategory).map(([category, items]) => ({
  group: category.charAt(0).toUpperCase() + category.slice(1), // e.g. "Residential"
  options: items.map(item => ({
    name: item.name,    // ✨ FIXED: Changed 'label' to 'name' to satisfy SelectOption interface
    value: item.value   // Keeps your backend database string
  }))
}));

// Fallbacks matching their local page select maps to prevent component breakage
export const property_type = [
  { name: "Apartment", value: "Apartment" },
  { name: "Self-Contain", value: "Self Contain" },
  { name: "Detached House", value: "Detached House" },
  { name: "Terraced House", value: "Terrace house" },
  { name: "Semi-detached House", value: "Semi-detached House" },
  { name: "Factory", value: "Factory" },
  { name: "Warehouse", value: "Warehouse" },
  { name: "Show-room", value: "Showroom" },
  { name: "Land", value: "Land" },
  { name: "Shops", value: "Shop" },
  { name: "Hotel", value: "Hotel" },
  { name: "Office", value: "Office" },
  { name: "School", value: "School" },
  { name: "Restaurant", value: "Restaurant" },
  { name: "Event Centre", value: "Event Centre" },
];

export const featureOptions = [
  { label: "Swimming Pool", value: "swimming-pool" },
  { label: "Fitted Kitchen", value: "fitted-kitchen" },
  { label: "In-built Speaker", value: "in-built-speaker" },
  { label: "En-suite", value: "en-suite" },
  { label: "Boys Quarter", value: "boys-quarter" },
  { label: "Gym", value: "gym" },
  { label: "CCTV Cameras", value: "cctv-cameras" },
  { label: "Security", value: "security" },
  { label: "Furnished", value: "furnished" },
  { label: "Elevator", value: "elevator" },
  { label: "24-hrs Electricity", value: "24-hrs-electricity" },
  { label: "Pre-paid Meter", value: "pre-paid-meter" },
  { label: "Installed Wardrobe", value: "installed-wardrobe" },
  { label: "Laundry Room", value: "laundry-room" },
  { label: "Walk-in Closet", value: "walk-in-closet" },
  { label: "Family Room", value: "family-room" },
];

// Clone map matching their exact variable casing for structural safety
export const otherFeatures = featureOptions.map(f => ({
  title: f.label,
  checked: false
}));


export const bedroomOptions = [
  { name: "1", value: "1" },
  { name: "2", value: "2" },
  { name: "3", value: "3" },
  { name: "4", value: "4" },
  { name: "5", value: "5" },
  { name: "5+", value: "5+" },
];

// Normalizing their raw arrays to use standard { name, value } matching yours
export const bedroom = [{ name: "Bedroom", value: "" }, ...bedroomOptions];
export const bathroom = [
  { name: "Bathroom", value: "" },
  { name: "1", value: "1" },
  { name: "2", value: "2" },
  { name: "3", value: "3" },
  { name: "4", value: "4" },
  { name: "5", value: "5" },
];

export const maxPriceOptions = [
  { name: "₦50,000", value: "50000" },
  { name: "₦100,000", value: "100000" },
  { name: "₦200,000", value: "200000" },
  { name: "₦500,000", value: "500000" },
  { name: "₦1,000,000", value: "1000000" },
  { name: "₦1,000,000+", value: "1000000+" },
];

export const priceRange = maxPriceOptions.map(p => ({ name: p.name.replace('₦',''), value: p.value }));

export const sortOptions = [
  { name: 'Default order', value: 'default' },
  { name: 'Price Descending', value: 'price_desc' },
  { name: 'Price Ascending', value: 'price_asc' },
  { name: 'Featured listings first', value: 'featured' },
];

export const priceSuffixOptions = [
  { name: "per month", value: "month" },
  { name: "per annum", value: "annum" },
  { name: "bi-yearly", value: "bi-yearly" },
];

export const areaSuffixOptions = [
  { name: "sq ft", value: "sqft" },
  { name: "sq m", value: "sqm" },
  { name: "sq yd", value: "sqyd" },
  { name: "acres", value: "acres" },
  { name: "hectares", value: "hectares" },
];

export const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
].map((s) => ({ name: s, value: s }));

export const nigeriaCitiesByState: Record<string, { name: string; value: string }[]> = {
  Abia: ["Aba", "Arochukwu", "Bende", "Ikwuano", "Isiala Ngwa", "Isuikwuato", "Obi Ngwa", "Ohafia", "Osisioma Ngwa", "Ugwunagbo", "Ukwa", "Umuahia", "Umu Nneochi"].map((c) => ({ name: c, value: c })),
  Adamawa: ["Demsa", "Fufore", "Ganye", "Girei", "Gombi", "Guyuk", "Hong", "Jada", "Lamurde", "Madagali", "Maiha", "Mayo-Belwa", "Michika", "Mubi", "Numan", "Shelleng", "Song", "Toungo"].map((c) => ({ name: c, value: c })),
  "Akwa Ibom": ["Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat Enin", "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam", "Udung Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"].map((c) => ({ name: c, value: c })),
  Anambra: ["Aguata", "Awka", "Anambra", "Anaocha", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili", "Ihiala", "Njikoka", "Nnewi", "Ogbaru", "Onitsha", "Orumba", "Oyi"].map((c) => ({ name: c, value: c })),
  Bauchi: ["Alkaleri","Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", "Misau", "Ningi", "Shira", "Tafawa Balewa", "Tipchi", "Toro", "Warji", "Zaki"].map((c) => ({ name: c, value: c })),
  Bayelsa: ["Yenagoa", "Ogbia", "Sagbama", "Brass", "Nembe"].map((c) => ({ name: c, value: c })),
  Benue: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala", "Vandeikya"].map((c) => ({ name: c, value: c })),
  Borno: ["Maiduguri", "Biu", "Ngala", "Dikwa", "Gwoza"].map((c) => ({ name: c, value: c })),
  "Cross River": ["Calabar", "Ikom", "Ogoja", "Obubra", "Ugep"].map((c) => ({ name: c, value: c })),
  Delta: ["Asaba", "Warri", "Sapele", "Ughelli", "Agbor"].map((c) => ({ name: c, value: c })),
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke", "Ezza", "Ishielu"].map((c) => ({ name: c, value: c })),
  Edo: ["Benin City", "Auchi", "Ekpoma", "Uromi", "Warri"].map((c) => ({ name: c, value: c })),
  Ekiti: ["Ado Ekiti", "Ikere", "Oye", "Ijero", "Ilawe"].map((c) => ({ name: c, value: c })),
  Enugu: ["Enugu", "Nsukka", "Agbani", "Awgu", "Oji River"].map((c) => ({ name: c, value: c })),
  FCT: ["Abuja", "Gwagwalada", "Kuje", "Bwari", "Kwali"].map((c) => ({ name: c, value: c })),
  Gombe: ["Gombe", "Kaltungo", "Billiri", "Bajoga", "Dukku"].map((c) => ({ name: c, value: c })),
  Imo: ["Owerri", "Orlu", "Okigwe", "Oguta", "Mbaise"].map((c) => ({ name: c, value: c })),
  Jigawa: ["Dutse", "Hadejia", "Gumel", "Kazaure", "Birnin Kudu"].map((c) => ({ name: c, value: c })),
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Saminaka", "Kauru"].map((c) => ({ name: c, value: c })),
  Kano: ["Kano", "Wudil", "Gaya", "Bichi", "Rano"].map((c) => ({ name: c, value: c })),
  Katsina: ["Katsina", "Daura", "Funtua", "Mashi", "Malumfashi"].map((c) => ({ name: c, value: c })),
  Kebbi: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Kamba"].map((c) => ({ name: c, value: c })),
  Kogi: ["Lokoja", "Okene", "Kabba", "Idah", "Ankpa"].map((c) => ({ name: c, value: c })),
  Kwara: ["Ilorin", "Offa", "Omu-Aran", "Lafiagi", "Patigi"].map((c) => ({ name: c, value: c })),
  Lagos: ["Ikeja", "Lagos Island", "Lekki", "Ikorodu", "Badagry", "Epe", "Ajah", "Victoria Island", "Surulere", "Yaba"].map((c) => ({ name: c, value: c })),
  Nasarawa: ["Lafia", "Keffi", "Akwanga", "Nasarawa", "Doma"].map((c) => ({ name: c, value: c })),
  Niger: ["Minna", "Bida", "Suleja", "Kontagora", "Lapai"].map((c) => ({ name: c, value: c })),
  Ogun: ["Abeokuta", "Sagamu", "Ijebu Ode", "Ilaro", "Ota"].map((c) => ({ name: c, value: c })),
  Ondo: ["Akure", "Ondo", "Owo", "Ikare", "Okitipupa"].map((c) => ({ name: c, value: c })),
  Osun: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo"].map((c) => ({ name: c, value: c })),
  Oyo: ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Saki"].map((c) => ({ name: c, value: c })),
  Plateau: ["Jos", "Shendam", "Pankshin", "Vom", "Barkin Ladi"].map((c) => ({ name: c, value: c })),
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Okrika"].map((c) => ({ name: c, value: c })),
  Sokoto: ["Sokoto", "Tambuwal", "Wurno", "Gwadabawa", "Illela"].map((c) => ({ name: c, value: c })),
  Taraba: ["Jalingo", "Wukari", "Bali", "Gembu", "Takum"].map((c) => ({ name: c, value: c })),
  Yobe: ["Damaturu", "Potiskum", "Gashua", "Nguru", "Geidam"].map((c) => ({ name: c, value: c })),
  Zamfara: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka", "Zurmi"].map((c) => ({ name: c, value: c })),
};
