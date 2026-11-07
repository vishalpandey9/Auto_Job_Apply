/**
 * ATS (Applicant Tracking System) Scoring and Keyword Optimization Engine
 */

export interface ATSAnalysisResult {
  overallScore: number; // 0 - 100
  breakdown: {
    keywordMatchScore: number; // 0 - 100
    actionVerbsScore: number;  // 0 - 100
    quantifiableMetricsScore: number; // 0 - 100
    sectionStructureScore: number;    // 0 - 100
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  actionVerbRecommendations: { weakWord: string; suggestions: string[] }[];
  missingSections: string[];
  quantifiableBulletCount: number;
  totalBulletCount: number;
  summary: string;
}

const COMMON_TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'react.js', 'node.js', 'nodejs', 'express',
  'python', 'docker', 'kubernetes', 'aws', 'cloud', 'postgresql', 'postgres', 'sql',
  'mongodb', 'graphql', 'rest api', 'ci/cd', 'git', 'microservices', 'tailwind',
  'redux', 'next.js', 'nextjs', 'system design', 'agile', 'scrum', 'unit testing',
  'jest', 'playwright', 'cypress', 'linux', 'devops', 'performance optimization',
  'api design', 'redis', 'kafka', 'gcp', 'azure', 'data structures', 'algorithms'
];

const WEAK_VERBS: Record<string, string[]> = {
  'worked on': ['Engineered', 'Architected', 'Spearheaded', 'Executed'],
  'responsible for': ['Orchestrated', 'Governed', 'Directed', 'Championed'],
  'helped with': ['Collaborated on', 'Accelerated', 'Facilitated', 'Co-engineered'],
  'did': ['Implemented', 'Produced', 'Executed', 'Delivered'],
  'handled': ['Managed', 'Resolved', 'Streamlined', 'Supervised'],
  'made': ['Engineered', 'Constructed', 'Designed', 'Synthesized'],
  'assisted': ['Partnered', 'Reinforced', 'Bolstered', 'Co-authored']
};

const STRONG_ATS_VERBS = [
  'accelerated', 'achieved', 'analyzed', 'architected', 'automated', 'championed',
  'collaborated', 'consolidated', 'constructed', 'decreased', 'delivered', 'designed',
  'developed', 'directed', 'engineered', 'enhanced', 'established', 'executed',
  'expanded', 'expedited', 'facilitated', 'formulated', 'generated', 'governed',
  'implemented', 'improved', 'increased', 'initiated', 'integrated', 'launched',
  'lead', 'led', 'leveraged', 'managed', 'maximized', 'migrated', 'modernized',
  'optimized', 'orchestrated', 'overhauled', 'pioneered', 'reduced', 'refactored',
  'resolved', 'revitalized', 'scaled', 'spearheaded', 'standardized', 'streamlined',
  'surpassed', 'transformed', 'upgraded'
];

const ESSENTIAL_SECTIONS = [
  { name: 'Summary or Profile', patterns: [/summary/i, /profile/i, /objective/i, /about/i] },
  { name: 'Experience', patterns: [/experience/i, /employment/i, /work history/i] },
  { name: 'Skills', patterns: [/skills/i, /technical skills/i, /competencies/i] },
  { name: 'Education', patterns: [/education/i, /academic/i, /degree/i] }
];

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const normalized = text.toLowerCase();
  const matched = new Set<string>();

  for (const kw of COMMON_TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalized)) {
      matched.add(kw);
    }
  }

  const candidateWords = text.match(/\b[A-Za-z0-9+#.-]{3,20}\b/g) || [];
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'you', 'will', 'that', 'our', 'team', 'work', 'experience',
    'years', 'role', 'company', 'must', 'have', 'are', 'this', 'from', 'about', 'join', 'opportunity',
    'looking', 'ideal', 'candidate', 'strong', 'ability', 'skills', 'responsibilities', 'requirements',
    'benefits', 'equal', 'employment', 'status', 'working', 'apply', 'applicant'
  ]);

  for (const word of candidateWords) {
    const lower = word.toLowerCase();
    if (lower.length > 3 && !stopWords.has(lower) && COMMON_TECH_KEYWORDS.includes(lower)) {
      matched.add(lower);
    }
  }

  return Array.from(matched);
}

