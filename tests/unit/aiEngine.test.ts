import { describe, it, expect } from 'vitest';
import { processAIQuery } from '@/lib/aiEngine';

describe('Embedded First-Person AI Semantic Response Engine', () => {
  it('should return BizBuddy case study and 89% cost reduction on cost query', () => {
    const res = processAIQuery('How did you reduce LLM costs?');
    expect(res.answer).toContain('89%');
    expect(res.answer).toContain('BizBuddy');
    expect(res.answer).toContain('Qwen 3.6 Flash');
    expect(res.referencedTrack?.id).toBe('work-bizbuddy');
  });

  it('should return Konvex FYP details on fyp/ecommerce query', () => {
    const res = processAIQuery('Tell me about your final year project Konvex');
    expect(res.answer).toContain('Konvex');
    expect(res.answer).toContain('Khawir Mahmood');
    expect(res.answer).toContain('LangGraph');
    expect(res.referencedTrack?.id).toBe('project-konvex');
  });

  it('should return Horquva dependency graph details on enterprise/blast radius query', () => {
    const res = processAIQuery('What did you build at Horquva?');
    expect(res.answer).toContain('Horquva LLC');
    expect(res.answer).toContain('58 tables');
    expect(res.answer).toContain('blast-radius');
    expect(res.referencedTrack?.id).toBe('work-horquva');
  });

  it('should return Medical Report Analyzer metrics on chest x-ray / yolo query', () => {
    const res = processAIQuery('Tell me about medical report analyzer and yolo');
    expect(res.answer).toContain('14,000+');
    expect(res.answer).toContain('0.99 mAP@50');
    expect(res.referencedTrack?.id).toBe('project-medical-report');
  });

  it('should return Code Connect 1st place hackathon details on hackathon query', () => {
    const res = processAIQuery('Did you win any hackathon?');
    expect(res.answer).toContain('Code Connect 2025');
    expect(res.answer).toContain('1st Place');
    expect(res.referencedTrack?.id).toBe('project-code-connect');
  });

  it('should return NUST GPA, honors, and coursework on education/gpa query', () => {
    const res = processAIQuery('What is your GPA and education background?');
    expect(res.answer).toContain('3.59 / 4.0');
    expect(res.answer).toContain('NTF Scholarship');
    expect(res.referencedTrack?.id).toBe('edu-nust');
  });

  it('should return faculty recommender details on professor/recommender query', () => {
    const res = processAIQuery('Who are your faculty recommenders?');
    expect(res.answer).toContain('Dr. Saeed Murtaza');
    expect(res.answer).toContain('Khawir Mahmood');
    expect(res.answer).toContain('top 5%');
  });

  it('should return contact details and booking information on hire/contact query', () => {
    const res = processAIQuery('How can I contact or hire you for remote roles?');
    expect(res.answer).toContain('m.ibrahimshaikh357@gmail.com');
    expect(res.answer).toContain('0313-2228891');
    expect(res.answer).toContain('Recruiter Mix');
  });
});
