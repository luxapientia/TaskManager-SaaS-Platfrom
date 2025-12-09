# GitHub Configuration Files

This directory contains **GitHub-specific configuration files** that must remain in `.github/` for GitHub to recognize and use them automatically.

## ⚠️ Important: Do Not Move These Files

These files are **not documentation** - they are **functional configuration files** that GitHub reads from specific locations.

## 📁 Files in This Directory

### `.github/ISSUE_TEMPLATE/`
GitHub automatically uses these templates when users create new issues:
- `bug_report.md` - Template for bug reports
- `feature_request.md` - Template for feature requests

**Location requirement**: Must be in `.github/ISSUE_TEMPLATE/`

### `.github/PULL_REQUEST_TEMPLATE.md`
GitHub automatically uses this template when users create pull requests.

**Location requirement**: Must be in `.github/` root or `.github/PULL_REQUEST_TEMPLATE.md`

### `.github/workflows/`
GitHub Actions CI/CD pipeline configurations:
- `ci.yml` - Continuous Integration pipeline

**Location requirement**: Must be in `.github/workflows/`

## 🔍 How GitHub Uses These

### Issue Templates
When someone clicks "New Issue" on GitHub:
1. GitHub looks in `.github/ISSUE_TEMPLATE/`
2. Shows available templates (Bug Report, Feature Request)
3. User selects a template
4. Template content is pre-filled in the issue form

### Pull Request Template
When someone creates a pull request:
1. GitHub looks for `.github/PULL_REQUEST_TEMPLATE.md`
2. Automatically includes template content in PR description
3. Ensures consistent PR format

### Workflows
GitHub Actions automatically runs workflows from `.github/workflows/`:
- Triggers on push, pull request, etc.
- Runs CI/CD pipelines

## 📚 Related Documentation

For documentation about these features:
- **Issue Templates**: See [Contributing Guide](../docs/development/CONTRIBUTING.md)
- **Pull Request Process**: See [Git Workflow](../docs/development/GIT-WORKFLOW.md)
- **CI/CD Pipeline**: See [Implementation Plan](../docs/guides/TaskManager-SaaS-Implementation-Plan.md)

## ✅ Summary

- **`.github/`** = GitHub configuration files (must stay here)
- **`docs/`** = Project documentation (for humans to read)

These are different types of files serving different purposes!

