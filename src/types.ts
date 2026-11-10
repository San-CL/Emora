export interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  email: string;
  territories: string[]; // Territory names or IDs
  role: 'user' | 'moderator' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Territory {
  id: string;
  name: string;
  region: string;
  country: string;
}

export interface Alert {
  id: string;
  short_id: string;
  type: 'missing_child' | 'suspicious_person';
  child_name?: string;
  child_age?: number;
  physical_description?: string;
  description: string;
  last_known_location: string;
  territory_id: string;
  photo_url?: string;
  reporter_id: string;
  reporter_name: string;
  reporter_contact: string;
  status: 'pending_review' | 'approved' | 'active' | 'found_safe' | 'case_closed' | 'false_report' | 'expired' | 'under_review';
  rejection_reason?: string;
  expires_at?: string;
  flags_count?: number;
  
  // AI scoring columns (v2.3)
  urgency_score?: number; // 0 to 10
  credibility_score?: number; // 0 to 10
  triage_badge?: 'HIGH_PRIORITY' | 'NEEDS_REVIEW' | 'LOW_PRIORITY';
  ai_flags?: string[];
  ai_summary?: string;
  suggested_action?: 'approve' | 'reject' | 'request_info';
  ai_scored_at?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EmergencyAlert {
  id: string;
  short_id: string;
  emergency_type: string;
  description: string;
  territory_id: string;
  sender_id: string;
  sender_name: string;
  sender_phone: string;
  status: string;
  created_at: string;
}

export interface SmsLog {
  id: string;
  alert_id?: string;
  emergency_alert_id?: string;
  type: 'SMS' | 'EMAIL';
  provider?: string;
  recipients_count: number;
  status: 'success' | 'failed';
  error_message?: string;
  sent_to: string; // Phone or Email address list
  sent_at: string;
  preview_url?: string; // Add Ethereal SMTP live preview link for verification
}

export interface EducationContent {
  id: string;
  age_group: 'Little Learners (4-7)' | 'Growing Up (8-12)' | 'Teens (13-17)';
  title: string;
  body_text: string;
  icon_name: string;
  video_url?: string; // YouTube or direct video URL
  video_thumbnail_url?: string;
  video_duration?: string;
  is_active: boolean;
  order_index: number;
  created_at?: string;
}

export interface NGODirectory {
  id: string;
  name: string;
  description: string;
  specialisations: string[];
  territories: string[]; // List of territory names or IDs
  phone_primary: string;
  phone_secondary?: string;
  whatsapp_number?: string;
  email: string;
  website_url?: string;
  physical_address: string;
  logo_url?: string;
  is_verified: boolean;
  is_active: boolean;
}
