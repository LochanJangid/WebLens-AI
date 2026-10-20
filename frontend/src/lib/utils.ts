import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function isValidUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSeverityStyles(severity: string) {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-300',
        dot: 'bg-rose-500',
        label: 'Critical',
      };
    case 'high':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        badge: 'bg-orange-100 text-orange-800 border-orange-300',
        dot: 'bg-orange-500',
        label: 'High',
      };
    case 'medium':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: 'Medium',
      };
    case 'low':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
        label: 'Low',
      };
    case 'info':
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        badge: 'bg-slate-100 text-slate-800 border-slate-300',
        dot: 'bg-slate-400',
        label: 'Info',
      };
  }
}

export function getClassificationMeta(classification: string) {
  switch (classification) {
    case 'verified_defect':
      return {
        label: 'Verified Defect',
        description: 'Confirmed by deterministic DOM or audit rules.',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    case 'potential_issue':
      return {
        label: 'Potential Issue',
        description: 'Flagged by Lighthouse; needs context-specific review.',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'recommendation':
      return {
        label: 'Recommendation',
        description: 'Best practice or optimization opportunity.',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'needs_review':
      return {
        label: 'Needs Human Review',
        description: 'Requires human judgment to evaluate appropriateness.',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    default:
      return {
        label: classification.replace('_', ' '),
        description: 'Audit finding.',
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
}

export function getCategoryMeta(category: string) {
  switch (category) {
    case 'performance':
      return { label: 'Performance', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    case 'accessibility':
      return { label: 'Accessibility', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    case 'seo':
      return { label: 'SEO', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    case 'content':
      return { label: 'Content', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    case 'ux':
      return { label: 'User Experience', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    case 'best-practices':
      return { label: 'Best Practices', color: 'text-teal-600 bg-teal-50 border-teal-200' };
    default:
      return { label: category, color: 'text-slate-600 bg-slate-50 border-slate-200' };
  }
}
