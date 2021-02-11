module.exports = {
    env: {
        es6: true,
        jest: true,
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:eslint-comments/recommended"
    ],
    overrides: [{
        extends: [
            "plugin:import/errors",
            "plugin:import/warnings",
            "plugin:promise/recommended",
            "plugin:radar/recommended",
            "plugin:unicorn/recommended"
        ],
        files: [
            "**.{ts,js}"
        ],
        parser: "@typescript-eslint/parser",
        parserOptions: {
            sourceType: "module"
        },
        plugins: [
            "import",
            "node",
            "sort-class-members",
            "sort-destructure-keys",
            "sort-keys-fix",
            "unicorn"
        ],
        rules: {
            "@typescript-eslint/no-unused-vars": "warn",
            "arrow-body-style": [ "error", "as-needed" ],
            "arrow-parens": [ "error", "as-needed", {
                requireForBlockBody: true
            }],
            "block-spacing": "error", "comma-dangle": [ "error", "never" ],
            "computed-property-spacing": [ "error", "never", {
                enforceForClassMembers: true
            }],
            "constructor-super": "error",
            curly: [ "error" ],
            "default-case-last": "error",
            "default-param-last": [ "error" ],
            "dot-notation": [ "error", {
                allowKeywords: false
            }],
            "for-direction": "error",
            "func-call-spacing": [ "error", "never" ],
            "func-style": [ "error", "expression" ],
            "function-paren-newline": [ "error", "multiline" ],
            "implicit-arrow-linebreak": [ "error", "beside" ],
            "import/order": "error",
            "key-spacing": [ "error", {
                mode: "strict"
            }],
            "keyword-spacing": [ "error", {
                after: true,
                before: true
            }],
            "no-confusing-arrow": [ "error", {
                allowParens: true
            }],
            "no-multi-assign": "error",
            "no-multi-str": "error",
            "no-nested-ternary": "off",
            "no-process-exit": "off",
            "no-return-assign": "error",
            "no-script-url": "error",
            "no-self-compare": "error",
            "no-sequences": "error",
            "no-throw-literal": "error",
            "no-unmodified-loop-condition": "error",
            "no-unused-expressions": "error",
            "no-unused-vars": "off",
            "no-useless-call": "error",
            "no-useless-concat": "error",
            "no-useless-return": "error",
            "no-warning-comments": "warn",
            "node/no-missing-import": "off",
            "operator-linebreak": "error",
            "padded-blocks": [ "error", "never" ],
            "padding-line-between-statements": [ "error", {
                blankLine: "always",
                next: "*",
                prev: [
                    "block",
                    "block-like"
                ]
            }, {
                blankLine: "always",
                next: "export",
                prev: "block"
            }, {
                blankLine: "always",
                next: "*",
                prev: "const"
            }, {
                blankLine: "never",
                next: "singleline-const",
                prev: "singleline-const"
            }, {
                blankLine: "always",
                next: "*",
                prev: "let"
            }, {
                blankLine: "never",
                next: "singleline-let",
                prev: "singleline-let"
            }, {
                blankLine: "always",
                next: "*",
                prev: "var"
            }, {
                blankLine: "never",
                next: "singleline-var",
                prev: "singleline-var"
            }, {
                blankLine: "never",
                next: [
                    "cjs-export",
                    "cjs-import"
                ],
                prev: [
                    "cjs-export",
                    "cjs-import"
                ]
            }, {
                blankLine: "always",
                next: [
                    "return",
                    "continue",
                    "break",
                    "throw"
                ],
                prev: "*"
            }, {
                blankLine: "always",
                next: "*",
                prev: "directive"
            }, {
                blankLine: "always",
                next: "*",
                prev: [
                    "case",
                    "default"
                ]
            }],
            "prefer-arrow-callback": [ "error", {
                allowNamedFunctions: true
            }],
            "radar/cognitive-complexity": "off",
            "radar/no-duplicate-string": "off",
            "radix": "error",
            "require-await": "error",
            "require-yield": "error",
            "rest-spread-spacing": [ "error", "never" ],
            "semi": [ "error" ],
            "sort-class-members/sort-class-members": [ "error", {
                "accessorPairPositioning": "getThenSet",
                "order": [
                    "[static-properties]",
                    "[static-methods]",
                    "[properties]",
                    "[conventional-private-properties]",
                    "constructor",
                    "[methods]",
                    "[conventional-private-methods]"
                ]
            }],
            "sort-destructure-keys/sort-destructure-keys": [ "error", { "caseSensitive": false }],
            "sort-keys-fix/sort-keys-fix": "error",
            "space-in-parens": [ "error", "never" ],
            "space-infix-ops": "error",
            "unicorn/no-process-exit": "off",
            "wrap-iife": [ "error", "inside" ],
            "yoda": "error"
        }
    }, {
        extends: [
            "plugin:json/recommended"
        ],
        files: [
            "**.json"
        ]
    }, {
        files: [
            "**.js"
        ],
        plugins: [
            "@typescript-eslint"
        ],
        rules: {
            "@typescript-eslint/no-unused-vars": "off"
        }
    }],
    rules: {
        "array-bracket-newline": [ "error", "consistent" ],
        "array-bracket-spacing": [ "error", "always", {
            arraysInArrays: false,
            objectsInArrays: false,
            singleValue: true
        }],
        "array-element-newline": [ "error", "consistent" ],
        "brace-style": [ "error", "1tbs" ],

        "comma-spacing": [ "error", {
            after: true,
            before: false
        }],
        "comma-style": [ "error", "last" ],
        "eol-last": [ "error", "always" ],
        "indent": [ "error", 4, { SwitchCase: 1 }],
        "object-curly-spacing": [ "error", "always", {
            arraysInObjects: false,
            objectsInObjects: false
        }],
        "quotes": [ "error", "double" ]
    },
    settings: {
        "import/resolver": {
            node: {
                extensions: [
                    ".js",
                    ".jsx",
                    ".json",
                    ".ts",
                    ".tsx"
                ]
            }
        }
    }
};
