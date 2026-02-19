const isScoped = process.env.CSS_SCOPE === 'true';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
    ...(isScoped && {
      'postcss-prefix-selector': {
        prefix: '.auth0',
        transform(prefix, selector) {
          if (selector.match(/^(html|body)/)) return selector;
          if (selector.match(/^(:root|\.dark)/)) {
            return `${selector}, ${prefix}${selector.replace(':root', '')}`;
          }
          return `${prefix} ${selector}`;
        },
      },
    }),
  },
};
