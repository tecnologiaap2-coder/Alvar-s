import React from 'react';

export const Badge = ({ bg, fg, children }) => {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: bg,
        color: fg,
        border: `1px solid ${fg}20`
      }}
    >
      {children}
    </span>
  );
};
