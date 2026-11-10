import { Profile, Territory, Alert, EmergencyAlert, SmsLog, EducationContent, NGODirectory } from './src/types';

// Let's seed territories
export const TERRITORIES: Territory[] = [
  { id: 't1', name: 'Centre (Yaoundé)', region: 'Centre', country: 'Cameroon' },
  { id: 't2', name: 'Littoral (Douala)', region: 'Littoral', country: 'Cameroon' },
  { id: 't3', name: 'South-West (Buea)', region: 'South-West', country: 'Cameroon' },
  { id: 't4', name: 'North-West (Bamenda)', region: 'North-West', country: 'Cameroon' },
  { id: 't5', name: 'West (Bafoussam)', region: 'West', country: 'Cameroon' },
  { id: 't6', name: 'Far North (Maroua)', region: 'Far North', country: 'Cameroon' },
  { id: 't7', name: 'North (Garoua)', region: 'North', country: 'Cameroon' },
  { id: 't8', name: 'Adamaoua (Ngaoundéré)', region: 'Adamaoua', country: 'Cameroon' },
  { id: 't9', name: 'East (Bertoua)', region: 'East', country: 'Cameroon' },
  { id: 't10', name: 'South (Ebolowa)', region: 'South', country: 'Cameroon' }
];

// Let's seed initial protective educational cards with videos
export const EDUCATION_CONTENT: EducationContent[] = [
  {
    id: 'e1',
    age_group: 'Little Learners (4-7)',
    title: 'The Safe Circle Game',
    body_text: 'Learn how to identify the five trusted adults in your life who make up your Safe Circle. If you ever feel scared, confused, or unsafe, these are the people you can talk to immediately.',
    icon_name: 'ShieldAlert',
    video_url: 'https://www.youtube.com/embed/9XyR7g98y0U', // Child safety rules
    video_thumbnail_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60',
    video_duration: '3:45',
    is_active: true,
    order_index: 1
  },
  {
    id: 'e2',
    age_group: 'Little Learners (4-7)',
    title: 'My Body Belongs to Me',
    body_text: 'Your body is yours alone. Learn the difference between safe touches (like a high-five or a hug from mom) and unsafe or secret touches. Remember: you always have the right to say NO!',
    icon_name: 'Heart',
    video_url: 'https://www.youtube.com/embed/a7Sg-mS7E8c', // Educational safety video
    video_thumbnail_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&auto=format&fit=crop&q=60',
    video_duration: '4:12',
    is_active: true,
    order_index: 2
  },
  {
    id: 'e7',
    age_group: 'Little Learners (4-7)',
    title: 'Stranger Safety Rules',
    body_text: 'Learn what to do if an unknown person approaches you in public, asks you for directions, or offers you sweets or gifts. Always say "No", run to a safe place, and tell a trusted adult immediately.',
    icon_name: 'AlertCircle',
    video_url: 'https://www.youtube.com/embed/g0S_DREB_Z0',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&auto=format&fit=crop&q=60',
    video_duration: '3:20',
    is_active: true,
    order_index: 3
  },
  {
    id: 'e8',
    age_group: 'Little Learners (4-7)',
    title: 'My Secrets Check',
    body_text: 'Some secrets are fun and happy, like a surprise birthday party! But secrets that make you feel sad, scared, or worried are bad secrets. You must never keep a bad secret—always tell a safe adult.',
    icon_name: 'Lock',
    video_url: 'https://www.youtube.com/embed/V6Mv0j60H0k',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&auto=format&fit=crop&q=60',
    video_duration: '4:40',
    is_active: true,
    order_index: 4
  },
  {
    id: 'e3',
    age_group: 'Growing Up (8-12)',
    title: 'Smart Internet Detective',
    body_text: 'Playing online games is fun, but some players might not be who they say they are. Discover the Golden Rules of internet safety: never share your real name, school, location, or photos with anyone online.',
    icon_name: 'Smartphone',
    video_url: 'https://www.youtube.com/embed/XQDn8V1b20k', // Cyber safety video for kids
    video_thumbnail_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=60',
    video_duration: '5:20',
    is_active: true,
    order_index: 1
  },
  {
    id: 'e4',
    age_group: 'Growing Up (8-12)',
    title: 'The Power of Speaking Up',
    body_text: 'If a friend or an adult asks you to keep a secret that makes you feel bad or uncomfortable, that is an unsafe secret. Speak up immediately to a parent, teacher, or call our Emora helpline.',
    icon_name: 'MessageCircle',
    video_url: 'https://www.youtube.com/embed/I8C_v7CqLFA', // Bullying and speaking up
    video_thumbnail_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=60',
    video_duration: '3:10',
    is_active: true,
    order_index: 2
  },
  {
    id: 'e9',
    age_group: 'Growing Up (8-12)',
    title: 'Safe Commute & Buddy System',
    body_text: 'Walking to school or the market is safer together. Learn how the buddy system works, why to stick to well-lit main roads, and how to spot safe community zones on your commute.',
    icon_name: 'MapPin',
    video_url: 'https://www.youtube.com/embed/H01A_6C8Hsc',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1473649035228-11d1294e01d7?w=600&auto=format&fit=crop&q=60',
    video_duration: '4:15',
    is_active: true,
    order_index: 3
  },
  {
    id: 'e10',
    age_group: 'Growing Up (8-12)',
    title: 'Emergency Superpowers',
    body_text: 'Do you know what to do in case of danger? Memorize your mom and dad\'s phone numbers, your home address, and how to reach the nearest police or Emora emergency response line.',
    icon_name: 'PhoneCall',
    video_url: 'https://www.youtube.com/embed/YpSmP_y2_U0',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=600&auto=format&fit=crop&q=60',
    video_duration: '3:50',
    is_active: true,
    order_index: 4
  },
  {
    id: 'e5',
    age_group: 'Teens (13-17)',
    title: 'Digital Footprint & Reputation',
    body_text: 'What you post online stays online forever. Learn about the dangers of cyber-predators, sharing sensitive personal details, grooming indicators, and how to block and report abusive behaviour on social networks.',
    icon_name: 'Globe',
    video_url: 'https://www.youtube.com/embed/6TUMHplBveo', // Digital safety for teens
    video_thumbnail_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop&q=60',
    video_duration: '6:02',
    is_active: true,
    order_index: 1
  },
  {
    id: 'e6',
    age_group: 'Teens (13-17)',
    title: 'Real Friends vs Online Profiles',
    body_text: 'Understand the psychological tactics used by online groomers. Learn how to identify warning signs in messages (such as offering gifts, asking for secrets, or requesting meeting up offline alone) and how to protect yourself.',
    icon_name: 'Users',
    video_url: 'https://www.youtube.com/embed/hK5OeGeudBM', // Real-world grooming warnings and digital literacy
    video_thumbnail_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=60',
    video_duration: '5:45',
    is_active: true,
    order_index: 2
  },
  {
    id: 'e11',
    age_group: 'Teens (13-17)',
    title: 'Deconstructing Cyberbullying',
    body_text: 'Cyberbullying is persistent online harassment. Learn how to build resilience, capture and screenshot evidence for reporting, block harassers, and support peers experiencing digital abuse.',
    icon_name: 'MessageSquareOff',
    video_url: 'https://www.youtube.com/embed/6_rby_Ccoi8',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=60',
    video_duration: '5:10',
    is_active: true,
    order_index: 3
  },
  {
    id: 'e12',
    age_group: 'Teens (13-17)',
    title: 'Recognizing Travel & Job Scams',
    body_text: 'Exploiters frequently use bait social media ads promising high stakes scholarship abroad or well-paying remote jobs. Learn the markers of human trafficking scams and how to authenticate authentic programs.',
    icon_name: 'Briefcase',
    video_url: 'https://www.youtube.com/embed/S_Tz9iHsc1w',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=60',
    video_duration: '6:30',
    is_active: true,
    order_index: 4
  },
  {
    id: 'e13',
    age_group: 'Little Learners (4-7)',
    title: 'Saying No is Okay!',
    body_text: 'No one has the right to force you to hug, kiss, or touch them—even people you think are very friendly. If someone asks you to do something that makes you uncomfortable, say "No" loud and clear!',
    icon_name: 'AlertCircle',
    video_url: 'https://www.youtube.com/embed/g0S_DREB_Z0',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=600&auto=format&fit=crop&q=60',
    video_duration: '3:50',
    is_active: true,
    order_index: 5
  },
  {
    id: 'e14',
    age_group: 'Little Learners (4-7)',
    title: 'Who is a Community Helper?',
    body_text: 'If you are ever separated from your parents in a market, store, or road, look for a uniform helper. Police officers, bank guards, and store clerks wearing official badges are there to keep you safe and help connect you back to your family.',
    icon_name: 'Shield',
    video_url: 'https://www.youtube.com/embed/9XyR7g98y0U',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60',
    video_duration: '4:20',
    is_active: true,
    order_index: 6
  },
  {
    id: 'e15',
    age_group: 'Growing Up (8-12)',
    title: 'Keep Your Secrets Secret',
    body_text: 'Never upload or share details about where you live, what school you go to, or the hours you walk home from school. Predators can piece together these details over time, even from casual game chats.',
    icon_name: 'Lock',
    video_url: 'https://www.youtube.com/embed/XQDn8V1b20k',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
    video_duration: '5:10',
    is_active: true,
    order_index: 5
  },
  {
    id: 'e16',
    age_group: 'Growing Up (8-12)',
    title: 'Safe Transit & Route Mapping',
    body_text: 'Plan your school route with a parent or guardian. Avoid narrow shortcuts, dense alleys, or abandoned lots. Walk dynamically with your buddy, and always let parents know if you need to take an unusual path.',
    icon_name: 'MapPin',
    video_url: 'https://www.youtube.com/embed/H01A_6C8Hsc',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=60',
    video_duration: '4:30',
    is_active: true,
    order_index: 6
  },
  {
    id: 'e17',
    age_group: 'Teens (13-17)',
    title: 'The Blueprint of Grooming',
    body_text: 'Groomers follow a calculated pattern: they isolate you, shower you with gifts/flattery, and ask you to keep secrets. Learn how to immediately break this spell by reporting strange behaviors to family counselors.',
    icon_name: 'Users',
    video_url: 'https://www.youtube.com/embed/hK5OeGeudBM',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=600&auto=format&fit=crop&q=60',
    video_duration: '6:15',
    is_active: true,
    order_index: 5
  },
  {
    id: 'e18',
    age_group: 'Teens (13-17)',
    title: 'Creating a Protective Peer Circle',
    body_text: 'As teenagers, you are each other\'s best shield. Learn how to check on friends who might be getting messages from mysterious accounts, how to stage light interventions, and how to report indicators to child-safety watchdogs.',
    icon_name: 'ShieldAlert',
    video_url: 'https://www.youtube.com/embed/6_rby_Ccoi8',
    video_thumbnail_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=60',
    video_duration: '5:50',
    is_active: true,
    order_index: 6
  }
];

