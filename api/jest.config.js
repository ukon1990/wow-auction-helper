module.exports = {
    globals: {
        "ts-jest": {
            tsConfig: "tsconfig.spec.json",
            allowSyntheticDefaultImports: true
        }
    },
    moduleFileExtensions: ["ts", "js"],
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    testMatch: ["**/src/**/*.spec.ts"],
    testPathIgnorePatterns: ["/node_modules/"],
    testEnvironment: "node",
    collectCoverageFrom: ["**/src/**/*.ts", "!**/node_modules/**"],
    preset: "ts-jest"
};
