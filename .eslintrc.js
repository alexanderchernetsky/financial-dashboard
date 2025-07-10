require('eslint-plugin-only-warn');

module.exports = {
    extends: ['eslint:recommended', 'prettier', "react-app"],
    env: {
        node: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    plugins: ['only-warn'],
    rules: {
        // your custom rules
    },
};
