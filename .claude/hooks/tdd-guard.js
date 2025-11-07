#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// TDD Guard - Prevents writing implementation before tests
class TDDGuard {
  constructor() {
    this.projectRoot = process.cwd();
    this.testPatterns = {
      frontend: /\.(spec|test)\.(ts|js)$/,
      backend: /tests\/(functional|unit)\/.*\.(ts|js)$/,
    };
  }

  async validateTDDCompliance(operation, filePath) {
    // Skip if editing test files
    if (this.isTestFile(filePath)) {
      return { allowed: true };
    }

    // Check if tests exist for this implementation
    const testFile = this.findTestFile(filePath);
    if (!testFile) {
      return {
        allowed: false,
        reason: `No test file found for ${filePath}. Write tests first!`,
        suggestion: `Create test file: ${this.suggestTestPath(filePath)}`,
      };
    }

    // Check if tests are passing
    const testStatus = this.runTests(testFile);
    if (testStatus.failing === 0) {
      return {
        allowed: false,
        reason: "All tests are passing. Are you in REFACTOR phase?",
        suggestion: "Confirm you are refactoring, not adding new features.",
      };
    }

    return { allowed: true };
  }

  isTestFile(filePath) {
    return (
      this.testPatterns.frontend.test(filePath) ||
      this.testPatterns.backend.test(filePath)
    );
  }

  findTestFile(implementationPath) {
    // Frontend test location
    if (implementationPath.includes("/components/")) {
      const testPath = implementationPath
        .replace("/components/", "/components/__tests__/")
        .replace(".vue", ".spec.ts")
        .replace(".ts", ".spec.ts");
      if (fs.existsSync(testPath)) return testPath;
    }

    // Backend test location
    if (implementationPath.includes("/app/")) {
      const testPath = implementationPath
        .replace("/app/", "/tests/unit/")
        .replace(".ts", ".spec.ts");
      if (fs.existsSync(testPath)) return testPath;
    }

    return null;
  }

  suggestTestPath(implementationPath) {
    if (implementationPath.includes("/components/")) {
      return implementationPath
        .replace("/components/", "/components/__tests__/")
        .replace(".vue", ".spec.ts");
    }
    if (implementationPath.includes("/app/")) {
      return implementationPath
        .replace("/app/", "/tests/unit/")
        .replace(".ts", ".spec.ts");
    }
    return (
      "tests/" +
      path.basename(implementationPath, path.extname(implementationPath)) +
      ".spec.ts"
    );
  }

  runTests(testFile) {
    try {
      // Determine test runner
      const isFrontend = testFile.includes("components");
      const command = isFrontend
        ? `npm run test:run -- ${testFile}`
        : `node ace test ${testFile}`;

      execSync(command, { encoding: "utf8" });
      return { passing: true, failing: 0 };
    } catch (error) {
      // Parse test output for failure count
      const output = error.stdout || "";
      const failureMatch = output.match(/(\d+) failing/);
      return {
        passing: false,
        failing: failureMatch ? parseInt(failureMatch[1]) : 1,
      };
    }
  }
}

// Main execution
const guard = new TDDGuard();
const operation = process.env.TOOL_NAME || "Write";
const filePath = process.env.FILE_PATH || process.argv[2];

if (!filePath) {
  console.log("TDD Guard: No file path provided");
  process.exit(0);
}

guard.validateTDDCompliance(operation, filePath).then((result) => {
  if (!result.allowed) {
    console.error(`TDD Violation: ${result.reason}`);
    console.error(`Suggestion: ${result.suggestion}`);
    process.exit(1);
  }
  process.exit(0);
});
