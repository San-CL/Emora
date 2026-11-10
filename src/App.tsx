import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, AlertTriangle, Cpu, Landmark, BookOpen, Layers, 
  MapPin, Phone, User, Clock, Share2, Check, Send, AlertOctagon,
  LogOut, Plus, Trash2, Heart, Activity, ArrowRight, Video, 
  Users, Smartphone, MessageSquare, CheckCircle, Flame, Building, 
  Copy, BarChart3, Mail, RefreshCw, X, Eye, FileText
} from "lucide-react";

import Navbar from "./components/Navbar";
import TriagePanel from "./components/TriagePanel";
import NgoSection from "./components/NgoSection";
import EducationSection from "./components/EducationSection";
import WomenSection from "./components/WomenSection";
import { Profile, Territory, Alert, EmergencyAlert, SmsLog, EducationContent, NGODirectory } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  
  // App Config and Database
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [ngos, setNgos] = useState<NGODirectory[]>([]);
  const [education, setEducation] = useState<EducationContent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Login / Register Form states
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authTerritories, setAuthTerritories] = useState<string[]>(["Centre (Yaoundé)"]);
  const [authError, setAuthError] = useState("");

  // Report Form states
  const [reportType, setReportType] = useState<'missing_child' | 'suspicious_person'>('missing_child');
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [physicalDesc, setPhysicalDesc] = useState("");
  const [caseDesc, setCaseDesc] = useState("");
  const [caseLocation, setCaseLocation] = useState("");
  const [caseTerritory, setCaseTerritory] = useState("");
  const [reporterContact, setReporterContact] = useState("");
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [submittedShortId, setSubmittedShortId] = useState("");

  // Emergency Panic modal states
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyType, setEmergencyType] = useState("Assault Attempt");
  const [emergencyNote, setEmergencyNote] = useState("");
  const [emergencySuccess, setEmergencySuccess] = useState(false);

  // Router Simulation for specialized SMS landing page
  const [smsLandingAlertId, setSmsLandingAlertId] = useState<string | null>(null);

  // Load configuration and data
  const fetchData = () => {
    setLoading(true);
    // Fetch system configurations
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        setTerritories(data.territories || []);
        if (data.territories && data.territories.length > 0) {
          setCaseTerritory(data.territories[0].id);
        }
        setNgos(data.ngos || []);
        setEducation(data.education || []);
      })
      .catch(e => console.error("Config fetch failed:", e));

    // Fetch alerts
    fetch("/api/alerts")
      .then(res => res.json())
      .then(data => {
        setAlerts(data.alerts || []);
      })
      .catch(e => console.error("Alerts fetch failed:", e));

    // Check auth session
    fetch("/api/auth/me")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // Fetch admin specific logs if role is allowed
    fetch("/api/admin/sms-email-logs")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.logs) setLogs(data.logs);
      });

    fetch("/api/admin/users")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.users) setUsers(data.users);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    // Check path for SMS landing page deep links (/alerts/:shortId)
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/alerts\/([a-zA-Z0-9_]+)/);
    if (match && match[1]) {
      setSmsLandingAlertId(match[1]);
    }
    
    // Check query params if path routing is in subfolders
    const params = new URLSearchParams(window.location.search);
    const queryAlertId = params.get("alert_id");
    if (queryAlertId) {
      setSmsLandingAlertId(queryAlertId);
    }

    fetchData();
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        setCurrentUser(null);
        setActiveTab("home");
      });
  };

  const handleLoginRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegisterMode 
      ? { 
          full_name: authFullName, 
          phone_number: authPhone, 
          email: authEmail, 
          password: authPassword, 
          territories: authTerritories 
        }
      : { email: authEmail, password: authPassword };

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(d => { throw new Error(d.error || "Authentication failed") });
        }
        return res.json();
      })
      .then(data => {
        setCurrentUser(data.user);
        fetchData(); // Reload stats and logs
        const prevTab = activeTab === "login" ? "home" : activeTab;
        setActiveTab(prevTab);
        
        // Reset forms
        setAuthEmail("");
        setAuthPassword("");
        setAuthFullName("");
        setAuthPhone("");
      })
      .catch(err => {
        setAuthError(err.message);
      });
  };

  // Submit report alerts
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("A photograph must be maximum 5MB to preserve compression bandwidth.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Maximum 5MB photograph allowed.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setActiveTab("login");
      return;
    }

    if (!caseDesc || !caseLocation || !caseTerritory) {
      alert("All core fields are required.");
      return;
    }

    if (reportType === 'missing_child' && !uploadedBase64) {
      alert("A photograph is strictly required for missing child alerts to aid public tracing!");
      return;
    }

    const payload = {
      type: reportType,
      child_name: reportType === 'missing_child' ? childName : undefined,
      child_age: reportType === 'missing_child' ? childAge : undefined,
      physical_description: reportType === 'missing_child' ? physicalDesc : undefined,
      description: caseDesc,
      last_known_location: caseLocation,
      territory_id: caseTerritory,
      photo_url: uploadedBase64 || undefined,
      reporter_contact: reporterContact
    };

    fetch("/api/alerts/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error) });
        return res.json();
      })
      .then(data => {
        setReportSuccess(true);
        setSubmittedShortId(data.alert.short_id);
        fetchData(); // Reload list
        
        // Clear state
        setChildName("");
        setChildAge("");
        setPhysicalDesc("");
        setCaseDesc("");
        setCaseLocation("");
        setUploadedBase64(null);
        setReporterContact("");
      })
      .catch(err => {
        alert("Error submitting alert: " + err.message);
      });
  };

  // Submit Emergency Panic SOS Modal
  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      emergency_type: emergencyType,
      description: emergencyNote,
      territory_id: "t1" // Center- Yaounde default fallback
    };

    fetch("/api/emergency/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setEmergencySuccess(true);
        setEmergencyNote("");
        fetchData();
        setTimeout(() => {
          setShowEmergencyModal(false);
          setEmergencySuccess(false);
        }, 3000);
      });
  };

  // Moderator actions
  const handleApprove = async (id: string, emails?: string[]) => {
    await fetch(`/api/alerts/${id}/approve`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails })
    });
    fetchData();
  };

  const handleReject = async (id: string, reason: string) => {
    await fetch(`/api/alerts/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    fetchData();
  };

  const handleRequestInfo = async (id: string) => {
    await fetch(`/api/alerts/${id}/request_info`, { method: "POST" });
    fetchData();
  };

  // Add video lesson (Admin only)
  const handleAddEducation = async (formData: any) => {
    const res = await fetch("/api/admin/education", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      fetchData();
      return true;
    }
    return false;
  };

  // Add verified NGO (Admin only)
  const handleAddNgo = async (formData: any) => {
    const res = await fetch("/api/admin/ngos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      fetchData();
      return true;
    }
    return false;
  };

  // Add flags for false reports
  const handleFlagReport = (id: string) => {
    fetch(`/api/alerts/${id}/flag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Public user reported false content" })
    })
      .then(res => res.json())
      .then(data => {
        alert(`Thank you. Alert flag count is now ${data.flags_count}. If an alert collects 5 flags, it is automatically withdrawn for moderator recalculation.`);
        fetchData();
      });
  };

  const copyLandingLink = (shortId: string) => {
    const link = `${window.location.origin}/alerts/${shortId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // -------------------------------------------------------------
  // RENDER DEDICATED SMS LANDING VIEW FOR TOURISTS & PUBLIC
  // -------------------------------------------------------------
  if (smsLandingAlertId) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0a1628] text-white flex flex-col items-center justify-center p-24 text-slate-400 select-none">
          <RefreshCw className="h-8 w-8 text-[#10b981] animate-spin mb-4" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981]">Loading Search Dispatch...</span>
        </div>
      );
    }

    const landingAlert = alerts.find(a => a.short_id === smsLandingAlertId || a.id === smsLandingAlertId);
    const associatedTerritory = landingAlert 
      ? (territories.find(t => t.id === landingAlert.territory_id)?.name || "Primary Sighting")
      : "";

    return (
      <div className="min-h-screen bg-[#0a1628] text-white p-4 sm:p-8 flex items-center justify-center font-sans">
        <div className="max-w-xl w-full bg-[#0f1f3d] border border-[#1e3a8a] rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="p-4 bg-red-950/40 border-b border-red-900/30 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse animate-bounce" />
              <span className="font-bold tracking-tight text-xs uppercase text-red-400">URGENT SEARCH BROADCAST</span>
            </div>
            <button 
              onClick={() => {
                setSmsLandingAlertId(null);
                window.history.pushState({}, "", "/");
              }}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300"
            >
              Go to Homepage
            </button>
          </div>

          {landingAlert ? (
            <div className="p-6 space-y-6">
              {/* LARGE CENTRED PICTURE AT TOP - PRIMARY THEME */}
              {landingAlert.photo_url && (
                <div className="relative aspect-[4/3] w-full bg-slate-950 rounded-xl overflow-hidden border border-[#1e3a8a] shadow-inner select-none">
                  <img 
                    src={landingAlert.photo_url} 
                    alt="Current investigation victim" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pt-12 text-center">
                    <h2 className="text-2xl font-black text-white hover:text-[#10b981] transition-colors leading-tight">
                      {landingAlert.child_name || "MISSING INDIVIDUAL"}
                    </h2>
                    <p className="text-[#10b981] font-bold text-xs">
                      {landingAlert.child_age ? `Age: ${landingAlert.child_age} | ` : ""}{associatedTerritory}
                    </p>
                  </div>
                </div>
              )}

              {/* REPORT DETAILS FROM SUBMITTING USER */}
              <div className="bg-[#0a1628] p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block font-bold">
                  OFFICIAL PUBLIC NOTICE DETAILS
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans font-medium">
                  {landingAlert.description}
                </p>

                {landingAlert.physical_description && (
                  <div className="pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 block font-bold mb-1">PHYSICAL DESCRIPTION:</span>
                    <span className="p-2 bg-[#0d1e36] text-[#cbd5e1] block rounded font-light border border-slate-800">
                      {landingAlert.physical_description}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-slate-400 block font-bold">Last Location Sighted:</span>
                    <span className="font-semibold text-white inline-flex items-center mt-0.5">
                      <MapPin className="h-3 w-3 mr-1 text-[#10b981]" />
                      {landingAlert.last_known_location}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Time Reported:</span>
                    <span className="font-semibold text-white inline-flex items-center mt-0.5">
                      <Clock className="h-3 w-3 mr-1 text-[#10b981]" />
                      {new Date(landingAlert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTION CALL TO ACTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a 
                  href={`tel:${landingAlert.reporter_contact}`}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center shadow-lg transition-transform hover:scale-[1.01]"
                >
                  <Phone className="w-4 h-4 mr-2 animate-bounce fill-white" />
                  Call Contact Hotline
                </a>

                <a 
                  href={`https://wa.me/${landingAlert.reporter_contact.replace(/[^0-9]/g, "")}?text=Hello, I have a sighting update regarding the Emora report about ${landingAlert.child_name || 'the child'} near ${landingAlert.last_known_location}`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm tracking-wide flex items-center justify-center transition-transform hover:scale-[1.01]"
                >
                  <MessageSquare className="w-4 h-4 mr-2 fill-white" />
                  WhatsApp Tip Now
                </a>
              </div>

              {/* SOCIAL MEDIA BROADCAST CHANNELS */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block mb-2 tracking-widest font-mono uppercase font-bold">Forward Link To Trace Child</span>
                <div className="flex justify-center gap-1.5" id="landing-social-share">
                  <a 
                    href={`https://api.whatsapp.com/send?text=URGENT ALERT: ${landingAlert.child_name || 'Child'} is missing from ${landingAlert.last_known_location}. See foto and report details immediately: ${window.location.href}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#075e54]/20 text-[#25d366] hover:bg-[#075e54]/30 rounded-lg text-xs font-bold border border-[#25d366]/20 inline-flex items-center"
                  >
                    Share WhatsApp
                  </a>

                  <a 
                    href={`https://twitter.com/intent/tweet?text=URGENT: ${landingAlert.child_name || 'Child'} is missing in ${associated_territory_or_region(associatedTerritory)}. Tracing help requested &photo included: ${window.location.href}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-900 text-[#38bdf8] hover:bg-slate-850 rounded-lg text-xs font-bold border border-slate-800 inline-flex items-center"
                  >
                    Share Twitter
                  </a>

                  <button 
                    onClick={() => copyLandingLink(landingAlert.short_id)}
                    className="p-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg text-xs font-bold border border-slate-700 inline-flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copiedId === landingAlert.short_id ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
              <p className="font-semibold text-lg">Alert Code Invalid</p>
              <p className="text-slate-400 text-sm">That missing child case may have been archived, marked found, or expired.</p>
              <button 
                onClick={() => {
                  setSmsLandingAlertId(null);
                  window.history.pushState({}, "", "/");
                }}
                className="px-4 py-2 bg-slate-800 text-white rounded text-xs"
              >
                Go Home
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD INTERACTIVE WEB INTERFACE
  // -------------------------------------------------------------
  const recentCarouselAlerts = alerts.filter(a => a.status === 'active' || a.status === 'under_review').slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex flex-col font-sans">
      <Navbar 
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openEmergencyModal={() => setShowEmergencyModal(true)}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 text-slate-400 animate-pulse select-none">
              <RefreshCw className="h-8 w-8 text-[#10b981] animate-spin mb-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#10b981]">Loading Emora Cameroon Channels...</span>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {/* TAB: HOME */}
              {activeTab === "home" && (
                <div 
                  className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-12 bg-cover bg-center bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(46, 16, 75, 0.88) 0%, rgba(13, 14, 38, 0.95) 100%), url('/src/assets/images/woman_child_background_1780636677628.png')`,
                    backgroundAttachment: 'scroll'
                  }}
                >
                  {/* Top Header & Emergency SOS Panel */}
                  <div className="max-w-4xl mx-auto text-center space-y-6 pt-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
                      Your Safety, Our Priority
                    </h1>
                    <p className="text-sm sm:text-lg lg:text-xl text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-light">
                      Community-powered platform for emergency SOS, family tracing and women empowerment across Cameroon
                    </p>

                    {/* Giant EMERGENCY SOS Button */}
                    <div className="pt-4 flex justify-center">
                      <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="flex items-center space-x-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white px-8 py-5 rounded-full shadow-2xl transition-all duration-200 hover:shadow-red-600/30 font-sans text-left max-w-md w-full border-2 border-red-500/40"
                      >
                        <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center font-black text-2xl text-white select-none shrink-0 bg-red-700/60 animate-pulse animate-bounce">
                          !
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xl sm:text-2xl font-black tracking-wider uppercase text-white leading-none">
                            EMERGENCY SOS
                          </p>
                          <p className="text-xs font-semibold text-red-100 uppercase tracking-wide mt-0.5 opacity-90">
                            Press for immediate help
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions Grid layout */}
                  <div className="max-w-6xl mx-auto pt-8">
                    <h2 className="text-center text-white text-2xl sm:text-3xl font-bold tracking-tight mb-8">
                      Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Card A: Orange Background -> Report Missing */}
                      <button
                        onClick={() => setActiveTab("report")}
                        className="w-full text-left bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl p-6 shadow-lg transition-transform hover:scale-103 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
                      >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-120 transition-transform"></div>
                        <div className="p-3 bg-white/15 rounded-xl w-fit">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <div className="mt-4">
                          <h4 className="text-lg font-bold tracking-tight">Report Missing Person</h4>
                          <p className="text-xs text-orange-50/90 mt-1 line-clamp-2">
                            Submit a missing person report
                          </p>
                        </div>
                      </button>

                      {/* Card B: Blue Background -> Emergency Contacts */}
                      <button
                        onClick={() => setActiveTab("ngo")}
                        className="w-full text-left bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-6 shadow-lg transition-transform hover:scale-103 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
                      >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-120 transition-transform"></div>
                        <div className="p-3 bg-white/15 rounded-xl w-fit">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div className="mt-4">
                          <h4 className="text-lg font-bold tracking-tight">Emergency Contacts</h4>
                          <p className="text-xs text-blue-50/90 mt-1 line-clamp-2">
                            Access emergency numbers
                          </p>
                        </div>
                      </button>

                      {/* Card C: Green Background -> Safe Routes */}
                      <button
                        onClick={() => setActiveTab("women")}
                        className="w-full text-left bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl p-6 shadow-lg transition-transform hover:scale-103 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
                      >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-120 transition-transform"></div>
                        <div className="p-3 bg-white/15 rounded-xl w-fit">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div className="mt-4">
                          <h4 className="text-lg font-bold tracking-tight">Safe Routes</h4>
                          <p className="text-xs text-emerald-50/90 mt-1 line-clamp-2">
                            Find safe paths nearby
                          </p>
                        </div>
                      </button>

                      {/* Card D: Purple Background -> Community Forum */}
                      <button
                        onClick={() => setActiveTab("women")}
                        className="w-full text-left bg-gradient-to-br from-[#a855f7] to-[#8b5cf6] hover:from-[#9333ea] hover:to-[#7c3aed] text-white rounded-2xl p-6 shadow-lg transition-transform hover:scale-103 flex flex-col justify-between min-h-[160px] relative overflow-hidden group"
                      >
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-120 transition-transform"></div>
                        <div className="p-3 bg-white/15 rounded-xl w-fit">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div className="mt-4">
                          <h4 className="text-lg font-bold tracking-tight">Community Forum</h4>
                          <p className="text-xs text-purple-50/90 mt-1 line-clamp-2">
                            Connect with others
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Statistics glassmorphism block */}
                  <div className="max-w-5xl mx-auto pt-10">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-10 rounded-3xl shadow-2xl grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                      <div className="space-y-1">
                        <span className="text-4xl sm:text-5xl font-black text-white block tracking-tight">
                          1,234
                        </span>
                        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                          Active Community Members
                        </span>
                      </div>
                      <div className="space-y-1 border-t sm:border-t-0 sm:border-x border-white/10 pt-6 sm:pt-0">
                        <span className="text-4xl sm:text-5xl font-black text-white block tracking-tight">
                          567
                        </span>
                        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                          Cases Resolved
                        </span>
                      </div>
                      <div className="space-y-1 border-t sm:border-t-0 pt-6 sm:pt-0">
                        <span className="text-4xl sm:text-5xl font-black text-white block tracking-tight">
                          24/7
                        </span>
                        <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                          Emergency Support
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual columns for Safety & Tracing vs Women Empowerment, replicating the beautiful screenshot */}
                  <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 pb-12">
                    {/* Left Column Glass Card: SOS Safety & Tracing */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between text-left space-y-6">
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-600 rounded-2xl w-fit text-white shadow-lg">
                          <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          SOS Safety & Tracing
                        </h3>
                        <ul className="space-y-3 font-medium text-slate-300 text-sm sm:text-base leading-relaxed">
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Missing person alerts
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Real-time SOS notifications
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Community safeguarding network
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Emergency contact directory
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setActiveTab("alerts")}
                        className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/30 text-blue-300 rounded-xl text-xs sm:text-sm font-bold transition-all mt-4"
                      >
                        Learn More about Alerts
                      </button>
                    </div>

                    {/* Right Column Glass Card: Women Empowerment */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col justify-between text-left space-y-6">
                      <div className="space-y-4">
                        <div className="p-3 bg-purple-600 rounded-2xl w-fit text-white shadow-lg">
                          <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                          Women Empowerment
                        </h3>
                        <ul className="space-y-3 font-medium text-slate-300 text-sm sm:text-base leading-relaxed">
                          <li className="flex items-start">
                            <span className="text-purple-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Legal rights guidance
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Volunteer support network
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Safe route mapping
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-400 mr-2 font-bold select-none text-lg leading-none">•</span>
                            Community forums
                          </li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setActiveTab("women")}
                        className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/35 border border-purple-500/30 text-purple-300 rounded-xl text-xs sm:text-sm font-bold transition-all mt-4"
                      >
                        Learn More about Women Space
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ACTIVE ALERTS */}
              {activeTab === "alerts" && (
                <div 
                  className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(20, 25, 55, 0.91) 0%, rgba(13, 14, 38, 0.96) 100%), url('/src/assets/images/woman_child_background_1780636677628.png')`,
                    backgroundAttachment: 'scroll'
                  }}
                  id="alerts-tab-flow"
                >
                  <div className="max-w-7xl mx-auto space-y-6">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white">Active Cameroon Intelligence Alerts</h1>
                      <p className="text-xs text-slate-400 mt-1">Search, trace, and support the community. Flag false reports to protect data integrity.</p>
                    </div>

                  {/* Active list grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {alerts.map(alertObj => {
                      const territory = territories.find(t => t.id === alertObj.territory_id)?.name || "Region";
                      return (
                        <div
                          key={alertObj.id}
                          className="bg-[#0f1f3d] border border-slate-850 rounded-2xl overflow-hidden shadow flex flex-col justify-between"
                        >
                          <div>
                            {alertObj.photo_url && (
                              <div className="aspect-[4/3] w-full bg-slate-900 relative">
                                <img
                                  src={alertObj.photo_url}
                                  alt="Victim snapshot"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />

                                <div className="absolute top-3 left-3 flex gap-1">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    alertObj.status === 'active' 
                                      ? 'bg-red-600 text-white animate-pulse' 
                                      : alertObj.status === 'found_safe' 
                                        ? 'bg-[#10b981] text-white' 
                                        : 'bg-slate-800 text-slate-300'
                                  }`}>
                                    {alertObj.status}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="p-5 space-y-3">
                              <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase block">
                                {alertObj.type.replace("_", " ")}
                              </span>

                              <h3 className="text-lg font-bold text-white leading-snug">
                                {alertObj.type === 'missing_child' ? alertObj.child_name : 'Suspicious sight recorded'}
                              </h3>

                              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                                {alertObj.description}
                              </p>

                              {alertObj.type === 'missing_child' && alertObj.physical_description && (
                                <div className="text-[11px] text-slate-400 bg-slate-950 p-2 rounded">
                                  <span className="font-bold block text-[10px] text-slate-300 mb-0.5">Features:</span>
                                  {alertObj.physical_description}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="px-5 pb-5 pt-0 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                              <span>Territory: <strong className="text-slate-300">{territory}</strong></span>
                              <span>{new Date(alertObj.created_at).toLocaleDateString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => {
                                  setSmsLandingAlertId(alertObj.short_id);
                                  window.history.pushState({}, "", `/alerts/${alertObj.short_id}`);
                                }}
                                className="py-2 px-3 bg-slate-800 hover:bg-slate-755 text-white rounded text-xs font-semibold text-center"
                              >
                                View Live Case
                              </button>

                              <button
                                onClick={() => handleFlagReport(alertObj.id)}
                                className="py-2 px-3 bg-slate-900 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded text-xs font-semibold"
                              >
                                Flag False Report
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>
              )}

              {/* TAB: REPORT CASE */}
              {activeTab === "report" && (
                <div 
                  className="w-full min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, rgba(55, 15, 15, 0.92) 0%, rgba(13, 14, 38, 0.96) 100%), url('/src/assets/images/woman_child_background_1780636677628.png')`,
                    backgroundAttachment: 'scroll'
                  }}
                  id="report-case-portal"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="bg-[#0f1f3d]/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                    <div className="text-center">
                      <ShieldAlert className="h-10 w-10 text-red-500 mx-auto mb-3 animate-ping-slow" />
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white">Report Safety / Tracing Event</h1>
                      <p className="text-slate-400 text-xs mt-1">
                        All reports enter our AI triaged queue before broadcast moderators dispatch SMS and email.
                      </p>
                    </div>

                    {reportSuccess ? (
                      <div className="p-6 bg-slate-900 rounded-2xl border border-[#10b981]/30 text-center space-y-4 animate-scale-up" id="report-submit-success">
                        <CheckCircle className="h-12 w-12 text-[#10b981] mx-auto" />
                        <h3 className="text-xl font-bold text-white">Alert Submitted Successfully</h3>
                        <p className="text-slate-300 text-xs max-w-sm mx-auto">
                          Your case has been added. The AI Scorer is currently parsing details. If approved, neighbors within the location area will receive alerts with the tracking link.
                        </p>
                        
                        <div className="p-3 bg-slate-950 rounded border border-slate-850 max-w-md mx-auto">
                          <span className="text-[10px] text-slate-500 block">Short ID Tracking Link:</span>
                          <span className="font-mono text-[#10b981] font-bold block mt-1">
                            {window.location.origin}/alerts/{submittedShortId}
                          </span>
                        </div>

                        <div className="flex justify-center gap-2 pt-4">
                          <button
                            onClick={() => {
                              setReportSuccess(false);
                              setSubmittedShortId("");
                            }}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs"
                          >
                            Report Another Case
                          </button>
                          
                          <button
                            onClick={() => setActiveTab("alerts")}
                            className="px-4 py-2 bg-[#1a56db] text-white rounded-lg text-xs"
                          >
                            Browse Active Alerts
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleReportSubmit} className="space-y-6" id="safety-report-form">
                        {/* Selector Tabs */}
                        <div className="grid grid-cols-2 gap-2 bg-[#0a1628] p-1.5 rounded-lg border border-slate-750">
                          <button
                            type="button"
                            onClick={() => setReportType('missing_child')}
                            className={`py-2 px-3 rounded font-bold text-xs transition-colors ${
                              reportType === 'missing_child' ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-850"
                            }`}
                          >
                            Missing Person Report
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportType('suspicious_person')}
                            className={`py-2 px-3 rounded font-bold text-xs transition-colors ${
                              reportType === 'suspicious_person' ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-slate-850"
                            }`}
                          >
                            Suspicious Activity
                          </button>
                        </div>

                        {/* PHOTO UPLOAD CONTAINER COMPONENT SPEC - v2.2 */}
                        {reportType === 'missing_child' && (
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300 block">
                              Photograph of the Missing Individual <span className="text-red-500">* Required</span>
                            </label>

                            <div
                              onDragEnter={handleDrag}
                              onDragOver={handleDrag}
                              onDragLeave={handleDrag}
                              onDrop={handleDrop}
                              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                                dragActive 
                                  ? "border-[#1a56db] bg-[#1a56db]/5" 
                                  : uploadedBase64 
                                    ? "border-[#10b981] bg-[#10b981]/5" 
                                    : "border-slate-700 bg-slate-900 hover:border-slate-500"
                              }`}
                            >
                              {uploadedBase64 ? (
                                <div className="space-y-3">
                                  <div className="relative aspect-video max-w-xs mx-auto rounded-xl overflow-hidden border border-[#10b981] shadow-md select-none">
                                    <img
                                      src={uploadedBase64}
                                      alt="Upload snapshot preview"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-slate-950 text-center text-[10px] font-bold">
                                      {childName || "PREVIEW CAPTION"}
                                    </div>
                                  </div>
                                  <div className="flex justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setUploadedBase64(null)}
                                      className="py-1 px-2.5 bg-red-600 hover:bg-red-750 text-[#000] text-[10px] rounded font-bold"
                                    >
                                      Remove Photo
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <Plus className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
                                  <p className="text-xs text-slate-300">
                                    Drag and drop photograph here, or <label className="text-[#1a56db] hover:underline cursor-pointer font-semibold">browse files<input type="file" required accept="image/jpeg,image/png" onChange={handlePhotoSelect} className="hidden" /></label>
                                  </p>
                                  <p className="text-[10px] text-slate-500">Formats support: JPEG, PNG · Max file size: 5MB</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {reportType === 'missing_child' && (
                            <>
                              <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">Full name of the missing individual</label>
                                <input
                                  type="text"
                                  required
                                  value={childName}
                                  onChange={(e) => setChildName(e.target.value)}
                                  placeholder="Full name of missing person"
                                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm focus:border-[#1a56db]"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1">Estimated age (years)</label>
                                <input
                                  type="number"
                                  required
                                  value={childAge}
                                  onChange={(e) => setChildAge(e.target.value)}
                                  placeholder="Estimated age e.g. 25"
                                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm focus:border-[#1a56db]"
                                />
                              </div>

                              <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-300 block mb-1">Physical Description & Clothes worn</label>
                                <input
                                  type="text"
                                  value={physicalDesc}
                                  onChange={(e) => setPhysicalDesc(e.target.value)}
                                  placeholder="e.g., Bright red dress, silver hair ornaments, speaks English & French..."
                                  className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm focus:border-[#1a56db]"
                                />
                              </div>
                            </>
                          )}

                          <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-300 block mb-1">Incident Narrative / Description</label>
                            <textarea
                              required
                              rows={4}
                              value={caseDesc}
                              onChange={(e) => setCaseDesc(e.target.value)}
                              placeholder={
                                reportType === 'missing_child' 
                                  ? "Where was the individual last seen? Mention landmarks, date, estimated hours, and who they were with..." 
                                  : "Describe loitering behaviour, vehicle license numbers, or inappropriate transactions..."
                              }
                              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2.5 text-sm"
                            ></textarea>
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">Last known address / landmark</label>
                            <input
                              type="text"
                              required
                              value={caseLocation}
                              onChange={(e) => setCaseLocation(e.target.value)}
                              placeholder="e.g. Near Marché Central, Yaoundé"
                              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">Coverage Territory</label>
                            <select
                              value={caseTerritory}
                              onChange={(e) => setCaseTerritory(e.target.value)}
                              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm"
                            >
                              <option value="">Select Territory</option>
                              {territories.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-slate-300 block mb-1">Your Mobile Contact Number</label>
                            <input
                              type="tel"
                              value={reporterContact}
                              onChange={(e) => setReporterContact(e.target.value)}
                              placeholder="e.g. +237 677 ..."
                              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3 bg-[#1a56db] hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center transition-transform hover:scale-[1.01]"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish Alert to AI Triage Queue
                        </button>
                      </form>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {/* TAB: NGO DIRECTORY */}
              {activeTab === "ngo" && (
                <NgoSection 
                  ngos={ngos}
                  territories={territories}
                  onAddNgo={handleAddNgo}
                  currentUser={currentUser}
                />
              )}

              {/* TAB: EDUCATION HUB */}
              {activeTab === "education" && (
                <EducationSection 
                  educationList={education}
                  currentUser={currentUser}
                  onAddEducation={handleAddEducation}
                />
              )}

              {/* TAB: WOMEN EMPOWERMENT MODULE */}
              {activeTab === "women" && (
                <WomenSection 
                  currentUser={currentUser}
                />
              )}

              {/* TAB: AI TRIAGE BOARD */}
              {activeTab === "triage" && (
                <TriagePanel 
                  pendingAlerts={alerts.filter(a => a.status === 'pending_review')}
                  territories={territories}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRequestInfo={handleRequestInfo}
                  refreshAlerts={fetchData}
                />
              )}

              {/* TAB: ADMIN PANELS (SMS Logs, user logs) */}
              {activeTab === "admin" && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="admin-board-view">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">Emora Command Dashboard</h1>
                    <p className="text-xs text-slate-400">System Logs, Email broadcasting analytics, and Citizen registrations.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="admin-analytics-row">
                    <div className="p-4 bg-[#0f1f3d] border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-1">Broadcasting logs</span>
                      <span className="text-3xl font-mono text-white font-black">{logs.length} Campaign Triggers</span>
                    </div>
                    <div className="p-4 bg-[#0f1f3d] border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-1">Mailing list audience</span>
                      <span className="text-3xl font-mono text-[#10b981] font-black">520 Active Subscribers</span>
                    </div>
                    <div className="p-4 bg-[#0f1f3d] border border-slate-800 rounded-xl">
                      <span className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-1">SMS API Gateway Status</span>
                      <span className="text-sm font-bold text-slate-200 mt-2 block flex items-center">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                        Active Orange & MTN gateways
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
                    {/* Logs left */}
                    <div className="lg:col-span-8 bg-[#0f1f3d] border border-slate-800 rounded-2xl p-6" id="broadcasting-logs-list">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2 text-[#10b981]" /> SMS and Email Broadcast Logs
                      </h3>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0a1628] text-slate-400 border-b border-slate-800 uppercase text-[10px] font-mono">
                            <tr>
                              <th className="p-3">Logged Date</th>
                              <th className="p-3">Broadcaster Channel</th>
                              <th className="p-3">Recipients Sents</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Target List</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/55 text-slate-200">
                            {logs.map((logObj, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/30">
                                <td className="p-3 font-mono">{new Date(logObj.sent_at).toLocaleTimeString()}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    logObj.type === 'EMAIL' ? 'bg-[#1a56db]/25 text-blue-400' : 'bg-[#eab308]/20 text-[#eab308]'
                                  }`}>
                                    {logObj.type} - {logObj.provider || 'Broadcasting Services'}
                                  </span>
                                </td>
                                <td className="p-3 font-mono font-bold">{logObj.recipients_count}</td>
                                <td className="p-3">
                                  {logObj.status === 'success' ? (
                                    <span className="text-emerald-400 font-semibold inline-flex items-center">
                                      <Check className="w-3 h-3 mr-1" /> success
                                    </span>
                                  ) : (
                                    <span className="text-rose-400 font-semibold inline-flex items-center" title={logObj.error_message}>
                                      <X className="w-3 h-3 mr-1" /> failed
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-400 font-mono text-xs">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="italic">{logObj.sent_to}</span>
                                      {logObj.preview_url && (
                                        <a
                                          href={logObj.preview_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="py-0.5 px-1.5 bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/30 rounded text-[9px] font-extrabold uppercase tracking-wide inline-flex items-center"
                                        >
                                          View Sent Email ↗
                                        </a>
                                      )}
                                    </div>
                                    {logObj.error_message && (
                                      <span className="text-red-400/80 text-[10px] font-sans font-medium bg-red-950/20 border border-red-900/20 px-1.5 py-0.5 rounded max-w-md break-all inline-block">
                                        Error: {logObj.error_message}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Users list right */}
                    <div className="lg:col-span-4 bg-[#0f1f3d] border border-slate-800 rounded-2xl p-6" id="admin-user-roles">
                      <h3 className="text-lg font-bold text-white mb-4">Security User Accounts</h3>
                      <div className="space-y-3">
                        {users.map(u => (
                          <div key={u.id} className="p-3 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-white">{u.full_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono italic">{u.email}</p>
                            </div>

                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                              u.role === 'admin' ? 'bg-red-600 text-[#000]' : u.role === 'moderator' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DASHBOARD (Territorial setting, view reported logs, delete account) */}
              {activeTab === "dashboard" && (
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="profile-dashboard-portal">
                  <div className="bg-[#0f1f3d] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white">Your Emora Citizen Center</h1>
                    <p className="text-xs text-slate-400 mt-1">Configure danger subscriptions and see your submitted help alerts.</p>

                    {currentUser && (
                      <div className="space-y-6">
                        {/* Subscriptions */}
                        <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                          <h3 className="text-base font-bold text-white flex items-center">
                            <MapPin className="h-4.5 w-4.5 text-[#10b981] mr-1.5" /> Subscribed Territories Warning Lists
                          </h3>
                          <p className="text-xs text-slate-300 leading-relaxed mb-4">
                            Select the regions you frequent. You will be automatically included in email broadcasts and SMS warnings when moderators activate nearby alerts.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {territories.map(t => {
                              const isSubbed = currentUser.territories.includes(t.name);
                              return (
                                <button
                                  key={t.id}
                                  onClick={async () => {
                                    const nextList = isSubbed 
                                      ? currentUser.territories.filter(tn => tn !== t.name)
                                      : [...currentUser.territories, t.name];
                                    
                                    const res = await fetch("/api/auth/profile/update", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ territories: nextList })
                                    });
                                    if (res.ok) {
                                      const d = await res.json();
                                      setCurrentUser(d.user);
                                    }
                                  }}
                                  className={`p-2.5 rounded-lg text-left border flex items-center justify-between transition-colors ${
                                    isSubbed 
                                      ? 'bg-[#1a56db]/20 border-[#1a56db] text-white' 
                                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="truncate pr-1.5">{t.name}</span>
                                  {isSubbed && <Check className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Reports List */}
                        <div className="space-y-3">
                          <h3 className="text-base font-bold text-white">Your Submitted Case Reports</h3>
                          <div className="space-y-3">
                            {alerts.filter(a => a.reporter_id === currentUser.id).map(uAlert => (
                              <div key={uAlert.id} className="p-3 bg-slate-900 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                                <div>
                                  <span className="px-2 py-0.5 bg-slate-950 text-slate-400 font-mono text-[9px] rounded uppercase mr-2">Code: {uAlert.short_id}</span>
                                  <span className="font-bold text-white capitalize">{uAlert.type === 'missing_child' ? uAlert.child_name : 'Suspicious report'}</span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{uAlert.status}</span>
                              </div>
                            ))}
                            {alerts.filter(a => a.reporter_id === currentUser.id).length === 0 && (
                              <p className="text-xs text-slate-500 italic p-4 text-center border rounded bg-slate-900 border-dashed border-slate-800">You haven't logged any report alerts yet.</p>
                            )}
                          </div>
                        </div>

                        {/* Dangerous Action */}
                        <div className="pt-6 border-t border-slate-800">
                          <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-2">Danger Area</h4>
                          
                          <button
                            onClick={async () => {
                              if (confirm("WARNING: Are you sure you want to permanently delete your Emora account? This is irreversible and will erase alert histories and notification subscription records.")) {
                                const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
                                if (res.ok) {
                                  setCurrentUser(null);
                                  setActiveTab("home");
                                  alert("Account deleted.");
                                }
                              }
                            }}
                            className="py-2.5 px-4 bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/50 rounded-xl font-bold text-xs inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Delete Account Permanently
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB: LOGIN / REGISTER */}
              {activeTab === "login" && (
                <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12" id="auth-portal-page">
                  <div className="bg-[#0f1f3d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="text-center">
                      <ShieldAlert className="h-10 w-10 text-[#1a56db] mx-auto mb-2" />
                      <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                        {isRegisterMode ? "Create Emora Identity" : "Sign In to Dispatch Platform"}
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">Protect, trace, and support the Cameroon community safely.</p>
                    </div>

                    <form onSubmit={handleLoginRegister} className="space-y-4">
                      {isRegisterMode && (
                        <>
                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">Your Full Name</label>
                            <input
                              type="text"
                              required
                              value={authFullName}
                              onChange={(e) => setAuthFullName(e.target.value)}
                              placeholder="e.g. Christelle Kamdem"
                              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm focus:border-[#1a56db]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Sighting Phone Number (starts with 6)</label>
                            <input
                              type="tel"
                              required
                              value={authPhone}
                              onChange={(e) => setAuthPhone(e.target.value)}
                              placeholder="e.g. 677..."
                              className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Account Email Address</label>
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="christellekamdem880@gmail.com"
                          className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm focus:border-[#1a56db]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1">Account Password</label>
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-sm focus:border-[#1a56db]"
                        />
                      </div>

                      {authError && (
                        <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 p-2.5 rounded-lg font-medium">{authError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-lg text-sm shadow-md"
                      >
                        {isRegisterMode ? "Register Subscriber" : "Authorize Login"}
                      </button>
                    </form>

                    <div className="text-center pt-4 border-t border-slate-800 text-xs">
                      <button
                        onClick={() => {
                          setIsRegisterMode(!isRegisterMode);
                          setAuthError("");
                        }}
                        className="text-[#10b981] hover:underline font-semibold"
                      >
                        {isRegisterMode ? "Already a subscriber? Sign in" : "No tracing account yet? Register here"}
                      </button>
                    </div>


                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0a1628] border-t border-slate-900 py-10" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center">
            <ShieldAlert className="h-4.5 w-4.5 text-purple-400 mr-2 animate-pulse" />
            <span className="text-slate-400 font-medium tracking-wide">
              &copy; {new Date().getFullYear()} <strong className="text-white font-extrabold hover:text-emerald-400 transition-colors duration-200">Emora Cameroon</strong> Community Safety, SOS Tracing & Women Empowerment Platform. All rights reserved.
            </span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => alert("Please consult our Cameroon Emergency SOS Support hotline directly if under threat.")} className="hover:text-slate-300">Privacy & Terms Policy</button>
            <span>·</span>
            <a href="tel:+237677889012" className="hover:text-slate-300 inline-flex items-center">
              <Phone className="w-3 h-3 mr-1" /> Help: +237 677 889 012
            </a>
          </div>
        </div>
      </footer>

      {/* SOS EMERGENCY LIVE PANIC BUTTON MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f3d] border-2 border-red-600 rounded-3xl overflow-hidden shadow-2xl max-w-md w-full p-6 animate-scale-up text-center relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            {emergencySuccess ? (
              <div className="space-y-4 p-4 animate-scale-up">
                <CheckCircle className="h-14 w-14 text-[#10b981] mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-white">Emergency Dispatch Activated</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto uppercase tracking-wide">
                  Orange & MTN SMS Dispatch simulation successfully sent to 580 nearby subscribed phone numbers. Citizens have been warned.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEmergencySubmit} className="space-y-5">
                <div className="mx-auto w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-600 border border-red-500/30 animate-pulse">
                  <Flame className="w-8 h-8 animate-bounce fill-red-600" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wide">SOS PUBLIC PANIC DISPATCH</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    This triggers immediate simulated MTN & Orange SMS blasts to all security subscribers in the immediate region. Human dispatchers will call you back.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Distress Sighting Type</label>
                    <select
                      value={emergencyType}
                      onChange={(e) => setEmergencyType(e.target.value)}
                      className="w-full bg-[#0a1628] border border-red-500/50 text-white rounded-lg p-2 text-sm tracking-wide focus:border-red-600 focus:ring-1 focus:ring-red-650"
                    >
                      <option value="Armed Attack / Robbery">Armed Attack / Robbery</option>
                      <option value="Home Break-in">Home Break-in</option>
                      <option value="High-Risk Abduction">High-Risk Abduction / Sighting</option>
                      <option value="Severe Fire Outbreak">Severe Fire Outbreak</option>
                      <option value="Assault Attempt">Assault Attempt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Optional Note (max 100 character details)</label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="e.g. Armed individual wearing grey jacket near shop"
                      value={emergencyNote}
                      onChange={(e) => setEmergencyNote(e.target.value)}
                      className="w-full bg-[#0a1628] border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold tracking-wider uppercase text-xs shadow shadow-red-600/30 flex items-center justify-center"
                >
                  <Phone className="w-3.5 h-3.5 mr-2 animate-bounce fill-white" />
                  CONFIRM EMERGENCY BLAST
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Inline helper for territory formatting on landing
function associated_territory_or_region(territoryName: string): string {
  if (territoryName.includes("(")) {
    return territoryName.split("(")[0].trim() + " region";
  }
  return territoryName;
}
