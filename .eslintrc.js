module.exports = {
    extends: ['eslint:recommended', 'prettier'],
    env: {
        node: true,
        es2021: true,
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        // your custom rules
    },
};
