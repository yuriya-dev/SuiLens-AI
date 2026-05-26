'use client';

import React from 'react';

type MarkdownTextProps = {
  content: string;
  containerClassName?: string;
  paragraphClassName?: string;
  listItemClassName?: string;
  bulletClassName?: string;
  strongClassName?: string;
  codeClassName?: string;
  linkClassName?: string;
};

const MARKDOWN_SEGMENT_REGEX = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;

function MarkdownText({
  content,
  containerClassName = 'space-y-2',
  paragraphClassName = 'min-h-[1.1rem] leading-relaxed',
  listItemClassName = 'flex gap-2 items-start pl-2',
  bulletClassName = 'text-cyan-glow shrink-0 mt-1.5 text-[8px]',
  strongClassName = 'font-bold text-cyan-glow',
  codeClassName = 'font-mono bg-[#050816] px-1.5 py-0.5 rounded text-cyan-glow border border-white/5 text-[10px] tracking-wide',
  linkClassName = 'text-cyan-glow underline hover:text-white transition-colors'
}: MarkdownTextProps) {
  const lines = content.split('\n');

  return (
    <div className={containerClassName}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const isListItem =
          trimmed.startsWith('•') ||
          trimmed.startsWith('-') ||
          (trimmed.startsWith('*') && !trimmed.startsWith('**'));
        const cleanLine = isListItem ? trimmed.substring(1).trim() : line;
        const segments = cleanLine.split(MARKDOWN_SEGMENT_REGEX);

        const processedSegments = segments.map((segment, segmentIndex) => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            return (
              <strong key={segmentIndex} className={strongClassName}>
                {segment.substring(2, segment.length - 2)}
              </strong>
            );
          }

          if (segment.startsWith('`') && segment.endsWith('`')) {
            return (
              <code key={segmentIndex} className={codeClassName}>
                {segment.substring(1, segment.length - 1)}
              </code>
            );
          }

          if (segment.startsWith('[') && segment.includes('](') && segment.endsWith(')')) {
            const label = segment.substring(1, segment.indexOf(']('));
            const url = segment.substring(segment.indexOf('](') + 2, segment.length - 1);
            return (
              <a
                key={segmentIndex}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName}
              >
                {label}
              </a>
            );
          }

          return <span key={segmentIndex}>{segment}</span>;
        });

        if (isListItem) {
          return (
            <div key={idx} className={listItemClassName}>
              <span className={bulletClassName}>•</span>
              <div className="flex-1 leading-relaxed">{processedSegments}</div>
            </div>
          );
        }

        return (
          <p key={idx} className={paragraphClassName}>
            {processedSegments}
          </p>
        );
      })}
    </div>
  );
}

export default React.memo(MarkdownText);