// Let's seed NGOs assisting in Cameroon
export const NGOS: NGODirectory[] = [
  {
    id: 'ngo1',
    name: 'Cameroon Child Protection Network (CCPN)',
    description: 'Providing rescue, rapid emergency assistance, clinical rehabilitation, and safe temporary shelters for runaway, displaced, or missing children in Cameroon.',
    specialisations: ['Missing Children Rescue', 'Family Reunification', 'Trauma Counseling'],
    territories: ['Centre (Yaoundé)', 'Littoral (Douala)', 'West (Bafoussam)'],
    phone_primary: '+237 677 889 012',
    phone_secondary: '+237 699 112 233',
    whatsapp_number: '+237 677 889 012',
    email: 'contact@ccpn-cameroon.org',
    website_url: 'https://ccpn-cameroon.org',
    physical_address: 'Quartier Bastos, Yaoundé, Cameroon',
    is_verified: true,
    is_active: true
  },
  {
    id: 'ngo2',
    name: 'L’Œuvre de Solidarité pour l’Enfance (OSE)',
    description: 'Active child-protection agency operating across Anglophone and Francophone territories. Focused on local community watch programs and preventing child exploitation.',
    specialisations: ['Community Safeguards', 'Legal Advocacy', 'Education'],
    territories: ['South-West (Buea)', 'North-West (Bamenda)', 'Littoral (Douala)'],
    phone_primary: '+237 655 443 322',
    email: 'info@ose-enfance.org',
    website_url: 'https://ose-enfance.org',
    physical_address: 'Rue Ndokoti, Douala, Cameroon',
    is_verified: true,
    is_active: true
  },
  {
    id: 'ngo3',
    name: 'Sahel Child Hope Initiative (SCHI)',
    description: 'Focused specifically on children missing due to conflicts or climate displacement in Northern Cameroon. Establishes satellite safety booths in rural territories.',
    specialisations: ['Displacement Reunification', 'Emergency Feeding', 'First Aid'],
    territories: ['Far North (Maroua)', 'North (Garoua)', 'Adamaoua (Ngaoundéré)'],
    phone_primary: '+237 682 900 114',
    whatsapp_number: '+237 682 900 114',
    email: 'help@sahelchildhope.org',
    website_url: 'https://sahelchildhope.org',
    physical_address: 'Quartier Marouaré, Garoua, Cameroon',
    is_verified: true,
    is_active: true
  },
  {
    id: 'ngo4',
    name: 'ALDEPA (Action Locale pour le Développement Participatif)',
    description: 'A distinguished local organization working extensively in the northern regions of Cameroon. Focused heavily on girls protective education, preventing childhood trafficking, and child marriage deterrence.',
    specialisations: ['Girls Protection', 'Anti-Trafficking Safety', 'Legal Accompaniment'],
    territories: ['Far North (Maroua)', 'North (Garoua)', 'Centre (Yaoundé)'],
    phone_primary: '+237 699 923 154',
    whatsapp_number: '+237 699 923 154',
    email: 'contact@aldepa-cameroon.org',
    website_url: 'https://aldepa-cameroon.org',
    physical_address: 'Route de l’Aéroport, Maroua, Cameroon',
    is_verified: true,
    is_active: true
  },
  {
    id: 'ngo5',
    name: 'Hope for Children Cameroon (HCC)',
    description: 'Committed to child development, safe rescue operations, psychological family trauma support, and creating localized community-driven safe spaces in the southern and eastern parts of Cameroon.',
    specialisations: ['Community Safe Spaces', 'Psychological Support', 'Temporary Foster Care'],
    territories: ['South (Ebolowa)', 'East (Bertoua)', 'Littoral (Douala)'],
    phone_primary: '+237 651 229 033',
    email: 'info@hopechildrencameroon.org',
    website_url: 'https://hopechildrencameroon.org',
    physical_address: 'Quartier Haoussa, Ebolowa, Cameroon',
    is_verified: true,
    is_active: true
  }
];

