import React from 'react';
import './StatBlock.css';

export default function StatBlock({
  name,
  value,
  proficient = false
}) {
  const modifier = Math.floor((value - 10) / 2);
  const sign = modifier >= 0 ? '+' : '';

  return (
    <div className="stat-block" data-testid={`stat-block-${name.toLowerCase()}`}>
      <div className="stat-name">{name}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-modifier ${proficient ? 'proficient' : ''}`}>
        {sign}{modifier}
      </div>
    </div>
  );
}
