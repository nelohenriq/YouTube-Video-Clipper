import React from 'react';

export const RedditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12a9.7 9.7 0 0 0 5.4 8.54l-1.4 3.46a.5.5 0 0 0 .8.6l3.46-1.4A9.7 9.7 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    <path d="M16 11.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
    <path d="M8.5 11a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
    <path d="M16 16c-1.5 1-4.5 1-6 0" />
    <path d="m14.5 2.5-3 3" />
  </svg>
);