// Let's seed preloaded users (with logins)
export const PROFILES: Profile[] = [
  {
    id: 'usr1',
    full_name: 'Christelle Kamdem',
    phone_number: '677000001',
    email: 'christellekamdem880@gmail.com',
    territories: ['Centre (Yaoundé)', 'Littoral (Douala)'],
    role: 'admin',
    is_active: true,
    created_at: new Date('2026-01-01T12:00:00Z').toISOString()
  },
  {
    id: 'usr2',
    full_name: 'Abisalom Mukete',
    phone_number: '681112233',
    email: 'mukete@safealert.cm',
    territories: ['South-West (Buea)'],
    role: 'moderator',
    is_active: true,
    created_at: new Date('2026-02-15T09:30:00Z').toISOString()
  },
  {
    id: 'usr3',
    full_name: 'Jean-Pierre Nguene',
    phone_number: '699887766',
    email: 'jeanpierre@gmail.com',
    territories: ['Littoral (Douala)'],
    role: 'user',
    is_active: true,
    created_at: new Date('2026-03-10T14:45:00Z').toISOString()
  }
];

// Seed for Women Empowerment Module
export const PEER_GROUPS = [
  { id: "g1", name: "Women in Tech - Yaoundé", description: "Safe space to share coding tips, job opportunities, and web dev resources.", members: 142, category: "Tech & Professional" },
  { id: "g2", name: "Bastos Creative Entrepreneurs", description: "Inspirational business network focusing on digital marketing and design in Cameroon.", members: 98, category: "Business" },
  { id: "g3", name: "GBV Survivors Solidarity", description: "Completely private peer-led support circle for sharing stories, healing, and guidance.", members: 64, category: "GBV Support" },
  { id: "g4", name: "Sahel Sisters Alliance", description: "Focused on mentorship, literacy, and skill-building in Northern Cameroon.", members: 82, category: "Advocacy" },
  { id: "g5", name: "Douala Freelance Network", description: "Connect with freelance writers, graphic designers, and social media managers.", members: 115, category: "Tech & Professional" }
];

