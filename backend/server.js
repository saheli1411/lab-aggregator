import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Enable CORS for Vite frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

const MOCK_LAB_DATABASE = [
  {
    id: "101",
    provider_name: "Apollo Diagnostics",
    item_type: "test",
    item_name: "Lipid Profile",
    included_tests: ["Lipid Profile"],
    available_pincodes: ["110001", "110002", "110011"],
    pricing: { mrp: 1000, offer_price: 800 },
    logistics: { home_collection: true, home_collection_fee: 100, report_tat_hours: 24 },
    nabl_accredited: true
  },
  {
    id: "102",
    provider_name: "Local City Lab",
    item_type: "test",
    item_name: "Lipid Profile",
    included_tests: ["Lipid Profile"],
    available_pincodes: ["110001"],
    pricing: { mrp: 600, offer_price: 450 },
    logistics: { home_collection: false, home_collection_fee: 0, report_tat_hours: 12 },
    nabl_accredited: false
  },
  {
    id: "103",
    provider_name: "Tata 1mg",
    item_type: "package",
    item_name: "Comprehensive Cardiac Care Package",
    included_tests: ["Lipid Profile", "ECG", "Fasting Blood Sugar", "HbA1c"],
    available_pincodes: ["110001", "110002", "560034", "560035"],
    pricing: { mrp: 3500, offer_price: 1999 },
    logistics: { home_collection: true, home_collection_fee: 0, report_tat_hours: 48 },
    nabl_accredited: true
  },
  {
    id: "104",
    provider_name: "Lal PathLabs",
    item_type: "package",
    item_name: "Basic Diabetic Package",
    included_tests: ["Fasting Blood Sugar", "HbA1c", "Lipid Profile"],
    available_pincodes: ["110001", "560034"],
    pricing: { mrp: 2200, offer_price: 1500 },
    logistics: { home_collection: true, home_collection_fee: 150, report_tat_hours: 24 },
    nabl_accredited: true
  },
  {
    id: "105",
    provider_name: "Local Scan Centre",
    item_type: "test",
    item_name: "MRI Brain",
    included_tests: ["MRI Brain"],
    available_pincodes: ["560034"],
    pricing: { mrp: 8000, offer_price: 4200 },
    logistics: { home_collection: false, home_collection_fee: 0, report_tat_hours: 4 },
    nabl_accredited: true
  }
];
// Add right before app.get('/api/search', ...)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Lab Aggregator Backend API is running successfully.',
    endpoints: {
      search: '/api/search?search_query=Lipid&pincode=110001',
      select_lab: '/api/select-lab (POST)'
    }
  });
});
// GET: Search Endpoint
app.get('/api/search', (req, res) => {
  const { search_query = '', pincode = '' } = req.query;
  const query = search_query.trim().toLowerCase();
  const pin = pincode.trim();

  let filtered = MOCK_LAB_DATABASE.filter(item => {
    if (!pin) return true;
    return item.available_pincodes.includes(pin);
  });

  if (query) {
    filtered = filtered.filter(item => {
      const matchName = item.item_name.toLowerCase().includes(query);
      const matchIncluded = item.included_tests.some(t => t.toLowerCase().includes(query));
      return matchName || matchIncluded;
    });
  }

  const withPricing = filtered.map(item => {
    const totalFinalPrice = item.pricing.offer_price + (item.logistics.home_collection_fee || 0);
    const discountPercent = Math.round(((item.pricing.mrp - item.pricing.offer_price) / item.pricing.mrp) * 100);
    return {
      ...item,
      computed: {
        totalFinalPrice,
        discountPercent
      }
    };
  });

  withPricing.sort((a, b) => a.computed.totalFinalPrice - b.computed.totalFinalPrice);

  return res.json({
    status: 'success',
    count: withPricing.length,
    results: withPricing
  });
});

// POST: Select Lab Endpoint
app.post('/api/select-lab', (req, res) => {
  console.log('Received selection request body:', req.body);
  const { lab_id, pincode } = req.body;

  const selectedItem = MOCK_LAB_DATABASE.find(item => item.id === String(lab_id));

  if (!selectedItem) {
    return res.status(404).json({ status: 'error', message: 'Lab not found' });
  }

  const totalPayable = selectedItem.pricing.offer_price + (selectedItem.logistics.home_collection_fee || 0);
  const bookingReference = `BOOK-${Math.floor(100000 + Math.random() * 900000)}`;

  console.log(`>>> Booking confirmed for ${selectedItem.provider_name} (Ref: ${bookingReference})`);

  return res.json({
    status: 'success',
    booking: {
      reference_id: bookingReference,
      provider_name: selectedItem.provider_name,
      item_name: selectedItem.item_name,
      pincode: pincode || '110001',
      total_amount: totalPayable,
      tat_hours: selectedItem.logistics.report_tat_hours
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
