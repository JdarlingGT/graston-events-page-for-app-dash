import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'public', 'mock-data');

interface OutreachTemplate {
  id: string;
  name: string;
  category: 'cold_outreach' | 'follow_up' | 'nurture' | 'upsell' | 'retention';
  channel: 'email' | 'sms' | 'linkedin' | 'phone_script';
  subject?: string;
  content: string;
  personalizationSlots: string[];
  complianceFlags: string[];
  tone: 'professional' | 'friendly' | 'urgent' | 'educational';
  targetAudience: string;
  expectedResponse: string;
  createdAt: string;
  updatedAt: string;
  usage: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    converted: number;
  };
}

interface PersonalizationData {
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  location?: string;
  courseHistory?: string[];
  engagementScore?: number;
  lastInteraction?: string;
  preferredCourseType?: string;
  priceRange?: string;
  nextLevelCourse?: string;
  mutualConnections?: string[];
  recentActivity?: string;
  painPoints?: string[];
  goals?: string[];
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'legal' | 'ethical' | 'platform' | 'brand';
  severity: 'error' | 'warning' | 'info';
  pattern?: string;
  keywords?: string[];
  maxLength?: number;
  requiredElements?: string[];
  forbiddenElements?: string[];
}

interface OutreachRequest {
  templateId: string;
  recipients: Array<{
    email: string;
    personalizationData: PersonalizationData;
  }>;
  customizations?: {
    subject?: string;
    additionalContent?: string;
    callToAction?: string;
  };
  scheduledSend?: string;
  testMode?: boolean;
}

interface GeneratedOutreach {
  recipient: string;
  subject: string;
  content: string;
  personalizationApplied: string[];
  complianceChecks: Array<{
    rule: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
  }>;
  readabilityScore: number;
  estimatedEngagement: number;
}

interface OutreachResults {
  campaignId: string;
  totalRecipients: number;
  generated: GeneratedOutreach[];
  complianceSummary: {
    passed: number;
    warnings: number;
    failed: number;
  };
  estimatedMetrics: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    responseRate: number;
  };
  recommendations: string[];
  generatedAt: string;
}