export const MENTORS = [
  { id: "m1", name: "Dr. Florence Ndip", expertise: "Software Development", bio: "Senior Engineer with 12+ years experience in Node.js and Cloud Infrastructure. Passionate about bringing women into STEM.", location: "Yaoundé", rating: 4.9, image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80" },
  { id: "m2", name: "Inès Fotso", expertise: "Digital Marketing", bio: "Growth marketer and former lead at Orange Cameroon. Expert in brands strategy and social ads.", location: "Douala", rating: 4.8, image: "https://images.unsplash.com/photo-1590650154873-d1231f363161?w=300&auto=format&fit=crop&q=80" },
  { id: "m3", name: "Amina Alhadji", expertise: "Prompt Engineering", bio: "AI researcher focusing on LLM custom optimizations and generative tools for AI-driven copywriting.", location: "Garoua", rating: 5.0, image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&auto=format&fit=crop&q=80" },
  { id: "m4", name: "Mirielle Ndem", expertise: "Graphic Design", bio: "Visual strategist and branding director. Skilled in Figma, Adobe Illustrator, and typographic storytelling.", location: "Buea", rating: 4.7, image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&auto=format&fit=crop&q=80" }
];

export const SUCCESS_STORIES = [
  { id: "s1", author: "Cynthia Atanga", title: "From Zero to Web Developer in Douala", story: "Two years ago, I didn't know what an HTML tag was. By joining the Emora platform and utilizing the Web Development skill bot, I built my first portfolio website. Last month, I was hired by a technology consulting firm in Douala as a Junior Developer. Hard work really pays off, don't let anyone deter you!", location: "Douala", image: "https://images.unsplash.com/photo-1580894732444-8febeb78ec3e?w=500&auto=format&fit=crop&q=80", date: "2026-05-15", category: "Web Development" },
  { id: "s2", author: "Fadimatou Bello", title: "Scaling a local spice shop with Digital Marketing", story: "I run a agricultural packaging startup. Setting up advertisements on social channels felt impossible. By learning structural copywriting and digital marketing prompts from Emora, our orders rose by 250% in Yaoundé. We now employ three more women from our rural cooperative!", location: "Yaoundé", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&auto=format&fit=crop&q=80", date: "2026-05-28", category: "Digital Marketing" },
  { id: "s3", author: "Grace Enanga", title: "Breaking through after a survival journey", story: "Gender-based violence is a trauma that silences your voice. Recovering our agency is a collective task. Thanks to the anonymous reporting and community resources, I relocated to a safe transit space in Buea. Today I study Software Development and mentor others. We are survivors, not victims.", location: "Buea", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80", date: "2026-06-02", category: "Advocacy" }
];

// Seed active / pending reports for Cameroon child safety
export const ALERTS: Alert[] = [
  {
    id: 'alert-1',
    short_id: 'ch8x2a39fd',
    type: 'missing_child',
    child_name: 'Stéphane Morelle Nanga (Tsoukou)',
    child_age: 10,
    physical_description: 'Boy wearing a light blue-colored button-up school shirt, khaki brown trousers, beige shoes. Speaks French and Maka\'a fluently. Pupil at CETIC of KAK 2 by Mboma.',
    description: 'Disappeared from his parents\' home in MBOMA centre on Friday, April 17, 2026. Last seen in MBOMA centre leaving for an unknown destination. His parents pray anyone with information to contact 652064913 or report immediately.',
    last_known_location: 'MBOMA Centre, East Region',
    territory_id: 't9', // East (Bertoua)
    photo_url: '/src/assets/images/boy_school_shirt_1780041433486.png',
    reporter_id: 'usr3',
    reporter_name: 'Haut-Nyong Infos Tv',
    reporter_contact: '+237 652 064 913',
    status: 'active',
    urgency_score: 9.6,
    credibility_score: 9.8,
    triage_badge: 'HIGH_PRIORITY',
    ai_flags: ['Verified School uniforms', 'Specific contact details present'],
    ai_summary: '10-year-old Stéphane Morelle Nanga (Tsoukou) is missing from Mboma Centre since April 17, 2026. Active search with high credibility and detailed contact coordinates.',
    suggested_action: 'approve',
    ai_scored_at: new Date('2026-05-29T10:00:00Z').toISOString(),
    created_at: new Date('2026-05-27T09:30:00Z').toISOString(),
    updated_at: new Date('2026-05-29T10:00:00Z').toISOString()
  },
  {
    id: 'alert-2',
    short_id: 'sn4k9b88zz',
    type: 'missing_child',
    child_name: 'Bidjane Randy',
    child_age: 12,
    physical_description: 'Wears a classy navy blue traditional tailored linen top with stunning gold collar embroidery and decorative buttons. Speaks French. Last seen wearing grey shorts (culotte).',
    description: 'Disappeared from Yaoundé Etoudi neighborhood since Saturday afternoon, May 2, 2026, around 2:00 PM. Highly energetic boy, please share and report sighting details to assist the family.',
    last_known_location: 'Quartier Etoudi, Yaoundé',
    territory_id: 't1', // Centre
    photo_url: '/src/assets/images/boy_traditional_1780041451193.png',
    reporter_id: 'usr2',
    reporter_name: 'SOS New Coordination',
    reporter_contact: '+237 699 112 233',
    status: 'active',
    urgency_score: 9.3,
    credibility_score: 9.5,
    triage_badge: 'HIGH_PRIORITY',
    ai_flags: ['Specific location coordinates', 'Yaounde Central dispatch'],
    ai_summary: '12-year-old Bidjane Randy missing from Etoudi Yaounde since May 2, 2026. Detailed dress descriptor included.',
    suggested_action: 'approve',
    ai_scored_at: new Date('2026-05-29T00:12:00Z').toISOString(),
    created_at: new Date('2026-05-28T00:10:00Z').toISOString(),
    updated_at: new Date('2026-05-29T00:12:00Z').toISOString()
  },
  {
    id: 'alert-3',
    short_id: 'ch1a8q99pl',
    type: 'missing_child',
    child_name: 'Allah-Issem Christian',
    child_age: 14,
    physical_description: 'Tall teenage student, clean brushed hair, wearing white cotton polo shirt, direct intense gaze. Speaks French and Sahel dialects.',
    description: 'Disappeared from border region since Friday, May 13, 2026. Family has launched comprehensive active trace, high concern for cross-territory safety.',
    last_known_location: 'Border Zone / Maroua Sector',
    territory_id: 't6', // Far North
    photo_url: '/src/assets/images/boy_blue_bg_1780041466472.png',
    reporter_id: 'usr1',
    reporter_name: 'Journal L\'oeil du Sahara',
    reporter_contact: '+237 682 900 114',
    status: 'active',
    urgency_score: 9.0,
    credibility_score: 9.2,
    triage_badge: 'NEEDS_REVIEW',
    ai_flags: ['Border cross area flagged', 'Regional media reports'],
    ai_summary: 'Christian Allah-Issem has disappeared near Far North/Sahel transit points. Local media tracking is active.',
    suggested_action: 'approve',
    ai_scored_at: new Date('2026-05-29T01:00:00Z').toISOString(),
    created_at: new Date('2026-05-28T00:15:00Z').toISOString(),
    updated_at: new Date('2026-05-29T01:00:00Z').toISOString()
  },
  {
    id: 'alert-4',
    short_id: 'ch2j3k44ll',
    type: 'missing_child',
    child_name: 'Grace Florence Ngo',
    child_age: 11,
    physical_description: 'Braided hair, wearing double-layered short sleeve black knit top and solid black dress skirt. Friendly demeanor, often holds up a peace sign.',
    description: 'Wandered off along a dirt road leading outside of market environments in Douala on Friday, May 20, 2026. Family seeking help to locate her.',
    last_known_location: 'Ndokoti Market area, Douala',
    territory_id: 't2', // Littoral
    photo_url: '/src/assets/images/young_girl_peace_1780041400826.png',
    reporter_id: 'usr3',
    reporter_name: 'Jean-Pierre Nguene',
    reporter_contact: '+237 699 887 766',
    status: 'active',
    urgency_score: 9.4,
    credibility_score: 9.6,
    triage_badge: 'HIGH_PRIORITY',
    ai_flags: ['Vocal community reporting'],
    ai_summary: '11-year-old child Grace Florence Ngo is missing from Littoral Douala. Speaks French and Bassa.',
    suggested_action: 'approve',
    ai_scored_at: new Date('2026-05-29T01:05:00Z').toISOString(),
    created_at: new Date('2026-05-25T09:00:00Z').toISOString(),
    updated_at: new Date('2026-05-29T01:05:00Z').toISOString()
  },
  {
    id: 'alert-5',
    short_id: 'ch9v1o77aa',
    type: 'missing_child',
    child_name: 'Stephanie Biyo\'o',
    child_age: 9,
    physical_description: 'Wearing brown high-contrast school uniform dress, carrying a vibrant blue school backpack with comfortable shoulder straps, holding a notebook.',
    description: 'Disappeared shortly after afternoon school hours in Centre Yaoundé on Monday, May 25, 2026. Friendly, speaks French and Eton.',
    last_known_location: 'Government Primary Campus, Yaoundé',
    territory_id: 't1', // Centre
    photo_url: '/src/assets/images/girl_backpack_1780041417618.png',
    reporter_id: 'usr1',
    reporter_name: 'Christelle Kamdem',
    reporter_contact: '+237 677 000 001',
    status: 'active',
    urgency_score: 9.5,
    credibility_score: 9.7,
    triage_badge: 'HIGH_PRIORITY',
    ai_flags: ['Primary alert level', 'School exit sighting'],
    ai_summary: '9-year-old Stephanie Biyo is missing from Yaounde after school. Speaks French and Eton.',
    suggested_action: 'approve',
    ai_scored_at: new Date('2026-05-29T01:10:00Z').toISOString(),
    created_at: new Date('2026-05-26T07:15:00Z').toISOString(),
    updated_at: new Date('2026-05-29T01:10:00Z').toISOString()
  }
];

export const EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 'em-1',
    short_id: 'em99ab',
    emergency_type: 'Assault Attempt',
    description: 'Suspicious individual was grabbing children near Akwa market.',
    territory_id: 't2',
    sender_id: 'usr3',
    sender_name: 'Jean-Pierre Nguene',
    sender_phone: '699887766',
    status: 'sent',
    created_at: new Date('2026-05-27T18:00:00Z').toISOString()
  }
];

export const SMS_EMAIL_LOGS: SmsLog[] = [
  {
    id: 'log-1',
    alert_id: 'alert-1',
    type: 'SMS',
    provider: 'Orange SMS API',
    recipients_count: 420,
    status: 'success',
    sent_to: 'Subscribers of Centre (Yaoundé)',
    sent_at: new Date('2026-05-27T10:02:00Z').toISOString()
  },
  {
    id: 'log-2',
    alert_id: 'alert-1',
    type: 'EMAIL',
    recipients_count: 145,
    status: 'success',
    sent_to: 'Subscribers of Centre (Yaoundé)',
    sent_at: new Date('2026-05-27T10:02:00Z').toISOString()
  }
];


// Database state managers (since this is an in-memory db with file/storage capability to serve our app)
export let db_profiles = [...PROFILES];
export let db_alerts = [...ALERTS];
export let db_emergency_alerts = [...EMERGENCY_ALERTS];
export let db_logs = [...SMS_EMAIL_LOGS];
export let db_ngos = [...NGOS];
export let db_education = [...EDUCATION_CONTENT];

export let db_peer_groups = [...PEER_GROUPS];
export let db_mentors = [...MENTORS];
export let db_mentor_matches: any[] = [];
export let db_success_stories = [...SUCCESS_STORIES];
export let db_anonymous_reports: any[] = [];

export function resetDatabase() {
  db_profiles = [...PROFILES];
  db_alerts = [...ALERTS];
  db_emergency_alerts = [...EMERGENCY_ALERTS];
  db_logs = [...SMS_EMAIL_LOGS];
  db_ngos = [...NGOS];
  db_education = [...EDUCATION_CONTENT];
  db_peer_groups = [...PEER_GROUPS];
  db_mentors = [...MENTORS];
  db_mentor_matches = [];
  db_success_stories = [...SUCCESS_STORIES];
  db_anonymous_reports = [];
}

export function generateShortId(length = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
