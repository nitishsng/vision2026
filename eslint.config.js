import next from 'next/eslint';

export default [
  {
    // Apply Next.js recommended configuration
    ...next.configs.recommended,
  },
  {
    // Apply Next.js core web vitals configuration
    ...next.configs['core-web-vitals'],
  },
];