// Mock templates
const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'cold_intro_essential',
    name: 'Cold Introduction - Essential Course',
    category: 'cold_outreach',
    channel: 'email',
    subject: 'Transform Your Practice with {{preferredCourseType}} Training in {{location}}',
    content: `Hi {{firstName}},

I hope this email finds you well. I'm reaching out because I noticed you're a {{title}} in {{location}}, and I wanted to share an opportunity that could significantly impact your practice.

We're bringing our {{preferredCourseType}} training to {{location}} on [DATE], and based on your background, I believe this could be exactly what you're looking for to {{primaryGoal}}.

Here's what makes this different:
• Hands-on training with immediate application
• Small class sizes for personalized attention
• Proven techniques that {{specificBenefit}}
• Certificate of completion for continuing education credits

{{mutualConnection}} mentioned you might be interested in advancing your skills in this area. Would you be open to a brief 10-minute call to discuss how this training could benefit your practice?

Best regards,
[SENDER_NAME]

P.S. Early bird pricing ends in 7 days - I'd hate for you to miss out on the savings.`,
    personalizationSlots: [
      'firstName', 'title', 'location', 'preferredCourseType', 
      'primaryGoal', 'specificBenefit', 'mutualConnection'
    ],
    complianceFlags: ['can_spam', 'gdpr', 'professional_tone'],
    tone: 'professional',
    targetAudience: 'Healthcare professionals, new prospects',
    expectedResponse: 'Schedule discovery call or request more information',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    usage: {
      sent: 245,
      opened: 147,
      clicked: 32,
      replied: 18,
      converted: 8,
    },
  },
  {
    id: 'follow_up_engaged',
    name: 'Follow-up - Engaged Prospect',
    category: 'follow_up',
    channel: 'email',
    subject: 'Quick follow-up on {{preferredCourseType}} training',
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about the {{preferredCourseType}} training coming to {{location}}.

I noticed you {{recentActivity}}, which tells me you're serious about advancing your skills. That's exactly the kind of commitment that leads to success in our programs.

Since we last connected, {{timeBasedUpdate}}. I thought you'd want to know because it directly relates to what we discussed about {{painPoint}}.

I have just 3 spots left in the {{location}} session, and I'd love to reserve one for you. 

Would Thursday at 2 PM or Friday at 10 AM work better for a quick 15-minute call to finalize the details?

Looking forward to hearing from you,
[SENDER_NAME]

P.S. {{urgencyElement}}`,
    personalizationSlots: [
      'firstName', 'preferredCourseType', 'location', 'recentActivity',
      'timeBasedUpdate', 'painPoint', 'urgencyElement'
    ],
    complianceFlags: ['follow_up_limit', 'truthful_urgency'],
    tone: 'friendly',
    targetAudience: 'Prospects who have shown engagement',
    expectedResponse: 'Schedule call or direct enrollment',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    usage: {
      sent: 156,
      opened: 98,
      clicked: 28,
      replied: 22,
      converted: 12,
    },
  },
  {
    id: 'upsell_advanced',
    name: 'Upsell - Advanced Course',
    category: 'upsell',
    channel: 'email',
    subject: 'Ready for the next level? {{nextLevelCourse}} is calling your name',
    content: `Hi {{firstName}},

Congratulations again on completing the {{completedCourse}} training! Your dedication to continuous learning is inspiring.

I've been thinking about our conversation after class where you mentioned {{specificGoal}}. Based on your progress and the questions you asked, I believe you're ready for {{nextLevelCourse}}.

Here's why I think this is perfect timing for you:
• You've mastered the fundamentals (your skills assessment scored {{skillsScore}}/100)
• Your {{specificStrength}} puts you ahead of most students
• The advanced techniques will directly address {{advancedNeed}}

The next {{nextLevelCourse}} session is in {{location}} on [DATE]. As a graduate of our Essential program, you qualify for our alumni discount of $100 off.

I only have 2 spots left, and I'd love to see you take this next step. 

Can we schedule a brief call this week to discuss your goals and see if this is the right fit?

Proud of your progress,
[SENDER_NAME]

P.S. Your classmate {{peerReference}} just enrolled and is excited to continue learning alongside familiar faces.`,
    personalizationSlots: [
      'firstName', 'completedCourse', 'specificGoal', 'nextLevelCourse',
      'skillsScore', 'specificStrength', 'advancedNeed', 'location', 'peerReference'
    ],
    complianceFlags: ['truthful_claims', 'alumni_verification'],
    tone: 'educational',
    targetAudience: 'Previous course graduates',
    expectedResponse: 'Enroll in advanced course',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    usage: {
      sent: 89,
      opened: 67,
      clicked: 23,
      replied: 15,
      converted: 11,
    },
  },
];

// Compliance rules
const COMPLIANCE_RULES: ComplianceRule[] = [
  {
    id: 'can_spam',
    name: 'CAN-SPAM Compliance',
    description: 'Must include unsubscribe link and sender identification',
    category: 'legal',
    severity: 'error',
    requiredElements: ['unsubscribe', 'sender_address'],
  },
  {
    id: 'gdpr',
    name: 'GDPR Compliance',
    description: 'Must have lawful basis for processing personal data',
    category: 'legal',
    severity: 'error',
    requiredElements: ['consent_basis'],
  },
  {
    id: 'professional_tone',
    name: 'Professional Communication',
    description: 'Maintain professional tone and avoid overly casual language',
    category: 'brand',
    severity: 'warning',
    forbiddenElements: ['hey', 'sup', 'lol', 'omg'],
  },
  {
    id: 'truthful_urgency',
    name: 'Truthful Urgency Claims',
    description: 'Urgency claims must be factual and verifiable',
    category: 'ethical',
    severity: 'error',
    keywords: ['limited time', 'only', 'spots left', 'expires'],
  },
  {
    id: 'follow_up_limit',
    name: 'Follow-up Frequency Limit',
    description: 'Respect follow-up frequency preferences',
    category: 'ethical',
    severity: 'warning',
  },
  {
    id: 'subject_length',
    name: 'Subject Line Length',
    description: 'Subject lines should be 50 characters or less for optimal delivery',
    category: 'platform',
    severity: 'warning',
    maxLength: 50,
  },
];

/**
 * Apply personalization to template content
 */
function personalizeContent(template: string, data: PersonalizationData): string {
  let personalized = template;
  
  // Replace personalization slots
  Object.entries(data).forEach(([key, value]) => {
    if (value) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      personalized = personalized.replace(regex, String(value));
    }
  });
  
  // Handle conditional content
  personalized = personalized.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
    return data[condition as keyof PersonalizationData] ? content : '';
  });
  
  // Remove unfilled slots
  personalized = personalized.replace(/{{[^}]+}}/g, '[PERSONALIZATION_NEEDED]');
  
  return personalized;
}

/**
 * Check compliance rules
 */
function checkCompliance(content: string, subject: string, rules: ComplianceRule[]) {
  const checks = rules.map(rule => {
    let status: 'pass' | 'warning' | 'fail' = 'pass';
    let message = `${rule.name}: Compliant`;
    
    const fullText = `${subject} ${content}`.toLowerCase();
    
    switch (rule.id) {
      case 'can_spam':
        if (!content.includes('unsubscribe') || !content.includes('[SENDER_ADDRESS]')) {
          status = 'fail';
          message = 'Missing required unsubscribe link or sender address';
        }
        break;
        
      case 'gdpr':
        if (!content.includes('consent') && !content.includes('legitimate interest')) {
          status = 'warning';
          message = 'Consider adding GDPR compliance statement';
        }
        break;
        
      case 'professional_tone':
        const casualWords = rule.forbiddenElements?.filter(word => 
          fullText.includes(word.toLowerCase())
        ) || [];
        if (casualWords.length > 0) {
          status = 'warning';
          message = `Casual language detected: ${casualWords.join(', ')}`;
        }
        break;
        
      case 'truthful_urgency':
        const urgencyWords = rule.keywords?.filter(word => 
          fullText.includes(word.toLowerCase())
        ) || [];
        if (urgencyWords.length > 0) {
          status = 'warning';
          message = `Verify urgency claims are truthful: ${urgencyWords.join(', ')}`;
        }
        break;
        
      case 'subject_length':
        if (subject.length > (rule.maxLength || 50)) {
          status = 'warning';
          message = `Subject line too long: ${subject.length} characters`;
        }
        break;
    }
    
    return {
      rule: rule.name,
      status,
      message,
    };
  });
  
  return checks;
}

/**
 * Calculate readability score (simplified Flesch Reading Ease)
 */
function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).length - 1;
  const words = text.split(/\s+/).length;
  const syllables = text.split(/[aeiouAEIOU]/).length - 1;
  
  if (sentences === 0 || words === 0) return 0;
  
  const avgWordsPerSentence = words / sentences;
  const avgSyllablesPerWord = syllables / words;
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Estimate engagement based on template performance and personalization
 */
function estimateEngagement(
  template: OutreachTemplate, 
  personalizationApplied: string[],
  complianceScore: number
): number {
  const baseEngagement = template.usage.opened / Math.max(template.usage.sent, 1) * 100;
  const personalizationBonus = personalizationApplied.length * 5;
  const complianceBonus = complianceScore > 80 ? 10 : 0;
  
  return Math.min(100, Math.round(baseEngagement + personalizationBonus + complianceBonus));
}

/**
 * GET /api/sales/outreach
 * Get available outreach templates and compliance rules
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const channel = url.searchParams.get('channel');
    
    let filteredTemplates = OUTREACH_TEMPLATES;
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    
    if (channel) {
      filteredTemplates = filteredTemplates.filter(t => t.channel === channel);
    }
    
    return NextResponse.json({
      templates: filteredTemplates,
      complianceRules: COMPLIANCE_RULES,
      categories: ['cold_outreach', 'follow_up', 'nurture', 'upsell', 'retention'],
      channels: ['email', 'sms', 'linkedin', 'phone_script'],
    });
  } catch (error) {
    console.error('Error fetching outreach templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outreach templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales/outreach
 * Generate personalized outreach messages
 */
export async function POST(request: NextRequest) {
  try {
    const outreachRequest: OutreachRequest = await request.json();
    
    if (!outreachRequest.templateId || !outreachRequest.recipients?.length) {
      return NextResponse.json(
        { error: 'Template ID and recipients are required' },
        { status: 400 }
      );
    }
    
    const template = OUTREACH_TEMPLATES.find(t => t.id === outreachRequest.templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generated: GeneratedOutreach[] = [];
    
    for (const recipient of outreachRequest.recipients) {
      // Personalize subject and content
      const personalizedSubject = personalizeContent(
        outreachRequest.customizations?.subject || template.subject || '',
        recipient.personalizationData
      );
      
      let personalizedContent = personalizeContent(template.content, recipient.personalizationData);
      
      // Add custom content if provided
      if (outreachRequest.customizations?.additionalContent) {
        personalizedContent += '\n\n' + outreachRequest.customizations.additionalContent;
      }
      
      // Add custom CTA if provided
      if (outreachRequest.customizations?.callToAction) {
        personalizedContent = personalizedContent.replace(
          /Best regards,/g,
          `${outreachRequest.customizations.callToAction}\n\nBest regards,`
        );
      }
      
      // Check which personalization slots were filled
      const personalizationApplied = template.personalizationSlots.filter(slot => 
        recipient.personalizationData[slot as keyof PersonalizationData]
      );
      
      // Run compliance checks
      const complianceChecks = checkCompliance(personalizedContent, personalizedSubject, COMPLIANCE_RULES);
      const complianceScore = complianceChecks.filter(c => c.status === 'pass').length / complianceChecks.length * 100;
      
      // Calculate readability
      const readabilityScore = calculateReadabilityScore(personalizedContent);
      
      // Estimate engagement
      const estimatedEngagement = estimateEngagement(template, personalizationApplied, complianceScore);
      
      generated.push({
        recipient: recipient.email,
        subject: personalizedSubject,
        content: personalizedContent,
        personalizationApplied,
        complianceChecks,
        readabilityScore,
        estimatedEngagement,
      });
    }
    
    // Calculate compliance summary
    const allChecks = generated.flatMap(g => g.complianceChecks);
    const complianceSummary = {
      passed: allChecks.filter(c => c.status === 'pass').length,
      warnings: allChecks.filter(c => c.status === 'warning').length,
      failed: allChecks.filter(c => c.status === 'fail').length,
    };
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (complianceSummary.failed > 0) {
      recommendations.push('Address compliance failures before sending');
    }
    
    const avgPersonalization = generated.reduce((sum, g) => sum + g.personalizationApplied.length, 0) / generated.length;
    if (avgPersonalization < 3) {
      recommendations.push('Add more personalization to improve engagement');
    }
    
    const avgReadability = generated.reduce((sum, g) => sum + g.readabilityScore, 0) / generated.length;
    if (avgReadability < 60) {
      recommendations.push('Simplify language to improve readability');
    }
    
    if (outreachRequest.testMode) {
      recommendations.push('Test mode enabled - messages will not be sent');
    }
    
    const results: OutreachResults = {
      campaignId,
      totalRecipients: generated.length,
      generated,
      complianceSummary,
      estimatedMetrics: {
        deliveryRate: 95,
        openRate: Math.round(generated.reduce((sum, g) => sum + g.estimatedEngagement, 0) / generated.length),
        clickRate: 15,
        responseRate: 8,
      },
      recommendations,
      generatedAt: new Date().toISOString(),
    };
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error generating outreach messages:', error);
    return NextResponse.json(
      { error: 'Failed to generate outreach messages' },
      { status: 500 }
    );
  }
}