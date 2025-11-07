# CLAUDE.md - Qualiopii Configuration

⚠️ **CRITICAL**: This project follows STRICT Test-Driven Development.
No code without tests. No exceptions.
🏛️ **QUALIOPI COMPLIANCE**: All compliance features require 95% test coverage and audit trails.

## 📋 Project Context

**Qualiopii** is a comprehensive SaaS platform helping training organizations (organismes de formation) manage their Qualiopi certification process, maintain compliance, and optimize administrative workflows.

### 🎯 Product Vision & Features

**Core Mission**: Simplify administrative management for training organizations while ensuring Qualiopi compliance.

#### 📚 Module 1: Administrative Management

- **Document Generation**: Customizable templates with automatic variables
- **Session Planning**: Integrated calendar with slot management
- **Automated Email Sending**: Custom templates, automatic triggers
- **Electronic Signatures**: Integration for contracts and agreements
- **Electronic Attendance Sheets**: QR codes, automatic validation
- **Automatic BPF Generation**: Compliant Bilan Pédagogique et Financier
- **Dedicated Trainer Space**: Specialized interface for instructors

#### 🏛️ Module 2: Qualiopi Management (Compliance Core)

- **Centralized Evidence Repository**: Document versioning and storage
- **Audit Tracking**: Interactive checklist, automated preparation
- **Indicator Dashboard**: Real-time tracking of 32 Qualiopi indicators
- **Complete Traceability**: Audit trail for every modification
- **Compliance Alerts**: Proactive notifications on deviations
- **Compliance Reports**: Automatic generation for audits

#### 📊 Module 3: Quality Management

- **Questionnaire Generator**: Customizable templates
- **Advanced Analytics**: Statistics, trends, learner satisfaction
- **Continuous Improvement Tracking**: Action plans, quality KPIs
- **Global Statistics**: Cross-session and multi-period reporting
- **Hot/Cold Evaluations**: Automated satisfaction surveys

#### 💼 Module 4: Commercial & CRM Management

- **Client/Learner/Trainer Database**: Multi-tenant integrated CRM
- **Data Import/Export**: CSV, API, external synchronization
- **Public Registration Links**: Customizable landing pages
- **Automated Quotes**: Templates with automatic calculations
- **Sales Tracking**: Pipeline, conversion, reporting

#### 🤝 Module 5: Collaborative Management

- **Learner-Trainer Exchange Space**: Integrated messaging
- **Sharing Platform**: Documents, educational resources
- **Training Forums**: Moderated discussion threads
- **Real-time Notifications**: Updates on important activities

### Tech Stack

- **Frontend**: Nuxt 3 + shadcn-vue + Tailwind CSS + Pinia
- **Backend**: AdonisJS v6 + Lucid ORM + PostgreSQL
- **Testing**: Vitest (frontend) + Japa (backend) + Playwright (E2E)
- **Services**: Resend API (emails) + Multi-tenant architecture

### Business Requirements

- Support 500+ training organizations simultaneously
- GDPR and French data protection compliant
- Qualiopi certification standards (32 indicators)
- Multi-tenant data isolation
- French language as primary locale

### Key Differentiators vs Competition

- **All-in-One Platform**: Single solution for admin, compliance, quality, commercial
- **Automation First**: Reduce manual tasks by 80% with smart workflows
- **Real-time Compliance**: Live dashboard showing certification readiness
- **White-label Options**: Customizable branding for enterprise clients
- **API-First Architecture**: Easy integration with existing systems
- **Mobile-First Design**: Full functionality on mobile devices

### MVP Priority Features (Sprint 1-3)

**Sprint 1: Core Foundation**

- Multi-tenant architecture setup
- User authentication & authorization (RBAC)
- Organization onboarding flow
- Basic dashboard with Qualiopi indicators

**Sprint 2: Document Management**

- Template engine for documents
- Electronic signature integration
- Evidence repository with versioning
- Audit trail implementation

**Sprint 3: Training Sessions**

- Session calendar and planning
- Attendance tracking (QR codes)
- Automated email notifications
- Basic reporting (BPF preparation)

## 🔴🟢🔵 MANDATORY: Test-Driven Development

### CRITICAL RULES

1. **NO CODE WITHOUT TESTS** - Every feature must have failing tests FIRST
2. **EXPLICIT TDD INSTRUCTION** - User must explicitly state "write tests first"
3. **SEPARATE COMMITS** - Commit tests before implementation
4. **NO MOCK IMPLEMENTATIONS** - Don't create placeholder code during test phase

### TDD Workflow (Anthropic Best Practices)

