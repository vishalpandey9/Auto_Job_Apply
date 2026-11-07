import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeATS, extractKeywords } from './atsScorer.ts';
import {
  autoAnswerQuestion,
  filterEligibleJobs,
  calculateSprintMetrics,
  DEFAULT_PREFERENCES,
  type JobPosting
} from './autoApplyEngine.ts';

test('extractKeywords pulls expected technical tokens', () => {
  const jd = 'Looking for a Senior TypeScript and React developer with PostgreSQL and AWS experience.';
  const keywords = extractKeywords(jd);
  assert.ok(keywords.includes('typescript'));
  assert.ok(keywords.includes('react'));
  assert.ok(keywords.includes('postgresql'));
  assert.ok(keywords.includes('aws'));
});

test('analyzeATS evaluates resume with keyword coverage, verbs, and metrics', () => {
  const resume = `
    Alex Morgan
    alex@example.com

    Summary
    Experienced Senior Full Stack Engineer with 6+ years building cloud-native web apps.

    Skills
    TypeScript, React, Node.js, AWS, PostgreSQL, Docker, CI/CD, GraphQL

    Experience
    Senior Engineer | Acme Corp (2021 - Present)
    • Architected high-throughput microservices using TypeScript and Node.js serving 500,000+ daily active users.
    • Optimized PostgreSQL query execution latency by 42% across 10 million transactions.
    • Orchestrated automated CI/CD deployment pipelines on AWS reducing release cycle time by 60%.

    Education
    B.S. in Computer Science | UC Berkeley
  `;

  const jd = `
    Role: Senior Software Engineer
    Requirements:
    - 5+ years with TypeScript and React
    - Strong experience in Node.js and PostgreSQL
    - Hands-on cloud with AWS and Docker
    - Microservices and CI/CD pipelines
  `;

  const result = analyzeATS(resume, jd);
  assert.ok(result.overallScore >= 80, `Expected score >= 80, got ${result.overallScore}`);
  assert.ok(result.matchedKeywords.includes('typescript'));
  assert.ok(result.matchedKeywords.includes('react'));
  assert.equal(result.missingSections.length, 0);
  assert.ok(result.quantifiableBulletCount >= 2);
});

test('autoAnswerQuestion resolves sponsorship and skill years accurately', () => {
  const sponsorshipQ = 'Will you now or in the future require visa sponsorship?';
  const ans1 = autoAnswerQuestion(sponsorshipQ, DEFAULT_PREFERENCES);
  assert.equal(ans1.answer, 'No');
  assert.ok(ans1.confidence >= 90);

  const reactYearsQ = 'How many years of work experience do you have with React?';
  const ans2 = autoAnswerQuestion(reactYearsQ, DEFAULT_PREFERENCES);
  assert.equal(ans2.answer, '6');
  assert.ok(ans2.confidence >= 90);

  const salaryQ = 'What is your desired salary range?';
  const ans3 = autoAnswerQuestion(salaryQ, DEFAULT_PREFERENCES);
  assert.ok(ans3.answer.includes('165,000'));
});

test('filterEligibleJobs respects blacklist and workMode', () => {
  const jobs: JobPosting[] = [
    {
      id: '1',
      title: 'Senior Frontend',
      company: 'GoodTech Corp',
      location: 'Remote',
      workMode: 'Remote',
      postedDate: '2026-11-05',
      easyApply: true,
      source: 'LinkedIn',
      description: 'React developer needed',
      requiredSkills: ['react', 'typescript']
    },
    {
      id: '2',
      title: 'DevOps Engineer',
      company: 'BadCompany Inc',
      location: 'New York, NY',
      workMode: 'Onsite',
      postedDate: '2026-11-04',
      easyApply: true,
      source: 'LinkedIn',
      description: 'AWS expert',
      requiredSkills: ['aws', 'docker']
    }
  ];

  const eligible = filterEligibleJobs(jobs, DEFAULT_PREFERENCES);
  assert.equal(eligible.length, 1);
  assert.equal(eligible[0].id, '1');
});

test('calculateSprintMetrics calculates time and completion state', () => {
  const start = Date.now() - 5 * 60 * 1000;
  const metrics = calculateSprintMetrics(start, 15, 6, 10);
  assert.equal(metrics.progressPercent, 60);
  assert.equal(metrics.isComplete, false);
  assert.ok(metrics.formattedTimeRemaining.startsWith('09:') || metrics.formattedTimeRemaining.startsWith('10:'));
});
