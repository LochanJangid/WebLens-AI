import React from 'react';
import { cn, getSeverityStyles, getCategoryMeta, getClassificationMeta } from '@/lib/utils';
import { AuditCategory, FindingClassification, FindingSeverity } from '@/types/api';

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const meta = getSeverityStyles(severity);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border uppercase tracking-wider',
        meta.badge
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: AuditCategory | string }) {
  const meta = getCategoryMeta(category);
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border capitalize',
        meta.color
      )}
    >
      {meta.label}
    </span>
  );
}

export function ClassificationBadge({
  classification,
}: {
  classification: FindingClassification | string;
}) {
  const meta = getClassificationMeta(classification);
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        meta.badge
      )}
      title={meta.description}
    >
      {meta.label}
    </span>
  );
}
