'use client';

import { Tile } from '@carbon/react';
import { ArrowUp, ArrowDown, Subtract } from '@carbon/icons-react';

interface MetricCardProps {
  title: string;
  score: number;
  previousScore?: number;
  description?: string;
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'score-excellent';
  if (score >= 75) return 'score-good';
  if (score >= 50) return 'score-fair';
  return 'score-poor';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

export default function MetricCard({ title, score, previousScore, description }: MetricCardProps) {
  const scoreClass = getScoreClass(score);
  const scoreLabel = getScoreLabel(score);

  let change: number | undefined;
  let changeIcon: React.ReactNode = null;
  let changeClass = '';

  if (previousScore !== undefined) {
    change = score - previousScore;
    if (change > 0) {
      changeIcon = <ArrowUp size={16} />;
      changeClass = 'rank-up';
    } else if (change < 0) {
      changeIcon = <ArrowDown size={16} />;
      changeClass = 'rank-down';
    } else {
      changeIcon = <Subtract size={16} />;
      changeClass = 'rank-same';
    }
  }

  return (
    <Tile className="metric-card">
      <div style={{ marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-secondary)' }}>
          {title}
        </h4>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <span className={scoreClass} style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: '1rem', color: 'var(--cds-text-secondary)' }}>
          / 100
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <span className={scoreClass} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
          {scoreLabel}
        </span>
        {change !== undefined && (
          <span className={changeClass} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
            {changeIcon}
            {Math.abs(change)}
          </span>
        )}
      </div>
      {description && (
        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
          {description}
        </p>
      )}
    </Tile>
  );
}
