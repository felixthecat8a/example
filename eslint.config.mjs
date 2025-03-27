import js from "@eslint/js"
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier"

export default [
    eslintConfigPrettier,
    js.configs.recommended,
    {
        files: ["**/*.js"],
        ignores: ["./node_modules/**/*"],
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                ...globals.commonjs,
                ...globals.node,
                ...globals.nodeBuiltin,
                ...globals.browser,
            },
        },
        rules: {
            semi: "off", //semicolon
            "prefer-const": "warn",
            "no-unused-vars": "warn",
            "no-undef": "error",
            "eqeqeq": "warn",
            "curly": "warn",
        },
        linterOptions: {
            noInlineConfig: true,
            reportUnusedDisableDirectives: "warn",
        }
    }
]
