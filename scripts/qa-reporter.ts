import fs from "fs";
import path from "path";

export interface TestCaseResult {
  id: string;
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
  details?: Record<string, any>;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  remediation?: string;
}

export interface QAReportData {
  timestamp: string;
  durationMs: number;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  results: TestCaseResult[];
  environment: {
    nodeVersion: string;
    nextUrl: string;
    database: string;
  };
}

export function generateQAReport(data: QAReportData): string {
  const passRate = ((data.passedCount / data.totalTests) * 100).toFixed(1);
  const statusBadge =
    data.failedCount === 0
      ? "🟢 **ALL SYSTEMS OPERATIONAL (100% PASSED)**"
      : `🔴 **${data.failedCount} TESTS FAILED (ACTION REQUIRED)**`;

  const failedTests = data.results.filter((r) => !r.passed);

  // Group by suite
  const suites: Record<string, TestCaseResult[]> = {};
  for (const r of data.results) {
    if (!suites[r.suite]) suites[r.suite] = [];
    suites[r.suite].push(r);
  }

  let markdown = `# 🛡️ Ethereal Wear — Quality Assurance & Test Audit Report

**Audit Status**: ${statusBadge}  
**Execution Timestamp**: ${data.timestamp}  
**Total Test Cases**: ${data.totalTests} | **Passed**: ${data.passedCount} | **Failed**: ${data.failedCount} | **Pass Rate**: ${passRate}%  
**Total Duration**: ${(data.durationMs / 1000).toFixed(2)}s  
**Environment**: Next.js App Router | Node ${data.environment.nodeVersion} | Host: ${data.environment.nextUrl}

---

## 📊 Suite Executive Summary

| Test Suite | Total | Passed | Failed | Health Status |
| :--- | :---: | :---: | :---: | :--- |
`;

  for (const [suiteName, tests] of Object.entries(suites)) {
    const passed = tests.filter((t) => t.passed).length;
    const failed = tests.filter((t) => !t.passed).length;
    const health = failed === 0 ? "✅ Healthy" : "❌ Degraded";
    markdown += `| **${suiteName}** | ${tests.length} | ${passed} | ${failed} | ${health} |\n`;
  }

  markdown += `\n---\n\n## 🧪 Detailed Test Case Results\n\n`;

  for (const [suiteName, tests] of Object.entries(suites)) {
    markdown += `### Suite: ${suiteName}\n\n`;
    markdown += `| Test ID | Test Case | Status | Duration | Notes |\n`;
    markdown += `| :--- | :--- | :---: | :---: | :--- |\n`;

    for (const test of tests) {
      const icon = test.passed ? "✅ PASS" : "❌ FAIL";
      const notes = test.passed
        ? "Met all assertions"
        : `⚠️ **${test.error || "Assertion failed"}**`;
      markdown += `| \`${test.id}\` | ${test.name} | ${icon} | ${test.durationMs}ms | ${notes} |\n`;
    }
    markdown += `\n`;
  }

  if (failedTests.length > 0) {
    markdown += `\n---\n\n## 🚨 Failed Tests & Root Cause Analysis\n\n`;

    for (const fail of failedTests) {
      markdown += `### ❌ [${fail.id}] ${fail.name} (Severity: **${fail.severity || "HIGH"}**)\n`;
      markdown += `- **Suite**: ${fail.suite}\n`;
      markdown += `- **Error Output**: \`${fail.error}\`\n`;
      if (fail.details) {
        markdown += `- **Failure Details**: \n\`\`\`json\n${JSON.stringify(fail.details, null, 2)}\n\`\`\`\n`;
      }
      markdown += `- **Perfection Remediation Action**: ${fail.remediation || "Inspect endpoint implementation and adjust handler."}\n\n`;
    }
  }

  markdown += `\n---\n\n## 🎯 Perfection Over Perfection — Continuous Excellence Plan\n\n`;
  markdown += `To guarantee flawless production performance at scale, the following operational benchmarks are continuously evaluated:\n\n`;
  markdown += `1. **Zero-Flake Database Pooling**: Ensure connection pools handle burst checkout traffic without timeouts.\n`;
  markdown += `2. **Privacy by Default**: Strict role separation ensures customer order data is never exposed to third parties without email verification.\n`;
  markdown += `3. **Resilient Fallbacks**: Fallback mail simulation ensures orders complete even if external SMTP services experience temporary downtime.\n`;
  markdown += `4. **Strict Sanitization**: Client and server-side regex guards reject unexpected characters before touching the persistence layer.\n\n`;
  markdown += `*Generated automatically by Ethereal Wear Internal QA Suite.*\n`;

  return markdown;
}

export function saveQAReport(reportMarkdown: string, outputPath?: string) {
  const filePath = outputPath || path.join(process.cwd(), "QA_TEST_REPORT.md");
  fs.writeFileSync(filePath, reportMarkdown, "utf8");
  return filePath;
}
