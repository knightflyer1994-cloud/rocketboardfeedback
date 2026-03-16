export type FlowMode = 'fast' | 'deep' | 'executive';

export interface SessionData {
  id: string;
  mode: FlowMode;
  role?: string;
  company_size_total?: number;
  company_size_eng?: number;
  hiring_volume?: string;
  work_mode?: string;
  persona_focus?: string;
}

export interface ChapterAnswers {
  [key: string]: unknown;
}

export interface AllAnswers {
  [chapter: number]: ChapterAnswers;
}

export interface Chapter10Answers extends ChapterAnswers {
  anything_else?: string;
  follow_up_consent?: boolean;
  contact_name?: string;
  contact_email?: string;
}

export interface InsightReport {
  topBottlenecks: string[];
  knowledgeConcentration: string[];
  mustHaveIntegrations: string[];
  visionScore: number;
  frictionScore: number;
  keyThemes: {
    role?: string;
    companySize?: string;
    workMode?: string;
    productivityMetrics?: string[];
    timelineIssues?: string[];
    openText?: string;
    accessStory?: string;
    redlineSources?: string;
    aiGovernance?: string;
    otherIntegrations?: string;
    postMonth1?: string;
    cultureVision?: string;
  };
}

export const CHAPTERS_EXECUTIVE = [
  { id: 1, label: 'Snapshot' },
  { id: 3, label: 'Challenges' },
  { id: 8, label: 'Vision' },
  { id: 10, label: 'Closing' },
];

export const CHAPTERS_FAST = [
  { id: 1, label: 'Snapshot' },
  { id: 2, label: 'Reality' },
  { id: 3, label: 'Bottlenecks' },
  { id: 4, label: 'Knowledge' },
  { id: 5, label: 'Integrations' },
  { id: 6, label: 'Services' },
  { id: 8, label: 'Vision' },
  { id: 9, label: 'Adoption' },
  { id: 10, label: 'Closing' },
];

export const CHAPTERS_DEEP = [
  { id: 1, label: 'Snapshot' },
  { id: 2, label: 'Reality' },
  { id: 3, label: 'Bottlenecks' },
  { id: 4, label: 'Knowledge' },
  { id: 5, label: 'Integrations' },
  { id: 6, label: 'Services' },
  { id: 7, label: 'Competitive' },
  { id: 8, label: 'Vision' },
  { id: 9, label: 'Adoption' },
  { id: 10, label: 'Closing' },
];

export const BOTTLENECK_CARDS = [
  { id: 'scattered_docs', label: 'Scattered Docs', icon: '📄', desc: 'Knowledge spread across too many tools' },
  { id: 'stale_info', label: 'Stale Information', icon: '🕸️', desc: 'Docs that are months or years out of date' },
  { id: 'access_delays', label: 'Access Delays', icon: '🔒', desc: 'Waiting days for system permissions' },
  { id: 'tribal_knowledge', label: 'Tribal Knowledge', icon: '🧠', desc: 'Key info lives only in people\'s heads' },
  { id: 'one_size_fits_all', label: 'One-Size-Fits-All', icon: '👔', desc: 'Same onboarding for all roles/levels' },
  { id: 'remote_isolation', label: 'Remote Isolation', icon: '🏠', desc: 'Hard to connect with team remotely' },
  { id: 'missing_context', label: 'Missing Context', icon: '🗺️', desc: 'No big picture of system architecture' },
  { id: 'mentor_overload', label: 'Mentor Overload', icon: '😓', desc: 'Senior engineers overwhelmed by questions' },
  { id: 'unclear_milestones', label: 'Unclear Milestones', icon: '🎯', desc: 'No clear ramp-up checkpoints' },
  { id: 'tool_sprawl', label: 'Tool Sprawl', icon: '🔧', desc: 'Too many tools with no clear guide' },
  { id: 'no_feedback_loop', label: 'No Feedback Loop', icon: '🔄', desc: 'No way to measure onboarding effectiveness' },
  { id: 'cultural_gap', label: 'Cultural Gap', icon: '🌍', desc: 'Hard to understand norms and unwritten rules' },
  { id: 'tech_debt_fog', label: 'Tech Debt Fog', icon: '💡', desc: 'Unclear where the landmines are' },
  { id: 'slow_first_pr', label: 'Slow First PR', icon: '⏱️', desc: 'Takes too long to ship first contribution' },
  { id: 'security_blockers', label: 'Security Blockers', icon: '🛡️', desc: 'Compliance requirements slow access' },
  { id: 'no_learning_path', label: 'No Learning Path', icon: '📚', desc: 'No structured progression after week 1' },
];

