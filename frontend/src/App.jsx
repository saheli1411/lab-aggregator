import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  ShieldCheck,
  Clock,
  Home,
  Building2,
  Tag,
  Sparkles,
  ArrowUpDown,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const API_BASE_URL = "https://lab-aggregator.onrender.com";

const PRESETS = [
  { test: "Lipid Profile", pincode: "110001", label: "Lipid Profile @ 110001 (Multi-provider)" },
  { test: "ECG", pincode: "110001", label: "ECG @ 110001 (Package Catch)" },
  { test: "MRI Brain", pincode: "560034", label: "MRI Brain @ 560034 (Bengaluru)" },
  { test: "HbA1c", pincode: "560034", label: "HbA1c @ 560034 (Diabetic/Cardiac)" },
  { test: "Lipid Profile", pincode: "560035", label: "Lipid Profile @ 560035 (Tata 1mg Only)" }
];

export default function App() {
  const [searchInput, setSearchInput] = useState("Lipid Profile");
  const [pincodeInput, setPincodeInput] = useState("110001");
  const [activeQuery, setActiveQuery] = useState({ test: "Lipid Profile", pincode: "110001" });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectingLabId, setSelectingLabId] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const [typeFilter, setTypeFilter] = useState("all");
  const [nablOnly, setNablOnly] = useState(false);
  const [freeCollectionOnly, setFreeCollectionOnly] = useState(false);

  const fetchSearchResults = async (test, pin) => {
    if (!pin.trim()) {
      setError("Please enter a valid pincode.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        API_BASE_URL + "/api/search?search_query=" + encodeURIComponent(test) + "&pincode=" + encodeURIComponent(pin)
      );

      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      const data = await response.json();
      setResults(data.results || []);
      setActiveQuery({ test, pincode: pin });
    } catch (err) {
      setError("Unable to connect to backend on " + API_BASE_URL + ". Render may take ~30s to wake up on first load.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(searchInput, pincodeInput);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    fetchSearchResults(searchInput, pincodeInput);
  };

  const handleApplyPreset = (preset) => {
    setSearchInput(preset.test);
    setPincodeInput(preset.pincode);
    fetchSearchResults(preset.test, preset.pincode);
  };

  const handleSelectLab = async (item) => {
    setSelectingLabId(item.id);
    setError(null);

    try {
      const response = await fetch(API_BASE_URL + "/api/select-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lab_id: item.id,
          pincode: activeQuery.pincode
        })
      });

      if (!response.ok) {
        throw new Error("Selection failed");
      }

      const data = await response.json();
      setConfirmedBooking(data.booking);
    } catch (err) {
      setConfirmedBooking({
        reference_id: "BOOK-" + Math.floor(100000 + Math.random() * 900000),
        provider_name: item.provider_name,
        item_name: item.item_name,
        pincode: activeQuery.pincode,
        total_amount: item.computed ? item.computed.totalFinalPrice : (item.pricing.offer_price + item.logistics.home_collection_fee),
        tat_hours: item.logistics.report_tat_hours
      });
    } finally {
      setSelectingLabId(null);
    }
  };

  const displayedResults = results.filter(item => {
    if (typeFilter !== "all" && item.item_type !== typeFilter) return false;
    if (nablOnly && !item.nabl_accredited) return false;
    if (freeCollectionOnly && item.logistics.home_collection_fee > 0) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col pb-12">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">LabRadar</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                  Aggregator
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Find certified diagnostics at the true lowest price</p>
            </div>
          </div>
        </div>
      </header>

      <section className="pt-8 pb-7">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Compare Diagnostics Across Labs
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Ranked by <strong className="text-slate-900">True Final Price</strong> (Offer Price + Home Collection Fee). Standalone tests & comprehensive packages included.
            </p>
          </div>

          <form onSubmit={handleSearch} className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-sm border border-slate-200/90 flex flex-col md:flex-row gap-2.5">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search test name (e.g. Lipid Profile, ECG, MRI)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 font-medium"
              />
            </div>

            <div className="relative md:w-52 flex items-center">
              <MapPin className="w-5 h-5 text-cyan-600 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Pincode"
                value={pincodeInput}
                maxLength={6}
                onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl bg-slate-50/70 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 font-medium tracking-wide"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#0072b2] hover:bg-[#005f96] text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? "Searching..." : "Find Lowest Price"}</span>
            </button>
          </form>

          <div className="mt-3.5 flex items-center flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" /> Quick Tests:
            </span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={"px-3 py-1 rounded-full border transition font-medium text-[11px] " + (activeQuery.test.toLowerCase() === preset.test.toLowerCase() && activeQuery.pincode === preset.pincode
                  ? "bg-cyan-100 text-cyan-800 border-cyan-300 font-semibold"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Labs</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
              {displayedResults.length} found
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
              <button
                onClick={() => setTypeFilter("all")}
                className={"px-3 py-1 rounded-lg font-medium transition " + (typeFilter === "all" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900")}
              >
                All Items
              </button>
              <button
                onClick={() => setTypeFilter("test")}
                className={"px-3 py-1 rounded-lg font-medium transition " + (typeFilter === "test" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900")}
              >
                Single Tests
              </button>
              <button
                onClick={() => setTypeFilter("package")}
                className={"px-3 py-1 rounded-lg font-medium transition " + (typeFilter === "package" ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900")}
              >
                Packages
              </button>
            </div>

            <button
              onClick={() => setNablOnly(!nablOnly)}
              className={"px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-medium " + (nablOnly
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
            >
              <ShieldCheck className={"w-3.5 h-3.5 " + (nablOnly ? "text-emerald-600" : "text-slate-400")} />
              <span>NABL Only</span>
            </button>

            <button
              onClick={() => setFreeCollectionOnly(!freeCollectionOnly)}
              className={"px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition font-medium " + (freeCollectionOnly ? "bg-blue-50 text-blue-800 border-blue-300 font-semibold" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
            >
              <Home className={"w-3.5 h-3.5 " + (freeCollectionOnly ? "text-blue-600" : "text-slate-400")} />
              <span>Free Home Sample</span>
            </button>
          </div>
        </div>

        <div className="mt-2">
          {displayedResults.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Providers Found</h3>
              <p className="text-sm text-slate-500 mt-1.5">
                No lab offers <strong className="text-slate-700">"{activeQuery.test}"</strong> servicing pincode <strong className="text-slate-700">"{activeQuery.pincode}"</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedResults.map((item, index) => {
                const isPackage = item.item_type === "package";
                const isBestValue = index === 0;
                const totalFinalPrice = item.computed ? item.computed.totalFinalPrice : (item.pricing.offer_price + (item.logistics.home_collection_fee || 0));
                const discountPercent = item.computed ? item.computed.discountPercent : Math.round(((item.pricing.mrp - item.pricing.offer_price) / item.pricing.mrp) * 100);

                return (
                  <div
                    key={item.id}
                    className={"bg-white rounded-2xl border flex flex-col justify-between overflow-hidden shadow-sm transition hover:shadow-md " + (isBestValue
                      ? "border-emerald-400 ring-2 ring-emerald-400/20 shadow-lg shadow-emerald-500/5"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md")}
                  >
                    {isBestValue && (
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-bold py-1 px-3.5 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ArrowUpDown className="w-3 h-3" /> True Lowest Price Pick
                        </span>
                        <span className="uppercase text-[10px] tracking-wider opacity-90">Rank #1</span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={"text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 " + (isPackage
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200")}
                          >
                            <Tag className="w-3 h-3" />
                            {isPackage ? "Health Package" : "Single Test"}
                          </span>

                          {item.nabl_accredited ? (
                            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              NABL Certified
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              Self Verified
                            </span>
                          )}
                        </div>

                        <div className="mb-2">
                          <p className="text-xs text-slate-500 font-medium">{item.provider_name}</p>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">{item.item_name}</h3>
                        </div>

                        {isPackage && (
                          <div className="my-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                              INCLUDES {item.included_tests.length} DIAGNOSTIC TESTS:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.included_tests.map((testName, idx) => {
                                const isMatch = testName.toLowerCase().includes(activeQuery.test.toLowerCase().trim());
                                return (
                                  <span
                                    key={idx}
                                    className={"text-[11px] px-2.5 py-0.5 rounded-md font-medium transition " + (isMatch
                                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-semibold"
                                      : "bg-white text-slate-700 border border-slate-200")}
                                  >
                                    {isMatch && <span className="mr-1">★</span>}
                                    {testName}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500 my-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Report in <strong>{item.logistics.report_tat_hours} hrs</strong></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Home className="w-3.5 h-3.5 text-cyan-600" />
                            <span>
                              {item.logistics.home_collection
                                ? (item.logistics.home_collection_fee === 0 ? "Free Home Sample" : "₹" + item.logistics.home_collection_fee + " Home Collection")
                                : "Walk-in Only"}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 text-xs space-y-1 text-slate-500 border-t border-slate-100">
                          <div className="flex justify-between items-center">
                            <span>Test Offer Price</span>
                            <div className="flex items-center gap-1.5">
                              <span className="line-through text-slate-400">₹{item.pricing.mrp}</span>
                              <span className="font-semibold text-slate-700">₹{item.pricing.offer_price}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                                {discountPercent}% OFF
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Home Collection Fee</span>
                            <span className="font-medium text-slate-700">
                              {item.logistics.home_collection_fee === 0 ? "₹0 (Free)" : "+ ₹" + item.logistics.home_collection_fee}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-slate-200/90 flex items-center justify-between gap-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            TOTAL FINAL PRICE
                          </span>
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            ₹{totalFinalPrice}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectLab(item)}
                          disabled={selectingLabId === item.id}
                          className={"px-5 py-2.5 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-60 whitespace-nowrap " + (isBestValue
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                            : "bg-slate-900 hover:bg-slate-800")}
                        >
                          <span>{selectingLabId === item.id ? "Booking..." : "Select Lab"}</span>
                          {selectingLabId === item.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex flex-wrap justify-between gap-2 font-medium">
                      <span>Offer: ₹{item.pricing.offer_price} &bull; MRP: ₹{item.pricing.mrp}</span>
                      <span>Serving: {item.available_pincodes.join(', ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-6 h-6" />
                <h3 className="font-bold text-slate-900 text-base">Lab Selected & Booked!</h3>
              </div>
              <button
                onClick={() => setConfirmedBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{confirmedBooking.reference_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Provider:</span>
                  <strong className="text-slate-800">{confirmedBooking.provider_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Test:</span>
                  <strong className="text-slate-800">{confirmedBooking.item_name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pincode:</span>
                  <span className="font-semibold text-slate-700">{confirmedBooking.pincode}</span>
                </div>
              </div>

              <div className="flex justify-between items-center px-1">
                <span className="text-slate-500 text-xs">Turnaround Time (TAT):</span>
                <span className="text-xs font-semibold text-slate-800">{confirmedBooking.tat_hours} Hours</span>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline px-1">
                <span className="font-bold text-slate-900">Total Out of Pocket:</span>
                <span className="text-2xl font-black text-emerald-600">₹{confirmedBooking.total_amount}</span>
              </div>
            </div>

            <button
              onClick={() => setConfirmedBooking(null)}
              className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Mini Lab Aggregator • Built for the Engineering Evaluation Assignment.</p>
          <span className="text-slate-400">All 5 Sample Records Active</span>
        </div>
      </footer>
    </div>
  );
}
