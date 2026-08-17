import React from 'react';

const URL_REGEX = /(https?:\/\/[^\s<>"')\]]+)/g;

export function LinkifiedText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[0];
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8C7364] underline underline-offset-2 decoration-[#8C7364]/40 hover:text-[#6E6157] hover:decoration-[#6E6157]/60 transition-colors break-all"
      >
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
