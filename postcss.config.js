export default {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {},
    'postcss-custom-properties': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
}