export const KNOWLEDGE_SOURCES = [
  { id: 'notion', label: 'Notion', icon: '⬜' },
  { id: 'confluence', label: 'Confluence', icon: '🔵' },
  { id: 'github', label: 'GitHub', icon: '🐙' },
  { id: 'slack', label: 'Slack', icon: '💬' },
  { id: 'jira', label: 'Jira', icon: '🔷' },
  { id: 'linear', label: 'Linear', icon: '📐' },
  { id: 'gdrive', label: 'Google Drive', icon: '📁' },
  { id: 'loom', label: 'Loom', icon: '🎥' },
  { id: 'sharepoint', label: 'SharePoint', icon: '🟦' },
  { id: 'readme', label: 'README.io', icon: '📖' },
  { id: 'gitbook', label: 'GitBook', icon: '📗' },
  { id: 'codebase', label: 'Codebase itself', icon: '💻' },
  { id: 'email', label: 'Email threads', icon: '📧' },
  { id: 'meet_notes', label: 'Meeting notes', icon: '📝' },
];

export const INTEGRATION_OPTIONS = [
  { id: 'okta', label: 'Okta SSO', icon: '🔐', category: 'SSO' },
  { id: 'azure_ad', label: 'Azure AD', icon: '🟦', category: 'SSO' },
  { id: 'github', label: 'GitHub', icon: '🐙', category: 'Code' },
  { id: 'gitlab', label: 'GitLab', icon: '🦊', category: 'Code' },
  { id: 'jira', label: 'Jira', icon: '🔷', category: 'PM' },
  { id: 'linear', label: 'Linear', icon: '📐', category: 'PM' },
  { id: 'slack', label: 'Slack', icon: '💬', category: 'Comms' },
  { id: 'teams', label: 'MS Teams', icon: '🟪', category: 'Comms' },
  { id: 'notion', label: 'Notion', icon: '⬜', category: 'Docs' },
  { id: 'confluence', label: 'Confluence', icon: '🔵', category: 'Docs' },
  { id: 'workday', label: 'Workday HRIS', icon: '👥', category: 'HRIS' },
  { id: 'bamboo', label: 'BambooHR', icon: '🎋', category: 'HRIS' },
  { id: 'rippling', label: 'Rippling', icon: '🌊', category: 'HRIS' },
  { id: 'gdrive', label: 'Google Drive', icon: '📁', category: 'Storage' },
  { id: 'sharepoint', label: 'SharePoint', icon: '🟦', category: 'Storage' },
  { id: 'pagerduty', label: 'PagerDuty', icon: '📟', category: 'Ops' },
];

export const OUTCOME_CARDS = [
  { id: 'personalized_paths', label: 'Personalized Paths', icon: '🗺️', desc: 'Role-specific onboarding journeys' },
  { id: 'grounded_ai_qa', label: 'Grounded AI Q&A', icon: '🤖', desc: 'Ask questions, get company-specific answers' },
  { id: 'auto_freshness', label: 'Auto Freshness', icon: '🔄', desc: 'Knowledge that stays up to date automatically' },
  { id: 'analytics', label: 'Onboarding Analytics', icon: '📊', desc: 'Measure ramp time and friction points' },
  { id: 'mentorship_match', label: 'Mentorship Matching', icon: '🤝', desc: 'Connect new hires with the right people' },
  { id: 'continuous_learning', label: 'Continuous Learning', icon: '📚', desc: 'Knowledge that grows with the engineer' },
  { id: 'search', label: 'Unified Search', icon: '🔍', desc: 'One search across all knowledge sources' },
  { id: 'compliance', label: 'Compliance Controls', icon: '🛡️', desc: 'SOC2, GDPR, data governance built-in' },
  { id: 'milestone_tracking', label: 'Milestone Tracking', icon: '🎯', desc: '30/60/90 day progress visibility' },
  { id: 'culture_integration', label: 'Culture Integration', icon: '🌍', desc: 'Social connection and cultural context' },
  { id: 'slack_bot', label: 'Slack Bot', icon: '💬', desc: 'Ask questions right where you work' },
  { id: 'code_intelligence', label: 'Code Intelligence', icon: '💻', desc: 'Understand codebase faster' },
];
