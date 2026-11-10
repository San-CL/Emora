import React, { useState } from "react";
import { NGODirectory, Territory } from "../types";
import { Landmark, Search, Phone, ExternalLink, Mail, MessageSquare, CheckCircle, ShieldAlert, Plus, X } from "lucide-react";

interface NgoSectionProps {
  ngos: NGODirectory[];
  territories: Territory[];
  onAddNgo: (formData: any) => Promise<boolean>;
  currentUser: any;
}

export default function NgoSection({
  ngos,
  territories,
  onAddNgo,
  currentUser
}: NgoSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTerritory, setFilterTerritory] = useState("ALL");
  const [showAddNgoModal, setShowAddNgoModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [specialisations, setSpecialisations] = useState("");
  const [selectedTerritories, setSelectedTerritories] = useState<string[]>([]);
  const [phonePrimary, setPhonePrimary] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters listings
  const filteredNgos = ngos.filter(ngo => {
    const matchesSearch = ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ngo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ngo.specialisations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTerritory = filterTerritory === "ALL" || 
                             ngo.territories.some(t => t.toLowerCase().includes(filterTerritory.toLowerCase()));

    return matchesSearch && matchesTerritory;
  });

  const handleCheckboxChange = (terrName: string) => {
    if (selectedTerritories.includes(terrName)) {
      setSelectedTerritories(selectedTerritories.filter(t => t !== terrName));
    } else {
      setSelectedTerritories([...selectedTerritories, terrName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !phonePrimary || !email) return;

    setIsSubmitting(true);
    const success = await onAddNgo({
      name,
      description,
      specialisations: specialisations.split(",").map(s => s.trim()),
      territories: selectedTerritories,
      phone_primary: phonePrimary,
      email,
      website_url: websiteUrl,
      physical_address: physicalAddress
    });

    setIsSubmitting(false);
    if (success) {
      setName("");
      setDescription("");
      setSpecialisations("");
      setSelectedTerritories([]);
      setPhonePrimary("");
      setEmail("");
      setWebsiteUrl("");
      setPhysicalAddress("");
      setShowAddNgoModal(false);
    }
  };

  return (
    <div 
      className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all animate-fade-in"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 15, 60, 0.90) 0%, rgba(13, 14, 38, 0.96) 100%), url('/src/assets/images/ngo_directory_bg_1780636950811.png')`,
        backgroundAttachment: 'scroll'
      }}
      id="ngo-network-primary"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3 py-1 bg-[#1a56db]/20 text-[#10b981] rounded-full text-xs font-semibold tracking-wider uppercase inline-block mb-3 border border-[#1a56db]/30">
          Cameroonian Protection Associations
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
          Verified NGO & Child Help Directory
        </h1>
        <p className="text-[#cbd5e1] text-base leading-relaxed">
          Connect immediately with local human rights coalitions, temporary shelter guardians, and legal counselors who are standing by to assist with family re-unifications and child defense support.
        </p>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddNgoModal(true)}
            className="mt-6 inline-flex items-center px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Verified Local NGO
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-[#0f1f3d] border border-slate-800 rounded-xl p-4 sm:p-6 mb-8 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search NGO names, help topics, counseling, rescue groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db]"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={filterTerritory}
              onChange={(e) => setFilterTerritory(e.target.value)}
              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-[#1a56db] focus:ring-1"
            >
              <option value="ALL">Filter By Territory (All)</option>
              {territories.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NGO Cards List representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="ngos-container-grid">
        {filteredNgos.map(ngo => (
          <div
            key={ngo.id}
            className="bg-[#0f1f3d] border border-slate-800 hover:border-[#1a56db]/40 rounded-xl p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-200 group"
            id={`ngo-card-${ngo.id}`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 bg-slate-800 rounded-lg text-white">
                  <Landmark className="h-5 w-5 text-[#10b981]" />
                </div>

                {ngo.is_verified && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Verified
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white mb-2 leading-snug group-hover:text-[#10b981] transition-colors">
                {ngo.name}
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                {ngo.description}
              </p>

              {/* Specialities tags block */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {ngo.specialisations.map(spec => (
                  <span key={spec} className="px-2 py-0.5 bg-slate-850 text-[#cbd5e1] text-[10px] rounded font-medium border border-slate-800">
                    {spec}
                  </span>
                ))}
              </div>

              {/* Territories covered list representation */}
              <div className="text-[11px] text-slate-400 mb-5">
                <span className="font-semibold text-slate-300 block mb-0.5">Coverage Territory:</span>
                <span className="italic">{ngo.territories.join(" · ")}</span>
              </div>
            </div>

            {/* Actions Quick Dial Buttons */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${ngo.phone_primary}`}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded text-xs font-semibold flex items-center justify-center border border-slate-750"
                >
                  <Phone className="w-3 h-3 mr-1.5 text-[#10b981]" /> Call Assistance
                </a>
                
                <a
                  href={`mailto:${ngo.email}?subject=Emora Child Safety Assistance Request`}
                  className="py-1.5 px-3 bg-slate-805 hover:bg-slate-750 text-white rounded text-xs font-semibold flex items-center justify-center border border-slate-750"
                >
                  <Mail className="w-3 h-3 mr-1.5 text-[#10b981]" /> Email Help
                </a>
              </div>

              {ngo.whatsapp_number && (
                <a
                  href={`https://wa.me/${ngo.phone_primary.replace(/[^0-9+]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-[#10b981] rounded text-xs font-bold flex items-center justify-center border border-emerald-500/25 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-2" />
                  Chat Live via WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}

        {filteredNgos.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 bg-[#0f1f3d] rounded-2xl border border-dashed border-slate-800" id="ngos-empty">
            <Landmark className="h-10 w-10 text-slate-650 mx-auto mb-3" />
            <p className="text-sm font-semibold">No protective NGOs match your search parameters. Try expanding your filters!</p>
          </div>
        )}
      </div>

      {/* Admin Panel Register NGO Modal */}
      {showAddNgoModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f3d] border border-[#1e3a8a] rounded-xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Register Verified Protection NGO</h3>
              <button
                onClick={() => setShowAddNgoModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Hope for Children Cameroon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm focus:border-[#1a56db]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Impact & Services Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe emergency shelter capacity, family trace capabilities..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Specialties / Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Trauma, Legal counseling, Temporary shelter"
                  value={specialisations}
                  onChange={(e) => setSpecialisations(e.target.value)}
                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Coverage Territories</label>
                <div className="max-h-[110px] overflow-y-auto bg-[#0a1628] border border-slate-700 rounded p-2 grid grid-cols-2 gap-1 text-xs">
                  {territories.map(t => (
                    <label key={t.id} className="flex items-center space-x-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTerritories.includes(t.name)}
                        onChange={() => handleCheckboxChange(t.name)}
                        className="rounded bg-[#0a1628] border-slate-700 text-[#1a56db]"
                      />
                      <span className="text-slate-300 truncate">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Primary Help Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+237 6..."
                    value={phonePrimary}
                    onChange={(e) => setPhonePrimary(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@ngo.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Website URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Physical Office Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Bastos, Yaounde"
                    value={physicalAddress}
                    onChange={(e) => setPhysicalAddress(e.target.value)}
                    className="w-full bg-[#0a1628] border border-slate-700 text-white rounded p-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddNgoModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-[#cbd5e1] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1a56db] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Save NGO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
