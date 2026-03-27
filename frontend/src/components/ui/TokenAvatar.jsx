import React from 'react';
import './TokenAvatar.css';

export default function TokenAvatar({
  image,
  name,
  size = 'md',
  conditions = []
}) {
  const getInitials = (str) => {
    if (!str) return '?';
    return str
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getColorFromName = (str) => {
    if (!str) return '#666';
    const colors = [
      '#8B0000', // blood
      '#2d5016', // forest
      '#6c757d', // stone
      '#d4af37', // gold
      '#8b4513', // leather
    ];
    const hash = str.charCodeAt(0) + str.charCodeAt(str.length - 1);
    return colors[hash % colors.length];
  };

  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`token-avatar token-${size}`}
      data-testid="token-avatar"
      title={name}
    >
      {image ? (
        <img src={image} alt={name} className="token-image" />
      ) : (
        <div
          className="token-initials"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}

      {conditions && conditions.length > 0 && (
        <div className="token-conditions">
          {conditions.map((condition) => (
            <div
              key={condition}
              className={`condition-${condition.toLowerCase()}`}
              title={condition}
            />
          ))}
        </div>
      )}
    </div>
  );
}