export function analyzeATS(resumeText: string, jobDescription: string): ATSAnalysisResult {
  const jdKeywords = extractKeywords(jobDescription);
  const normalizedResume = (resumeText || '').toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdKeywords) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalizedResume)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordMatchScore = jdKeywords.length > 0
    ? Math.round((matchedKeywords.length / jdKeywords.length) * 100)
    : 80;

  const lines = (resumeText || '').split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 10);
  const bullets = lines.filter(l => /^[•\-\*]/.test(l) || /^\d+\./.test(l));
  const bulletsToCheck = bullets.length > 0 ? bullets : lines;

  let strongVerbCount = 0;
  const weakVerbsFound: { weakWord: string; suggestions: string[] }[] = [];

  for (const bullet of bulletsToCheck) {
    const cleaned = bullet.replace(/^[•\-\*\d\.\s]+/, '').trim();
    const firstWord = (cleaned.split(/\s+/)[0] || '').toLowerCase();
    if (STRONG_ATS_VERBS.includes(firstWord)) {
      strongVerbCount++;
    }
    for (const [weak, suggestions] of Object.entries(WEAK_VERBS)) {
      if (cleaned.toLowerCase().includes(weak)) {
        if (!weakVerbsFound.some(w => w.weakWord === weak)) {
          weakVerbsFound.push({ weakWord: weak, suggestions });
        }
      }
    }
  }

  const actionVerbsScore = bulletsToCheck.length > 0
    ? Math.min(100, Math.round((strongVerbCount / Math.max(1, bulletsToCheck.length)) * 130))
    : 60;

  const metricRegex = /\b(\d+(\.\d+)?%|\$\d+[kmb]?|\d+x|\d{2,}\+?|\d+\s*(users|customers|requests|seconds|ms|queries|records|projects|million|billion|thousand))\b/i;
  let quantifiableBulletCount = 0;
  for (const bullet of bulletsToCheck) {
    if (metricRegex.test(bullet)) {
      quantifiableBulletCount++;
    }
  }

  const quantifiableMetricsScore = bulletsToCheck.length > 0
    ? Math.min(100, Math.round((quantifiableBulletCount / Math.max(1, bulletsToCheck.length)) * 140))
    : 50;

  const missingSections: string[] = [];
  for (const section of ESSENTIAL_SECTIONS) {
    const hasSection = section.patterns.some(p => p.test(resumeText));
    if (!hasSection) {
      missingSections.push(section.name);
    }
  }
  const sectionStructureScore = Math.round(
    ((ESSENTIAL_SECTIONS.length - missingSections.length) / ESSENTIAL_SECTIONS.length) * 100
  );

  const overallScore = Math.round(
    keywordMatchScore * 0.40 +
    actionVerbsScore * 0.20 +
    quantifiableMetricsScore * 0.25 +
    sectionStructureScore * 0.15
  );

  let summary = `Your resume has a ${overallScore}% ATS score. `;
  if (missingKeywords.length > 0) {
    summary += `Missing ${missingKeywords.length} key terms from the job post. `;
  } else {
    summary += `Excellent keyword coverage for this role. `;
  }
  if (quantifiableBulletCount < 3) {
    summary += `Add more measurable achievements with percentages or numbers.`;
  }

  return {
    overallScore,
    breakdown: {
      keywordMatchScore,
      actionVerbsScore,
      quantifiableMetricsScore,
      sectionStructureScore
    },
    matchedKeywords,
    missingKeywords,
    actionVerbRecommendations: weakVerbsFound,
    missingSections,
    quantifiableBulletCount,
    totalBulletCount: bulletsToCheck.length,
    summary
  };
}
