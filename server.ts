import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

// Initialize DB state
import {
  db_profiles,
  db_alerts,
  db_emergency_alerts,
  db_logs,
  db_ngos,
  db_education,
  db_peer_groups,
  db_mentors,
  db_mentor_matches,
  db_success_stories,
  db_anonymous_reports,
  TERRITORIES,
  generateShortId
} from "./server_db";
import { Alert, SmsLog, EmergencyAlert } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));
app.use("/src/assets/images", express.static(path.join(process.cwd(), "src/assets/images")));

// Helper to find alert by id or short_id
function findAlert(idOrShortId: string): Alert | undefined {
  return db_alerts.find(a => a.id === idOrShortId || a.short_id === idOrShortId);
}

// -------------------------------------------------------------
// SECURE LAZY GEMINI CLIENT UTILITY
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Active user session simulation helper (In a production app, use JWT)
let currentUserSession: any = null;

// Config and seed lists
app.get("/api/config", (req, res) => {
  res.json({
    territories: TERRITORIES,
    ngos: db_ngos,
    education: db_education
  });
});

// Authentication Simulator
app.post("/api/auth/register", (req, res) => {
  const { full_name, phone_number, email, password, territories } = req.body;
  if (!full_name || !phone_number || !email || !password) {
    return res.status(400).json({ error: "Missing required registration parameters" });
  }

  const existing = db_profiles.find(p => p.phone_number === phone_number || p.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists with that email or phone number" });
  }

  const newUser = {
    id: 'usr_' + Date.now().toString(),
    full_name,
    phone_number,
    email,
    territories: territories || ["Centre (Yaoundé)"],
    role: "user" as const,
    is_active: true,
    created_at: new Date().toISOString()
  };

  db_profiles.push(newUser);
  currentUserSession = newUser;

  res.json({ success: true, user: newUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = normalizedEmail === "christellekamdem880@gmail" || normalizedEmail === "christellekamdem880@gmail.com";

  if (isAdminEmail) {
    if (password !== "christe880") {
      return res.status(401).json({ error: "Invalid password for administrator account. Correct password is required." });
    }
    const adminUser = db_profiles.find(p => p.email === "christellekamdem880@gmail.com");
    if (adminUser) {
      currentUserSession = adminUser;
      return res.json({ success: true, user: adminUser });
    }
  }

  // Admin and test accounts login simulation
  const foundUser = db_profiles.find(p => p.email.toLowerCase().trim() === normalizedEmail);
  if (foundUser) {
    currentUserSession = foundUser;
    return res.json({ success: true, user: foundUser });
  }

  return res.status(401).json({ error: "Invalid credentials. Try using preloaded accounts (christellekamdem880@gmail.com with password 'christe880' or mukete@safealert.cm)" });
});

app.get("/api/auth/me", (req, res) => {
  if (currentUserSession) {
    res.json({ user: currentUserSession });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  currentUserSession = null;
  res.json({ success: true });
});

app.post("/api/auth/profile/update", (req, res) => {
  if (!currentUserSession) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { territories, full_name, phone_number } = req.body;
  const user = db_profiles.find(p => p.id === currentUserSession.id);
  if (user) {
    if (territories) user.territories = territories;
    if (full_name) user.full_name = full_name;
    if (phone_number) user.phone_number = phone_number;
    currentUserSession = user;
    res.json({ success: true, user });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.delete("/api/auth/delete-account", (req, res) => {
  if (!currentUserSession) {
    return res.status(401).json({ error: "Not authorized" });
  }
  const idToRemove = currentUserSession.id;
  const idx = db_profiles.findIndex(p => p.id === idToRemove);
  if (idx > -1) {
    db_profiles.splice(idx, 1);
  }
  // Remove associated reports or mark anonymised
  currentUserSession = null;
  res.json({ success: true, message: "Account deleted successfully" });
});

// Alerts endpoints (List, get, submit)
app.get("/api/alerts", (req, res) => {
  const { type, status, territory_id } = req.query;
  let filtered = [...db_alerts];

  if (type) {
    filtered = filtered.filter(a => a.type === type);
  }
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }
  if (territory_id) {
    filtered = filtered.filter(a => a.territory_id === territory_id);
  }

  // Sort: Active or High priority always first
  filtered.sort((a, b) => {
    if (a.triage_badge === 'HIGH_PRIORITY' && b.triage_badge !== 'HIGH_PRIORITY') return -1;
    if (b.triage_badge === 'HIGH_PRIORITY' && a.triage_badge !== 'HIGH_PRIORITY') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  res.json({ alerts: filtered });
});

app.get("/api/alerts/:id", (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  res.json({ alert });
});

app.post("/api/alerts/submit", (req, res) => {
  if (!currentUserSession) {
    return res.status(412).json({ error: "Authentication required to report alerts." });
  }

  const {
    type,
    child_name,
    child_age,
    physical_description,
    description,
    last_known_location,
    territory_id,
    photo_url,  // base64 photo data
    reporter_contact,
  } = req.body;

  if (!description || !last_known_location || !territory_id) {
    return res.status(400).json({ error: "Missing required fields (description, location, territory)" });
  }

  if (type === 'missing_child' && !photo_url) {
    return res.status(400).json({ error: "A photo of the child is required to publish a missing report." });
  }

  const newAlert: Alert = {
    id: 'alert_' + Date.now().toString(),
    short_id: generateShortId(),
    type: type || 'missing_child',
    child_name,
    child_age: child_age ? parseInt(child_age) : undefined,
    physical_description,
    description,
    last_known_location,
    territory_id,
    photo_url: photo_url || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&auto=format&fit=crop&q=80',
    reporter_id: currentUserSession.id,
    reporter_name: currentUserSession.full_name,
    reporter_contact: reporter_contact || currentUserSession.phone_number,
    status: 'pending_review',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db_alerts.push(newAlert);
  res.json({ success: true, alert: newAlert });
});

// Flag False Report
app.post("/api/alerts/:id/flag", (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  const { reason } = req.body;
  alert.flags_count = (alert.flags_count || 0) + 1;
  alert.updated_at = new Date().toISOString();

  // If flags exceed 5 thresholds, change status to under_review automatically
  if (alert.flags_count >= 5 && alert.status === 'active') {
    alert.status = 'under_review';
  }

  res.json({ success: true, flags_count: alert.flags_count, status: alert.status });
});

// Rapid Emergency Panic Button API (no admin approval required)
app.post("/api/emergency/submit", (req, res) => {
  const { emergency_type, description, territory_id } = req.body;
  if (!emergency_type || !territory_id) {
    return res.status(400).json({ error: "Emergency type and territory are required" });
  }

  const sender = currentUserSession || { id: "annonymous", full_name: "Anonymous Citizen", phone_number: "+237 600 000 000" };

  const newEmergKey = 'em_' + Date.now().toString();
  const shortId = generateShortId(6);

  const emergency: EmergencyAlert = {
    id: newEmergKey,
    short_id: shortId,
    emergency_type,
    description: description || "No detailed note specified",
    territory_id,
    sender_id: sender.id,
    sender_name: sender.full_name,
    sender_phone: sender.phone_number,
    status: "dispatched",
    created_at: new Date().toISOString()
  };

  db_emergency_alerts.push(emergency);

  // Trigger Immediate SMS simulation via MTN SMS API
  const alertText = `EMERGENCY ALERT: [${emergency_type}] reported in your territory. Stay inside or seek safety. Details: Please keep vigilant.`;
  
  const log: SmsLog = {
    id: 'log_' + Date.now().toString(),
    emergency_alert_id: newEmergKey,
    type: 'SMS',
    provider: 'MTN SMS API',
    recipients_count: 580, // Simulation of subscribers in that territory list
    status: 'success',
    sent_to: `Subscribers of territory ${territory_id}`,
    sent_at: new Date().toISOString()
  };

  db_logs.push(log);
  console.log(`[MTN SMS BROADCAST SENT] Recipient Count: 580. Text: ${alertText}`);

  res.json({ success: true, emergency, sent_log: log });
});

// -------------------------------------------------------------
// REVOLUTIONARY SERVER-SIDE GEMINI SCORES & TRIAGE
// -------------------------------------------------------------
app.post("/api/alerts/:id/score", async (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  // If alert has already been scored, return the cached result instantly
  if (alert.ai_scored_at) {
    return res.json({
      urgency_score: alert.urgency_score,
      credibility_score: alert.credibility_score,
      triage_badge: alert.triage_badge,
      ai_flags: alert.ai_flags,
      ai_summary: alert.ai_summary,
      suggested_action: alert.suggested_action,
      ai_scored_at: alert.ai_scored_at
    });
  }

  const ai = getAiClient();

  if (!ai) {
    // Elegant rules-based fallback engine to preserve zero downtime
    console.log("[SAFEALERT AI] No GEMINI_API_KEY detected. Executing local rules-based triage...");
    
    let uScore = 4.0;
    let cScore = 4.0;
    const flags: string[] = [];

    // Evaluate Urgency
    if (alert.type === 'missing_child') {
      uScore += 3.5; // Young children are high priority
      if (alert.child_age && alert.child_age < 8) {
        uScore += 1.5;
      }
    }
    if (alert.description.toLowerCase().includes('kidnap') || alert.description.toLowerCase().includes('danger') || alert.description.toLowerCase().includes('missing')) {
      uScore += 1.0;
    }

    // Evaluate Credibility and Flags
    if (alert.last_known_location.length < 8) {
      flags.push("vague_location");
      cScore -= 2.0;
    }
    if (!alert.reporter_contact || alert.reporter_contact.trim() === "") {
      flags.push("no_contact");
      cScore -= 2.0;
    }
    if (!alert.physical_description || alert.physical_description.length < 15) {
      flags.push("no_physical_description");
      cScore -= 1.5;
    }
    const hasDigits = /\d+/.test(alert.description);
    if (!hasDigits) {
      flags.push("no_time_reference");
      cScore -= 1.0;
    }

    // Adjust scores safely
    uScore = Math.max(1, Math.min(10, uScore));
    cScore = Math.max(1, Math.min(10, cScore + (alert.physical_description ? 3.0 : 1.0)));

    const badge = (uScore >= 7 && cScore >= 7) ? 'HIGH_PRIORITY' : (uScore >= 5 || cScore >= 5) ? 'NEEDS_REVIEW' : 'LOW_PRIORITY';
    const action = badge === 'HIGH_PRIORITY' ? 'approve' : cScore < 4 ? 'reject' : 'request_info';
    
    let summary = "";
    if (alert.type === 'missing_child') {
      summary = `${alert.child_name || 'A child'} (${alert.child_age || 'unknown'} yrs) reported missing at ${alert.last_known_location}.`;
    } else {
      summary = `Suspicious person loitering reported near ${alert.last_known_location}.`;
    }

    alert.urgency_score = parseFloat(uScore.toFixed(1));
    alert.credibility_score = parseFloat(cScore.toFixed(1));
    alert.triage_badge = badge;
    alert.ai_flags = flags;
    alert.ai_summary = `${summary} Local rules-based safety analysis completed.`;
    alert.suggested_action = action;
    alert.ai_scored_at = new Date().toISOString();

    return res.json({
      urgency_score: alert.urgency_score,
      credibility_score: alert.credibility_score,
      triage_badge: alert.triage_badge,
      ai_flags: alert.ai_flags,
      ai_summary: alert.ai_summary,
      suggested_action: alert.suggested_action,
      ai_scored_at: alert.ai_scored_at
    });
  }

  // Real Gemini Call!
  try {
    const systemInstruction = `You are a professional child protection risk triage specialist for Emora Cameroon. 
    Analyze the alert fields with utmost professional care.
    Calculate:
    1. "urgency_score": A decimal from 0.0 to 10.0 sizing the threat level. High score (7+) applies to younger children, kidnappings, armed threats, or quick lead times.
    2. "credibility_score": A decimal from 0.0 to 10.0 sizing detail accuracy. Premium scores (7+) requires solid features description, proper contact numbers, and traceable landmarks.
    3. "triage_badge": Return string: "HIGH_PRIORITY" if urgency_score >= 7.0 & credibility_score >= 7.0; "NEEDS_REVIEW" if urgency_score >= 5.0 || credibility_score >= 5.0; "LOW_PRIORITY" otherwise.
    4. "ai_flags": Return string labels from this list if applicable: 
       - "vague_location" (location description short or non-existent)
       - "no_contact" (no clear valid mobile contact supplied)
       - "no_physical_description" (no clear hair, clothing, size details found)
       - "no_time_reference" (no mention of month, day, hour when seen)
       - "suspected_spam" (gibberish text, test strings or extreme brevity)
    5. "ai_summary": Provide a clear 1 to 2 sentence summary in simple plain text summarizing key risk facts. Keep it respectful.
    6. "suggested_action": Return "approve" (high quality/true reports), "reject" (spam, inappropriate text), or "request_info" (incomplete address or no contacts).
    
    You MUST return output formatting strictly conforming to a single JSON with the specified property types.`;

    const contents = `Analyze this security alert:
    Type: ${alert.type}
    Child Name: ${alert.child_name || 'N/A'}
    Child Age: ${alert.child_age || 'N/A'}
    Location: ${alert.last_known_location}
    Description: ${alert.description}
    Reporter Contacts: ${alert.reporter_contact}
    Reporter Name: ${alert.reporter_name}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgency_score: { type: Type.NUMBER },
            credibility_score: { type: Type.NUMBER },
            triage_badge: { type: Type.STRING },
            ai_flags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            ai_summary: { type: Type.STRING },
            suggested_action: { type: Type.STRING }
          },
          required: ["urgency_score", "credibility_score", "triage_badge", "ai_flags", "ai_summary", "suggested_action"]
        }
      }
    });

    const bodyText = response.text || "{}";
    const data = JSON.parse(bodyText.trim());

    alert.urgency_score = typeof data.urgency_score === 'number' ? parseFloat(data.urgency_score.toFixed(1)) : 5.0;
    alert.credibility_score = typeof data.credibility_score === 'number' ? parseFloat(data.credibility_score.toFixed(1)) : 5.0;
    alert.triage_badge = data.triage_badge || 'NEEDS_REVIEW';
    alert.ai_flags = Array.isArray(data.ai_flags) ? data.ai_flags : [];
    alert.ai_summary = data.ai_summary || "Alert triaged by Gemini AI Shield.";
    alert.suggested_action = data.suggested_action || 'request_info';
    alert.ai_scored_at = new Date().toISOString();

    res.json(data);
  } catch (err: any) {
    console.error("Gemini triage generation failed:", err);
    res.status(500).json({ error: "Failed to parse AI scoring details", details: err.message });
  }
});

// -------------------------------------------------------------
// SECURE NODEMAILER DIRECT BROADCASTING (Up to 3 Address Nodes)
// -------------------------------------------------------------
async function sendBroadcastingEmails(recipientEmails: string[], alert: any, territoryName: string, requestOrigin?: string) {
  const emailsToSend = recipientEmails && recipientEmails.length > 0
    ? recipientEmails.slice(0, 3) 
    : ["christellekamdem880@gmail.com", "mukete@safealert.cm", "admin@safealert.cm"];

  const appUrl = requestOrigin || process.env.APP_URL || "https://safealert.cm";
  
  const isMissingChild = alert.type === "missing_child";
  const trackingLink = `${appUrl}/alerts/${alert.short_id}`;
  
  // Convert relative photo_url to absolute url so it renders correctly in mail clients
  let absolutePhotoUrl = alert.photo_url || "";
  if (absolutePhotoUrl && absolutePhotoUrl.startsWith("/")) {
    absolutePhotoUrl = `${appUrl.replace(/\/$/, "")}${absolutePhotoUrl}`;
  }
  
  const emailHtml = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #1e3a8a; border-radius: 16px; background-color: #0f1f3d; color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px; margin-bottom: 20px;">
        <h1 style="color: #ef4444; margin: 0; font-size: 20px; text-transform: uppercase;">⚠️ Emora Cameroon Urgent Search Broadcast ⚠️</h1>
        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 13px;">Immediate Territory Protection Initiative · Territory Active: <strong>${territoryName}</strong></p>
      </div>
      
      <div style="background-color: #0a1628; padding: 18px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #1e40af;">
        <h3 style="color: #10b981; margin-top: 0; font-size: 16px; border-bottom: 1px solid #1e3a8a; padding-bottom: 8px;">
          ${isMissingChild ? `Tracing Alert: ${alert.child_name || 'Missing Individual'}` : 'Preemptive Alert: Suspicious Sighting Area'}
        </h3>
        
        ${isMissingChild && alert.child_age ? `<p style="margin: 8px 0; font-size: 13.5px; color: #cbd5e1;"><strong>Estimated Age:</strong> ${alert.child_age} years old</p>` : ''}
        <p style="margin: 8px 0; font-size: 13.5px; color: #cbd5e1;"><strong>Last Sighting Area:</strong> ${alert.last_known_location}</p>
        
        ${isMissingChild && alert.physical_description ? `
          <div style="background-color: #0c1a30; padding: 12px; border-radius: 8px; margin: 12px 0; border: 1px dashed #ef4444;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5; font-weight: bold;">Identifiable Marks / Clothing:</p>
            <p style="margin: 4px 0 0 0; font-size: 12.5px; color: #cbd5e1; line-height: 1.4;">${alert.physical_description}</p>
          </div>
        ` : ''}
        
        <p style="font-size: 13.5px; color: #cbd5e1; line-height: 1.5; margin: 12px 0;">
          <strong>Incident Narrative Details:</strong><br/>
          ${alert.description}
        </p>
      </div>

      ${absolutePhotoUrl ? `
        <div style="text-align: center; margin-bottom: 20px;">
          <picture style="display:inline-block; max-width: 100%;">
            <img src="${absolutePhotoUrl}" alt="Tracing Victim" style="max-width: 100%; max-height: 320px; border-radius: 12px; border: 2px solid #ef4444; object-fit: cover;" />
          </picture>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-bottom: 25px;">
        <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 12px;">To view more pictures, report sightings, or provide live coordinates, open the child's secure official public notice file on our platform:</p>
        <a href="${trackingLink}" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: #ffffff; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14.5px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
          Open Official Search Dispatch Landing Card
        </a>
        <p style="font-size: 11px; color: #64748b; margin-top: 10px; word-break: break-all;">
          Direct Link: <a href="${trackingLink}" style="color: #38bdf8; text-decoration: underline;">${trackingLink}</a>
        </p>
      </div>
      
      <div style="border-top: 1px solid #1e3a8a; padding-top: 15px; font-size: 11px; color: #64748b; font-family: monospace;">
        <p style="margin: 0;">Community Hotline: <strong>${alert.reporter_contact}</strong></p>
        <p style="margin: 4px 0 0 0;">Report Code: <strong>${alert.short_id}</strong> &copy; Emora Cameroon Child Protection Software Suite</p>
      </div>
    </div>
  `;

  const subject = `🚨 [URGENT DISPATCH] Cameroon Child Safety Alert - ${isMissingChild ? (alert.child_name || "Missing Sighting") : "Suspicious loitering"} in ${territoryName}`;

  // SMTP Configuration
  const smtpHost = (process.env.SMTP_HOST || "smtp-relay.brevo.com").replace(/^["']|["']$/g, "").trim();
  const smtpPortStr = (process.env.SMTP_PORT || "587").replace(/^["']|["']$/g, "").trim();
  const smtpPort = parseInt(smtpPortStr, 10) || 587;
  const smtpUser = (process.env.SMTP_USER || "acdfc5001@smtp-brevo.com").replace(/^["']|["']$/g, "").trim();
  const smtpPass = (process.env.SMTP_PASS || "Zjt09mDTE76IXfcy").replace(/^["']|["']$/g, "").trim();
  const smtpFrom = (process.env.SMTP_FROM || process.env.BREVO_FROM || "christellekamdem880@gmail.com").replace(/^["']|["']$/g, "").trim();

  const isSmtpConfigured = smtpHost && smtpUser && smtpPass;

  if (isSmtpConfigured) {
    try {
      console.log(`[Emora SMTP Client] Connecting to SMTP Relay ${smtpHost}:${smtpPort}...`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      console.log(`[Emora SMTP Client] Preparing SMTP dispatch to: ${emailsToSend.join(", ")}...`);
      const info = await transporter.sendMail({
        from: `"Emora Cameroon" <${smtpFrom}>`,
        to: emailsToSend.join(", "),
        replyTo: smtpFrom,
        subject: subject,
        html: emailHtml
      });

      console.log("[Emora SMTP Client] Broadcast delivered successfully via SMTP! MsgID:", info.messageId);
      return {
        success: true,
        recipients: emailsToSend,
        provider: "Brevo SMTP Relayer",
        id: info.messageId
      };
    } catch (smtpErr: any) {
      console.error("[Emora SMTP Client] SMTP broadcast transmission failed. Trying REST API fallback...", smtpErr);
    }
  }

  // Fallback: Brevo REST API Configuration
  const apiKey = (process.env.BREVO_API_KEY || smtpPass || "").replace(/^["']|["']$/g, "").trim();
  const fromEmail = smtpFrom;

  if (!apiKey) {
    console.warn("[Emora Emailer] Neither SMTP nor BREVO_API_KEY is available. Cannot deliver.");
    return {
      success: false,
      recipients: emailsToSend,
      error: "Both SMTP transmission and Brevo API Key fallback are unavailable. Check configuration.",
      provider: "Emora Broadcast Router"
    };
  }

  try {
    console.log(`[Emora Emailer REST] SMTP failed or skipped. Sending via HTTP API to: ${emailsToSend.join(", ")}...`);
    
    const payload = {
      sender: {
        name: "Emora Cameroon",
        email: fromEmail
      },
      to: emailsToSend.map(e => ({ email: e })),
      replyTo: {
        email: fromEmail,
        name: "Emora Support"
      },
      subject: subject,
      htmlContent: emailHtml
    };

    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const resJson: any = await resp.json().catch(() => ({}));
    
    if (!resp.ok) {
      console.error("[Emora Emailer REST] Brevo API answered with error status:", resp.status, resJson);
      const errMsg = resJson.message || resJson.code || JSON.stringify(resJson) || `HTTP error ${resp.status}`;
      return {
        success: false,
        recipients: emailsToSend,
        error: errMsg,
        provider: "Brevo Email Gateway"
      };
    }

    const emailId = resJson.messageId || "unknown";
    console.log("[Emora Emailer REST] Brevo API delivery completed. ID:", emailId);
    return {
      success: true,
      recipients: emailsToSend,
      provider: "Brevo Email Gateway",
      id: emailId
    };
  } catch (err: any) {
    console.error("[Emora Emailer REST] REST API fallback also failed:", err);
    return {
      success: false,
      recipients: emailsToSend,
      error: `All delivery routes failing. SMTP and REST errors: ${err.message || String(err)}`,
      provider: "Emora Dual Gateway"
    };
  }
}

// Admin Review Decision Endpoints (Includes SMS Broadcast & Email Broadcasting)
app.post("/api/alerts/:id/approve", async (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  const { emails } = req.body; // array of up to 3 emails passed from moderator UI

  alert.status = "active";
  alert.updated_at = new Date().toISOString();

  // Retrieve current subscribed territory info
  const terr = TERRITORIES.find(t => t.id === alert.territory_id) || { name: "Adjoining Region" };

  // Resolve host & protocol dynamically from the request headers to support Cloud Run/Vite context perfectly
  const reqHost = req.get('host');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const requestOrigin = `${proto}://${reqHost}`;

  // 1. TRIGGER SM BROADCAST Simulation (Orange SMS API)
  let smsText = "";
  if (alert.type === "missing_child") {
    smsText = `SAFEALERT: ${alert.child_name}, ${alert.child_age} yrs missing from ${alert.last_known_location}. See photo/report details: ${requestOrigin}/alerts/${alert.short_id}`;
  } else {
    smsText = `SAFEALERT: Suspicious person reported near ${alert.last_known_location}. Stay alert. Details: ${requestOrigin}/alerts/${alert.short_id}`;
  }

  const smsLog: SmsLog = {
    id: 'sms_' + Date.now().toString(),
    alert_id: alert.id,
    type: 'SMS',
    provider: 'Orange SMS Cameroon API',
    recipients_count: 350,
    status: 'success',
    sent_to: `Subscribers of ${terr.name}`,
    sent_at: new Date().toISOString()
  };

  db_logs.unshift(smsLog); // prepend to list

  // 2. TRIGGER REAL EMAIL BROADCASTING (to 3 specific people)
  const recipientList = emails && emails.length > 0 ? emails : ["christellekamdem880@gmail.com", "mukete@safealert.cm", "admin@safealert.cm"];
  const emailResult = await sendBroadcastingEmails(recipientList, alert, terr.name, requestOrigin);

  const emailLog: SmsLog = {
    id: 'email_' + Date.now().toString(),
    alert_id: alert.id,
    type: 'EMAIL',
    provider: emailResult.provider || 'Broadcasting SMTP Gateway',
    recipients_count: recipientList.length,
    status: emailResult.success ? 'success' : 'failed',
    error_message: emailResult.error || undefined,
    sent_to: recipientList.join(", "),
    sent_at: new Date().toISOString()
  };

  db_logs.unshift(emailLog); // prepend to list

  console.log(`[ORANGE SMS DISPATCHED] Recipients: 350. Message: ${smsText}`);
  console.log(`[EMAIL DISPATCH COMPLETED] Recipients: ${recipientList.length}. Target: ${recipientList.join(", ")}`);

  res.json({ success: true, alert, smsLog, emailLog, emailResult });
});

app.post("/api/alerts/:id/reject", (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  const { reason } = req.body;
  alert.status = "false_report";
  alert.rejection_reason = reason || "Inappropriate text or insufficient details.";
  alert.updated_at = new Date().toISOString();
  res.json({ success: true, alert });
});

app.post("/api/alerts/:id/request_info", (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  alert.status = "pending_review";
  alert.updated_at = new Date().toISOString();
  res.json({ success: true, alert, note: "Moderator requested further details from submitter." });
});

app.post("/api/alerts/:id/close", (req, res) => {
  const alert = findAlert(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }
  const { outcome } = req.body; // 'found_safe' etc.
  alert.status = outcome === 'found_safe' ? 'found_safe' : 'case_closed';
  alert.updated_at = new Date().toISOString();
  res.json({ success: true, alert });
});

app.get("/api/admin/sms-email-logs", (req, res) => {
  res.json({ logs: db_logs });
});

app.get("/api/admin/users", (req, res) => {
  res.json({ users: db_profiles });
});

app.post("/api/admin/users/:id/role", (req, res) => {
  const { role } = req.body;
  const user = db_profiles.find(p => p.id === req.params.id);
  if (user && (role === 'user' || role === 'admin' || role === 'moderator')) {
    user.role = role;
    return res.json({ success: true, user });
  }
  res.status(404).json({ error: "User not found or role invalid" });
});

// Admin Add Extra Video or NGO
app.post("/api/admin/education", (req, res) => {
  const { title, age_group, body_text, video_url, duration, icon_name } = req.body;
  if (!title || !age_group || !body_text) {
    return res.status(400).json({ error: "Missing title, age group, or text" });
  }
  const newItem = {
    id: 'e_' + Date.now().toString(),
    age_group,
    title,
    body_text,
    icon_name: icon_name || "Video",
    video_url,
    video_thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
    video_duration: duration || '5:00',
    is_active: true,
    order_index: db_education.length + 1
  };
  db_education.push(newItem);
  res.json({ success: true, item: newItem });
});

app.post("/api/admin/ngos", (req, res) => {
  const { name, description, specialisations, territories, phone_primary, email, website_url, physical_address } = req.body;
  if (!name || !description || !phone_primary || !email) {
    return res.status(400).json({ error: "Missing required fields for NGO" });
  }
  const newNGO = {
    id: 'ngo_' + Date.now().toString(),
    name,
    description,
    specialisations: Array.isArray(specialisations) ? specialisations : [specialisations],
    territories: Array.isArray(territories) ? territories : [territories],
    phone_primary,
    email,
    website_url,
    physical_address,
    is_verified: true,
    is_active: true
  };
  db_ngos.push(newNGO);
  res.json({ success: true, ngo: newNGO });
});


// -------------------------------------------------------------
// WOMEN EMPOWERMENT INTERACTION ENDPOINTS
// -------------------------------------------------------------

app.get("/api/women/data", (req, res) => {
  res.json({
    peerGroups: db_peer_groups,
    mentors: db_mentors,
    mentorMatches: db_mentor_matches,
    successStories: db_success_stories,
    anonymousReports: db_anonymous_reports
  });
});

app.post("/api/women/mentor/match", (req, res) => {
  const { menteeName, mentorId, expertise, message } = req.body;
  if (!menteeName || !mentorId || !expertise) {
    return res.status(400).json({ error: "Missing required fields for mentorship matching." });
  }
  const newMatch = {
    id: "match_" + Date.now().toString(),
    menteeName,
    mentorId,
    expertise,
    message: message || "",
    status: "pending",
    createdAt: new Date().toISOString()
  };
  db_mentor_matches.push(newMatch);
  res.json({ success: true, match: newMatch });
});

app.post("/api/women/mentor/enroll", (req, res) => {
  const { name, expertise, bio, location, image } = req.body;
  if (!name || !expertise || !bio || !location) {
    return res.status(400).json({ error: "Missing required fields to enroll as mentor." });
  }
  const newMentor = {
    id: "m_" + Date.now().toString(),
    name,
    expertise,
    bio,
    location,
    rating: 5.0,
    image: image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"
  };
  db_mentors.push(newMentor);
  res.json({ success: true, mentor: newMentor });
});

app.post("/api/women/story/submit", (req, res) => {
  const { author, title, story, location, category, image } = req.body;
  if (!author || !title || !story || !location || !category) {
    return res.status(400).json({ error: "Missing fields in success story submission." });
  }
  const newStory = {
    id: "s_" + Date.now().toString(),
    author,
    title,
    story,
    location,
    category,
    image: image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    date: new Date().toISOString().split('T')[0]
  };
  db_success_stories.unshift(newStory);
  res.json({ success: true, story: newStory });
});

app.post("/api/women/report/submit", (req, res) => {
  const { category, details, location, planCompleted } = req.body;
  if (!category || !details || !location) {
    return res.status(400).json({ error: "Missing fields for anonymous report." });
  }
  const newReport = {
    id: "anon_" + Date.now().toString(),
    category,
    details,
    location,
    planCompleted: !!planCompleted,
    status: "submitted",
    date: new Date().toISOString()
  };
  db_anonymous_reports.push(newReport);
  res.json({ success: true, report: newReport });
});

app.post("/api/women/ai-skill-bot", async (req, res) => {
  const { skill, messages } = req.body;
  if (!skill || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Skill and message history are required." });
  }

  const ai = getAiClient();
  if (!ai) {
    console.log("[EMORA SKILL AI] No Gemini key found, running fallback response simulator.");
    const userMsg = messages[messages.length - 1]?.text || "";
    return res.json({
      text: `Hello! I am Emora, your AI Skill-Building Mentor. I am currently operating in localized offline mode since the server is still initializing. 

To help you build your path in **${skill}**, let's tackle your question: "${userMsg}". 

Here is a recommended focus roadmap for **${skill}**:
1. **Understand Fundamentals**: Focus on core principles and practice exercises.
2. **Build Mini-Projects**: Create tiny functional projects to apply what you've learned.
3. **Seek Feedback**: Join child/women peer boards to share your solutions.

Feel free to ask more details about coding compilers, graphic layout systems, prompt guides, or digital branding pipelines once we connect online!`
    });
  }

  try {
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `You are Emora, an inspiring, encouraging, and highly technical AI Skill-Building Mentor for women in Cameroon.
    The user is studying the skill: ${skill}.
    Provide clear, concrete, and highly actionable learning advice. Break down complex terms into simple steps.
    Suggest real-world practice examples or tasks appropriate to Cameroon's local context (such as digital payments, mobile-only optimizations, or local agency projects).
    Always maintain an empowering, encouraging, and highly supportive tone. Avoid generic answers—stay technical, practical, and highly helpful. Include coding or markdown lists where helpful!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("AI Skill Bot failed:", err);
    res.status(500).json({ error: "Failed to query Gemini AI Skill Bot.", details: err.message });
  }
});

app.post("/api/women/gbv-bot", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Message history is required." });
  }

  const ai = getAiClient();
  if (!ai) {
    console.log("[EMORA SAFETY AI] No Gemini key found, running fallback response simulator.");
    const userMsg = messages[messages.length - 1]?.text || "";
    return res.json({
      text: `Hello, I am Emora, your Safe Space Awareness Assistant. I am operating in localized secure mode. 

Your safety is our absolute highest priority. To support your discussion or questions: "${userMsg}":

Here are core pillars of safety and legal rights in Cameroon:
- **Immediate Resource Finder**: Navigate to our "GBV Safety Tools" directory to find direct phone, WhatsApp and physical addresses for shelters and legal councils.
- **Anonymous Helpline**: You can report danger completely anonymously without registering a user profile.
- **Your Legal Rights**: Law No. 2016/007 of the Penal Code under Cameroon legislation strictly criminalizes domestic violence, sexual assaults, and workplace harassment.

Please let me know how I can guide you further or check out the interactive "Safety Planning Tool" for a step-by-step custom safety planner.`
    });
  }

  try {
    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `You are Emora Support, a warm, safe, comforting, and deeply professional Gender-Based Violence (GBV) awareness counselor for women in Cameroon.
    Your main goal is to deliver reassuring, non-judgmental information on recognizing abuse (emotional, physical, economic, or psychological), and understanding survivor legal rights in Cameroon.
    Never sound clinical or distant—prioritize warmth, compassion, safety, and validation.
    CRITICAL: Always encourage formulating a custom safety plan (e.g. collecting secure documents, securing emergency cash, identifying a safe host family/neighbor).
    If the user shares immediate danger or fear of assault, warmly guide them to click and call local helpline contacts or the NGO Directory instantly. Just provide emotional validation and structured guidance, never make false promises. Keep responses highly organized and easy to read.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("GBV Bot failed:", err);
    res.status(500).json({ error: "Failed to query GBV Awareness Bot.", details: err.message });
  }
});


// -------------------------------------------------------------
// PROGRESS TRACKS FOR EDUCATION AND SKILLS
// -------------------------------------------------------------
const db_education_progress: Record<string, { completedSkills: string[], completedLessons: string[] }> = {
  "usr1": {
    completedSkills: [],
    completedLessons: ["e1"]
  }
};

app.get("/api/women/progress", (req, res) => {
  const userId = currentUserSession ? currentUserSession.id : "guest_user";
  if (!db_education_progress[userId]) {
    db_education_progress[userId] = { completedSkills: [], completedLessons: [] };
  }
  res.json(db_education_progress[userId]);
});

app.post("/api/women/progress", (req, res) => {
  const userId = currentUserSession ? currentUserSession.id : "guest_user";
  const { type, id: itemId, action } = req.body;
  
  if (!type || !itemId || !action) {
    return res.status(400).json({ error: "Missing required progression fields: type, id, and action are required." });
  }

  if (!db_education_progress[userId]) {
    db_education_progress[userId] = { completedSkills: [], completedLessons: [] };
  }

  const progress = db_education_progress[userId];
  if (type === "skill") {
    if (action === "complete" && !progress.completedSkills.includes(itemId)) {
      progress.completedSkills.push(itemId);
    } else if (action === "incomplete") {
      progress.completedSkills = progress.completedSkills.filter(i => i !== itemId);
    }
  } else if (type === "lesson") {
    if (action === "complete" && !progress.completedLessons.includes(itemId)) {
      progress.completedLessons.push(itemId);
    } else if (action === "incomplete") {
      progress.completedLessons = progress.completedLessons.filter(i => i !== itemId);
    }
  }

  res.json({ success: true, progress });
});


// -------------------------------------------------------------
// VITE OR STATIC FILES SERVING (PRODUCTION vs DEVELOPMENT)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Emora Server] running on http://localhost:${PORT}`);
  });
}

startServer();
