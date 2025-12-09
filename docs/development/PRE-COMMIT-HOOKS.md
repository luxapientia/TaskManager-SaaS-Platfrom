# Git Hooks Strategy - Industry Best Practices

## Industry Standard Approach

Based on industry best practices, we use a **three-tier validation strategy**:

### 1. Pre-commit Hook (Fast Checks)

**Goal**: Immediate feedback, < 10 seconds

- ✅ **Linting** (ESLint) - Code quality
- ✅ **Formatting** (Prettier) - Code style
- ✅ **Type Checking** (TypeScript) - Type errors
- ❌ **No Tests** - Too slow for commit stage

### 2. Pre-push Hook (Tests)

**Goal**: Ensure code quality before sharing

- ✅ **Unit Tests** - Related tests only
- ✅ **Fast Integration Tests** - If applicable
- ❌ **No Full Suite** - Still runs in CI/CD
- ❌ **No E2E Tests** - Too slow

### 3. CI/CD Pipeline (Everything)

**Goal**: Comprehensive validation

- ✅ **Full Test Suite** - All tests
- ✅ **Integration Tests** - Complete coverage
- ✅ **E2E Tests** - End-to-end validation
- ✅ **Build Verification** - Production builds
- ✅ **Security Scans** - Vulnerability checks
- ✅ **Coverage Reports** - Test coverage

## Philosophy: Why This Three-Tier Approach?

### Pre-commit: Speed is Key

- ⚡ **Ultra-fast** (< 10 seconds)
- 🎯 **Only changed files** - Lint-staged
- 🔧 **Auto-fixable** - Formatting, linting
- 🚫 **Non-blocking** - Don't slow down commits
- **Purpose**: Catch obvious issues immediately

### Pre-push: Quality Gate

- ⏱️ **Moderate speed** (30-60 seconds acceptable)
- 🧪 **Tests related to changes** - Jest findRelatedTests
- 🛡️ **Prevent bad code** from reaching remote
- **Purpose**: Ensure code works before sharing

### CI/CD: Comprehensive Validation

- ⏳ **Can take time** (minutes acceptable)
- 🔍 **Full coverage** - All tests, all checks
- 🏗️ **Production-like** - Real builds, real environments
- **Purpose**: Final validation before merge

## Why This Approach?

### Pros of Fast Pre-commit Checks

1. **Developer Experience** - Quick feedback without waiting
2. **Catches Issues Early** - Fix problems before committing
3. **Prevents Bad Commits** - Stops obviously broken code
4. **Maintains Code Quality** - Consistent formatting and style

### Cons of Running Full Tests in Pre-commit

1. **Too Slow** - Can take minutes, frustrating developers
2. **Flaky Tests** - Environment issues can block commits
3. **WIP Code** - Prevents committing work-in-progress
4. **Resource Intensive** - Uses local machine resources

## Best Practices

### ✅ Recommended for Pre-commit

- Linting (ESLint, Pylint, etc.)
- Formatting (Prettier, Black, etc.)
- Type checking (TypeScript, mypy, etc.)
- Fast unit tests (only for changed files)
- Import sorting
- Security linting (basic checks)

### ❌ Not Recommended for Pre-commit

- Full test suite
- Integration tests
- E2E tests
- Build process
- Database migrations
- Long-running checks

## Our Implementation

### Pre-commit Hook

```bash
# Frontend:
- ESLint (linting)
- Prettier (formatting)
- TypeScript type check

# Backend:
- ESLint (linting)
- Prettier (formatting)

# Both:
- No tests (too slow for commit stage)
```

### Pre-push Hook (Recommended)

```bash
# Frontend:
- Unit tests (related to changed files)
- Type checking (if not in pre-commit)

# Backend:
- Unit tests (related to changed files)
- Fast integration tests (optional)

# Both:
- Fast, focused test execution
```

### CI/CD Pipeline

```yaml
# GitHub Actions runs:
- Full linting
- Full test suite with coverage
- Integration tests
- E2E tests
- Build verification
- Security scanning
- Performance tests
```

## Configuration

See:

- `.husky/pre-commit` - Hook configuration
- `.lintstagedrc.js` - What runs on staged files
- `.github/workflows/ci.yml` - Full CI/CD pipeline

## Bypassing Hooks (When Needed)

If you need to bypass hooks for emergency fixes:

```bash
git commit --no-verify -m "emergency: critical hotfix"
```

**Use sparingly!** The CI/CD pipeline will still catch issues.

## Industry Standard: Where Tests Should Run

### ✅ Pre-commit: NO Tests (Industry Standard)

**Why?**

- Commits should be fast (< 10 seconds)
- Developers commit frequently (WIP, experiments)
- Tests can be slow and flaky
- Formatting/linting is more important at commit time

**What runs instead:**

- Linting, formatting, type checking only

### ✅ Pre-push: YES Tests (Industry Standard)

**Why?**

- Code is about to be shared with team
- Can take 30-60 seconds (acceptable before push)
- Prevents broken code from reaching remote
- Catches issues before CI/CD runs

**What runs:**

- Unit tests (related to changed files)
- Fast integration tests
- `jest --findRelatedTests` pattern

### ✅ CI/CD: Full Test Suite (Industry Standard)

**Why?**

- Final validation before merge
- Can take minutes (acceptable in CI)
- Runs in clean environment
- Comprehensive coverage

**What runs:**

- Full test suite
- Integration tests
- E2E tests
- Build verification

## Future Improvements

Consider adding:

- [ ] Pre-push hook for full test suite
- [ ] Import sorting (eslint-plugin-import)
- [ ] Security linting (npm audit, Snyk)
- [ ] File size checks
- [ ] Secret scanning