```bash
1. 🔴 RED: Write tests based on expected behavior
2. ✅ VERIFY: pnpm test --run (confirm failure)
3. 💾 COMMIT: git commit -m "test: add failing tests for [feature]"
4. 🟢 GREEN: Write minimal code to pass tests
5. 🔄 ITERATE: Continue until all tests pass
6. 🔍 VERIFY: Check implementation isn't overfitting
7. 🔵 REFACTOR: Improve while keeping tests green
```

### Coverage Requirements

- **Qualiopi compliance features**: 95% minimum
- **Training management**: 90% minimum
- **General features**: 80% minimum

## 🛑 HALT Conditions

```typescript
const MUST_HALT = {
  NO_TESTS:
    "Cannot proceed - write tests first for Qualiopi compliance feature",
  UNCLEAR_QUALIOPI_SPEC:
    "Qualiopi requirement ambiguous - need compliance clarification",
  LOW_COVERAGE: "Coverage below threshold - add more tests",
  MISSING_TYPES: "TypeScript types not defined for training organization data",
  NO_VALIDATION: "Input validation missing for sensitive compliance data",
  TENANT_ISOLATION:
    "Multi-tenant data isolation not implemented - security risk",
  AUDIT_TRAIL:
    "Audit trail missing for compliance tracking - required for Qualiopi",
  ACCESSIBILITY: "WCAG 2.1 AA compliance not verified",
  FRENCH_LOCALIZATION:
    "French localization missing - required for primary market",
};
```

## 📁 Project Structure

```
qualiopii/
├── frontend/                    # Nuxt 3 SPA
│   ├── tests/
│   │   ├── components/         # Component tests (*.spec.ts)
│   │   ├── pages/             # Page tests
│   │   ├── stores/            # Pinia store tests
│   │   ├── composables/       # Composable tests
│   │   └── e2e/              # E2E tests (*.e2e.spec.ts)
│   ├── components/
│   │   ├── ui/               # shadcn-vue components
│   │   ├── qualiopi/         # Compliance components
│   │   ├── training/         # Training management
│   │   └── compliance/       # Tracking components
│   ├── pages/                # Route pages
│   ├── stores/               # Pinia stores
│   └── composables/          # Vue composables
├── backend/                    # AdonisJS v6 API
│   ├── tests/
│   │   ├── unit/             # Unit tests
│   │   ├── functional/       # API tests
│   │   └── integration/      # Integration tests
│   ├── app/
│   │   ├── controllers/      # API controllers
│   │   ├── models/           # Lucid ORM models
│   │   ├── validators/       # Request validators
│   │   ├── policies/         # Authorization
│   │   └── services/         # Business logic
│   └── database/             # Migrations, factories
└── .claude/                   # Agent handoffs
```

## 🚀 Development Workflow

### Starting a New Feature

```bash
# 1. Create failing test FIRST
pnpm test:watch

# 2. Write test file (example: QualiobiIndicator.spec.ts)
# 3. Verify test fails
# 4. Commit failing test
git commit -m "test: add QualiobiIndicator component tests"

# 5. Implement feature
# 6. Verify tests pass
# 7. Check coverage
pnpm test:coverage
```

### Essential Commands

**Frontend (Nuxt 3)**

```bash
pnpm dev                # Start dev server
pnpm test              # Run Vitest tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
pnpm test:e2e          # Playwright E2E tests
```

**Backend (AdonisJS v6)**

```bash
pnpm dev               # Start API server
pnpm test              # Run Japa tests
pnpm test:coverage     # Coverage report
node ace migration:run # Run migrations
node ace db:seed       # Seed database
```

## 📝 Code Templates

### Qualiopi Component Test (Frontend)

```typescript
// tests/components/qualiopi/IndicatorCard.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import IndicatorCard from "~/components/qualiopi/IndicatorCard.vue";

describe("IndicatorCard", () => {
  beforeEach(() => {
    // Setup tenant context
  });

  it("should display compliance status correctly", () => {
    const wrapper = mount(IndicatorCard, {
      props: {
        indicator: "QUALIOPI_INDICATOR_1",
        status: "COMPLIANT",
        organizationId: "org_123",
      },
    });

    expect(wrapper.find('[data-testid="status"]').text()).toBe("Conforme");
    expect(wrapper.find('[data-testid="indicator"]').text()).toBe(
      "Indicateur 1"
    );
  });

  it("should track audit trail for compliance changes", async () => {
    // Test audit trail creation
  });
});
```

### Training Organization API Test (Backend)

