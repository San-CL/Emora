import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, Cpu, HelpCircle, Check, X, ShieldAlert as UrgentIcon, Clock, ThumbsUp, Activity, RefreshCw, Mail } from "lucide-react";
import { Alert, Territory } from "../types";

interface TriagePanelProps {
  pendingAlerts: Alert[];
  territories: Territory[];
  onApprove: (id: string, emails: string[]) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestInfo: (id: string) => Promise<void>;
  refreshAlerts: () => void;
}

export default function TriagePanel({
  pendingAlerts,
  territories,
  onApprove,
  onReject,
  onRequestInfo,
  refreshAlerts
}: TriagePanelProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [aiScores, setAiScores] = useState<any>(null);
  const [loadingScores, setLoadingScores] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [filterBadge, setFilterBadge] = useState<string>("ALL");

  // Email States (User Broadcast Feature)
  const [email1, setEmail1] = useState("christellekamdem880@gmail.com");
  const [email2, setEmail2] = useState("mukete@safealert.cm");
  const [email3, setEmail3] = useState("safety-officer@cameroon-gov.org");

  useEffect(() => {
    if (pendingAlerts.length > 0 && !selectedAlertId) {
      setSelectedAlertId(pendingAlerts[0].id);
    }
  }, [pendingAlerts]);

  // Load scores lazily on alert selected
  useEffect(() => {
    if (!selectedAlertId) return;

    setAiScores(null);
    setLoadingScores(true);
    setShowRejectBox(false);
    setRejectReason("");

    fetch(`/api/alerts/${selectedAlertId}/score`, {
      method: "POST"
    })
      .then(res => res.json())
      .then(data => {
        setAiScores(data);
        setLoadingScores(false);
      })
      .catch(err => {
        console.error("Failed to fetch AI scores:", err);
        setLoadingScores(false);
      });
  }, [selectedAlertId]);

  const activeAlert = pendingAlerts.find(a => a.id === selectedAlertId);
  const territoryName = activeAlert 
    ? (territories.find(t => t.id === activeAlert.territory_id)?.name || "Unknown Region") 
    : "";

  // Filter queue by badges
  const filteredQueue = pendingAlerts.filter(alert => {
    if (filterBadge === "ALL") return true;
    if (filterBadge === "HIGH") return alert.triage_badge === "HIGH_PRIORITY";
    if (filterBadge === "NEEDS_REVIEW") return alert.triage_badge === "NEEDS_REVIEW" || !alert.triage_badge;
    return true;
  });

  const handleAction = async (action: 'approve' | 'reject' | 'info') => {
    if (!selectedAlertId) return;

    if (action === 'approve') {
      const activeEmails = [email1, email2, email3].map(e => e.trim()).filter(Boolean);
      if (confirm(`Are you sure you want to approve this alert? This will trigger SMS warning broadcasts to subscribers AND send live safety email campaigns to: ${activeEmails.join(", ")}`)) {
        await onApprove(selectedAlertId, activeEmails);
        refreshAlerts();
        setSelectedAlertId(null);
      }
    } else if (action === 'info') {
      await onRequestInfo(selectedAlertId);
      refreshAlerts();
      setSelectedAlertId(null);
    } else if (action === 'reject') {
      if (!rejectReason) {
        alert("Please enter a rejection reason");
        return;
      }
      await onReject(selectedAlertId, rejectReason);
      refreshAlerts();
      setSelectedAlertId(null);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return; // Avoid intercepting input items
      }
      if (e.key === "a" || e.key === "A") {
        handleAction("approve");
      } else if (e.key === "r" || e.key === "R") {
        setShowRejectBox(true);
      } else if (e.key === "i" || e.key === "I") {
        handleAction("info");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedAlertId, rejectReason]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" id="triage-panel-primary">
      {/* Upper overview section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold tracking-wider text-[#10b981] uppercase block mb-1">Moderator Area</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <Cpu className="h-6 w-6 mr-2.5 text-[#10b981]" />
            AI Guard Triage Board
          </h1>
          <p className="text-[#cbd5e1] text-xs mt-1">
            Review incoming reported cases from Cameroon citizens. Gemini AI scores urgency, evaluates credibility, and tags anomalies automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <button
            onClick={() => refreshAlerts()}
            className="p-2 bg-slate-800 text-[#cbd5e1] hover:text-white rounded-lg hover:bg-slate-755 border border-slate-700 font-semibold text-xs flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3 animate-spin-slow" />
            Reload Alerts Queue
          </button>
          
          <div className="bg-[#0f1f3d] border border-slate-750 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-400">Total Pending review:</span>
            <span className="px-2 py-0.5 bg-yellow-500/20 text-[#f59e0b] rounded font-bold">{pendingAlerts.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex gap-2 mb-6" id="triage-filter-bar">
        <button
          onClick={() => setFilterBadge("ALL")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
            filterBadge === "ALL" ? "bg-[#1a56db] text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          All Cases ({pendingAlerts.length})
        </button>
        <button
          onClick={() => setFilterBadge("HIGH")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center ${
            filterBadge === "HIGH" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
          High Priority ({pendingAlerts.filter(a => a.triage_badge === 'HIGH_PRIORITY').length})
        </button>
        <button
          onClick={() => setFilterBadge("NEEDS_REVIEW")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center ${
            filterBadge === "NEEDS_REVIEW" ? "bg-yellow-500 text-[#000]" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
          Needs review ({pendingAlerts.filter(a => a.triage_badge === 'NEEDS_REVIEW' || !a.triage_badge).length})
        </button>
      </div>

      {pendingAlerts.length === 0 ? (
        <div className="p-16 text-center bg-[#0f1f3d] rounded-2xl border border-dashed border-slate-800" id="triage-queue-empty">
          <ThumbsUp className="h-12 w-12 text-[#10b981] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Queue Is Clean!</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            All child safety alerts have been reviewed. There are no pending cases requiring urgent moderation right now. Great job keeping Cameroon safe!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="triage-split-layout">
          {/* LEFT LIST QUEUE (40%) */}
          <div className="lg:col-span-5 space-y-4 max-h-[680px] overflow-y-auto pr-2" id="triage-left-queue">
            {filteredQueue.map(alertItem => {
              const territory = territories.find(t => t.id === alertItem.territory_id)?.name || "Region";
              const isSelected = alertItem.id === selectedAlertId;
              return (
                <div
                  key={alertItem.id}
                  onClick={() => setSelectedAlertId(alertItem.id)}
                  className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#102a54] border-[#1a56db] shadow-md shadow-[#1a56db]/10"
                      : "bg-[#0f1f3d] border-slate-800 hover:border-slate-700"
                  }`}
                  id={`triage-card-${alertItem.id}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alertItem.type === 'missing_child' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {alertItem.type === 'missing_child' ? 'Missing Child' : 'Suspicious Person'}
                    </span>

                    {/* AI predicted badge indicator */}
                    {alertItem.triage_badge ? (
                      <span className={`px-2 py-0.5 rounded-[4px] font-bold text-[9px] uppercase ${
                        alertItem.triage_badge === 'HIGH_PRIORITY' 
                          ? 'bg-red-600 text-white' 
                          : alertItem.triage_badge === 'NEEDS_REVIEW' 
                            ? 'bg-yellow-500/30 text-yellow-400' 
                            : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {alertItem.triage_badge.replace("_", " ")}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-bold">
                        Awaiting Triage...
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-white mb-1.5 truncate">
                    {alertItem.type === 'missing_child' ? alertItem.child_name : 'Suspicious Person sighted'}
                  </h4>
                  
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {alertItem.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(alertItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-semibold text-slate-300 truncate max-w-[130px]">
                      {territory}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredQueue.length === 0 && (
              <div className="p-8 text-center bg-slate-900 rounded-xl text-slate-500 text-xs">
                No alerts match the clicked filter level.
              </div>
            )}
          </div>

          {/* RIGHT METRICS DETAIL (60%) */}
          <div className="lg:col-span-7" id="triage-right-analysis">
            {activeAlert ? (
              <div className="bg-[#0f1f3d] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between h-full">
                {/* Upper description review */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 mb-6">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase block tracking-wider">Citizen Submission ID: {activeAlert.id}</span>
                      <h3 className="text-xl font-bold text-white mt-1">
                        {activeAlert.type === 'missing_child' ? `Search Case: ${activeAlert.child_name}` : 'Sightings Report Analysis'}
                      </h3>
                    </div>

                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 text-xs font-semibold">
                        {territoryName}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                    {/* Reporter info */}
                    <div className="md:col-span-8 space-y-4">
                      {activeAlert.type === 'missing_child' && (
                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                          <div>
                            <span className="text-slate-400 block font-medium">Child Age:</span>
                            <span className="text-white font-bold">{activeAlert.child_age || 'Unknown'} years old</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Last Location:</span>
                            <span className="text-white font-bold">{activeAlert.last_known_location}</span>
                          </div>
                          {activeAlert.physical_description && (
                            <div className="col-span-2 pt-2 border-t border-slate-800 mt-2">
                              <span className="text-slate-400 block font-medium">Physical Description / Accents:</span>
                              <span className="text-slate-200">{activeAlert.physical_description}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Incident Narration:</span>
                        <p className="p-3.5 bg-slate-900 rounded-xl text-sm text-slate-200 leading-relaxed max-h-[140px] overflow-y-auto">
                          {activeAlert.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold p-2.5 bg-[#102a54]/30 rounded-lg">
                        <div>
                          <span className="text-slate-400 block font-medium">Submitted By:</span>
                          <span className="text-white">{activeAlert.reporter_name}</span>
                        </div>
                        <div className="border-l border-slate-700 pl-4">
                          <span className="text-slate-400 block font-medium">Reporter Contacts:</span>
                          <span className="text-slate-200">{activeAlert.reporter_contact}</span>
                        </div>
                      </div>
                    </div>

                    {/* Image thumb */}
                    {activeAlert.photo_url && (
                      <div className="md:col-span-4 select-none">
                        <span className="text-xs font-semibold text-slate-400 block mb-1">Attached Photo:</span>
                        <div className="aspect-square w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <img
                            src={activeAlert.photo_url}
                            alt="Missing child report photo"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI SCORES PANEL */}
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm font-semibold text-slate-300">
                        <Cpu className="h-4 w-4 mr-2 text-[#10b981]" />
                        <span>Gemini AI Safety Scoring Diagnoses</span>
                      </div>
                      
                      {loadingScores && (
                        <div className="flex items-center text-xs text-slate-400 select-none">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Evaluating risk metrics...
                        </div>
                      )}
                    </div>

                    {loadingScores ? (
                      <div className="space-y-3 p-4 bg-slate-900/60 rounded-xl animate-pulse">
                        <div className="h-4 bg-slate-850 rounded w-1/3"></div>
                        <div className="h-2.5 bg-slate-850 rounded w-full"></div>
                        <div className="h-2.5 bg-slate-850 rounded w-2/3"></div>
                      </div>
                    ) : aiScores ? (
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-[#1e3a8a]/45 space-y-4">
                        {/* Summary */}
                        <div className="text-xs italic text-[#cbd5e1] leading-relaxed bg-[#0a1628] p-3 rounded-lg border-l-2 border-[#10b981]">
                          <span className="font-bold text-[#10b981] block not-italic mb-0.5">AI Summary Analysis:</span>
                          "{aiScores.ai_summary}"
                        </div>

                        {/* Scores bar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-300 font-semibold flex items-center">
                                <UrgentIcon className="w-3.5 h-3.5 mr-1 text-red-400" /> Urgency Level
                              </span>
                              <span className="font-mono text-[#ef4444] font-bold">{aiScores.urgency_score}/10</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2">
                              <div
                                style={{ width: `${(aiScores.urgency_score || 5) * 10}%` }}
                                className={`rounded-full h-full transition-all duration-300 ${
                                  aiScores.urgency_score >= 7 ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-slate-300 font-semibold flex items-center">
                                <Check className="w-3.5 h-3.5 mr-1 text-[#10b981]" /> Source Credibility
                              </span>
                              <span className="font-mono text-[#10b981] font-bold">{aiScores.credibility_score}/10</span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2">
                              <div
                                style={{ width: `${(aiScores.credibility_score || 5) * 10}%` }}
                                className="bg-[#10b981] rounded-full h-full transition-all duration-300"
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Flags and Actions tag */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                          {/* Flags List */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-400">Flags Raised:</span>
                            {aiScores.ai_flags && aiScores.ai_flags.length > 0 ? (
                              aiScores.ai_flags.map((fl: string) => (
                                <span key={fl} className="bg-red-950 text-red-400 font-mono text-[9px] px-2 py-0.5 rounded border border-red-900">
                                  {fl.replace("_", " ")}
                                </span>
                              ))
                            ) : (
                              <span className="bg-emerald-950 text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded border border-emerald-900">
                                no critical flags
                              </span>
                            )}
                          </div>

                          {/* Machine action recommendation */}
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-400 font-semibold">Triage suggestion:</span>
                            {aiScores.suggested_action === 'approve' ? (
                              <span className="text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 border border-[#10b981]/30 rounded uppercase tracking-wider text-[9px]">
                                Approve & Broadcast
                              </span>
                            ) : aiScores.suggested_action === 'reject' ? (
                              <span className="text-red-400 bg-red-500/15 px-2 py-0.5 border border-red-500/30 rounded uppercase tracking-wider text-[9px]">
                                Reject Report
                              </span>
                            ) : (
                              <span className="text-yellow-400 bg-yellow-500/15 px-2 py-0.5 border border-yellow-500/30 rounded uppercase tracking-wider text-[9px]">
                                Request Info First
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-900 rounded-lg">
                        Unable to complete safety diagnostic.
                      </div>
                    )}
                  </div>
                </div>

                {/* EMAIL BROADCAST RECIPIENTS (User-requested feature) */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 mt-6 text-left">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Mail className="h-4 w-4 text-[#cbd5e1]" />
                    <span>Direct Email Broadcast Targets (Up to 3 addresses)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Specify three priority email addresses to receive the direct broadcast, featuring full description details, attached photo, and live tracing link.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-[10px] font-mono font-bold text-slate-500">1</span>
                      <input
                        type="email"
                        value={email1}
                        onChange={(e) => setEmail1(e.target.value)}
                        placeholder="Email address 1"
                        className="w-full bg-[#0a1628] border border-slate-755 text-white rounded p-2 pl-6 text-xs font-semibold font-mono focus:border-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-[10px] font-mono font-bold text-slate-500">2</span>
                      <input
                        type="email"
                        value={email2}
                        onChange={(e) => setEmail2(e.target.value)}
                        placeholder="Email address 2"
                        className="w-full bg-[#0a1628] border border-slate-755 text-white rounded p-2 pl-6 text-xs font-semibold font-mono focus:border-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-[10px] font-mono font-bold text-slate-500">3</span>
                      <input
                        type="email"
                        value={email3}
                        onChange={(e) => setEmail3(e.target.value)}
                        placeholder="Email address 3"
                        className="w-full bg-[#0a1628] border border-slate-755 text-white rounded p-2 pl-6 text-xs font-semibold font-mono focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* OVERRIDE MODERATION BUTTON SET */}
                <div className="mt-6 pt-6 border-t border-slate-800">
                  {showRejectBox ? (
                    <div className="space-y-3 animate-fade-in mb-3">
                      <label className="text-xs font-semibold text-red-400 block">Give Rejection Reason (sent to Submitter):</label>
                      <input
                        type="text"
                        required
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Duplicate report list, vague details or inappropriate content"
                        className="w-full bg-[#0a1628] border border-red-500 text-white rounded p-1.5 text-xs focus:ring-1 focus:ring-red-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRejectBox(false)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAction("reject")}
                          className="px-3 py-1 bg-[#ef4444] text-[#000] rounded text-xs font-bold"
                        >
                          Confirm Reject (R)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => handleAction("approve")}
                        className="flex-1 py-3 px-4 bg-[#10b981] hover:bg-emerald-650 text-[#0a1628] rounded-xl font-bold text-sm tracking-wide flex items-center justify-center shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
                      >
                        <Check className="h-4.5 w-4.5 mr-2 stroke-[3px]" />
                        Approve Case (A)
                      </button>

                      <button
                        onClick={() => handleAction("info")}
                        className="py-3 px-4 bg-slate-800 hover:bg-slate-750 text-[#cbd5e1] rounded-xl font-semibold text-sm flex items-center justify-center border border-slate-750"
                      >
                        Request Info (I)
                      </button>

                      <button
                        onClick={() => setShowRejectBox(true)}
                        className="py-3 px-4 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/50 rounded-xl font-bold text-sm flex items-center justify-center"
                      >
                        Reject Alert (R)
                      </button>
                    </div>
                  )}

                  {/* Keyboard hints */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono">
                    <span>Keyboard shortcuts:</span>
                    <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">A</kbd> Approve</span>
                    <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">R</kbd> Reject</span>
                    <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">I</kbd> Request Info</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 bg-[#0f1f3d] rounded-2xl border border-slate-800 h-full flex flex-col items-center justify-center">
                <HelpCircle className="h-10 w-10 text-slate-650 mb-2" />
                <p className="text-sm">Select an alert from the queue to start AI scoring analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