```typescript
// tests/functional/training_organizations.spec.ts
import { test } from "@japa/runner";
import Organization from "#models/organization";
import Database from "@ioc:Adonis/Lucid/Database";

test.group("Training Organizations API", (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction();
    return () => Database.rollbackGlobalTransaction();
  });

  test("should enforce tenant isolation", async ({ client, assert }) => {
    const org1 = await Organization.create({
      name: "Formation Alpha",
      tenant_id: "tenant_1",
    });

    const response = await client
      .get(`/api/organizations/${org1.id}`)
      .header("X-Tenant-Id", "tenant_2");

    response.assertStatus(403);
  });

  test("should create audit trail for Qualiopi updates", async ({ client }) => {
    // Test audit trail
  });
});
```

### Compliance Store Test (Pinia)

```typescript
// tests/stores/complianceStore.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useComplianceStore } from "~/stores/complianceStore";

describe("Compliance Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should calculate global compliance score", () => {
    const store = useComplianceStore();
    store.setIndicators([
      { id: "QUALIOPI_INDICATOR_1", status: "COMPLIANT" },
      { id: "QUALIOPI_INDICATOR_2", status: "PARTIALLY_COMPLIANT" },
      { id: "QUALIOPI_INDICATOR_3", status: "NON_COMPLIANT" },
    ]);

    expect(store.complianceScore).toBe(50);
    expect(store.auditReadiness).toBe(false);
  });
});
```

## 🎯 Qualiopi-Specific Conventions

### Constants

```typescript
// Compliance levels
export enum ComplianceLevel {
  COMPLIANT = "COMPLIANT",
  PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT",
  NON_COMPLIANT = "NON_COMPLIANT",
}

// Audit statuses
export enum AuditStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  REQUIRES_ACTION = "REQUIRES_ACTION",
}

// Indicators (32 total)
export const QUALIOPI_INDICATORS = {
  INDICATOR_1: "Conditions générales",
  INDICATOR_2: "Identification des objectifs",
  // ... etc
};
```

### Multi-Tenant Patterns

```typescript
// Always include tenant context
const organizationData = await Organization.query()
  .where("tenant_id", tenantId)
  .where("id", organizationId)
  .firstOrFail();

// Validate tenant access
if (resource.tenantId !== request.tenantId) {
  throw new ForbiddenException("Tenant isolation violation");
}
```

## 🔧 Claude Code Integration

Existing configurations to reference:

- **Slash Commands**: See `.claude/commands/` for `/tdd-feature`, `/compliance-check`
- **Hooks**: Automated test runs configured in `.claude/hooks/`
- **MCP**: Database and API integrations in `.mcp.json`

## ⚡ Quick Reference

### Testing Priorities

1. **Qualiopi compliance features** - 95% coverage, full audit trails
2. **Training management** - 90% coverage, tenant isolation
3. **Document generation** - E2E tests required
4. **Email notifications** - Mock Resend API in tests
5. **Multi-tenant security** - Integration tests mandatory

### Common Patterns

#### Frontend (Nuxt/Vue)

```bash
npm run test              # Watch mode
npm run test:run          # Single run
npm run test:coverage     # Coverage report
npm run test:ui           # UI mode
vitest [filename]         # Test specific file
```

#### Backend (AdonisJS)

```bash
node ace test                      # All tests
node ace test functional           # Functional only
node ace test unit                # Unit only
node ace test --watch            # Watch mode
node ace test --grep "pattern"   # Pattern matching

```

#### Test Structure

#### Frontend Tests

Location: src/components/**tests**/ or tests/components/
Naming: ComponentName.spec.ts
Use mountSuspended for Nuxt components Nuxt
Mock with vi.mock() AdonisJSVue.js

#### Backend Tests

Functional: tests/functional/
Unit: tests/unit/ AdonisJS
Use DatabaseTransactions trait
Use Factory for test data AdonisJSAdonisJS

#### Coverage Requirements

Minimum: 95% for compliance features
Check with: npm run test:coverage
Backend: node ace test --coverage

#### Git Workflow

Branch naming: feature/[ticket]-[description]
Commits follow TDD phases
PR must include:

All tests passing
Coverage report
No test modifications in GREEN phase

#### Multi-tenant Requirements

Tenant isolation at database level
Role-based access control
Audit trail for all indicator modifications
Document versioning for evidence

#### GDPR Compliance

Personal data encryption
Right to erasure implementation
Data portability features
Consent management

#### Development Standards

Use TypeScript strict mode
Follow Vue 3 Composition API
Use Pinia for state management
AdonisJS: Use dependency injection
All API responses follow JSON:API spec

## 📌 Remember

1. **Tests FIRST** - No exceptions for Qualiopi features
2. **Tenant isolation** - Every query must filter by tenant
3. **Audit trails** - Every compliance change must be logged
4. **French first** - All user-facing text in French
5. **Accessibility** - WCAG 2.1 AA compliance required
6. **Performance** - Dashboard < 500ms, API < 150ms p95
