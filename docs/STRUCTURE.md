# Documentation Structure

This document describes the organization of all project documentation.

## 📁 Directory Structure

### Documentation (`docs/`)
```
docs/
├── README.md                    # Documentation index and navigation
├── STRUCTURE.md                 # This file - structure overview
│
├── getting-started/            # Setup and onboarding
│   ├── SETUP.md                # Complete setup instructions
│   └── QUICK-START.md          # Quick 3-step getting started guide
│
├── development/                # Development workflow and processes
│   ├── GIT-WORKFLOW.md         # Complete Git workflow guide
│   ├── GIT-QUICK-REFERENCE.md  # Quick Git command reference
│   └── CONTRIBUTING.md         # Contribution guidelines
│
└── guides/                     # Detailed guides and plans
    ├── TaskManager-SaaS-Implementation-Plan.md  # Full SDLC + DevOps plan
    ├── GIT-SETUP-COMPLETE.md   # Git workflow setup documentation
    └── WORKFLOW-SUMMARY.md     # Workflow summary
```

### GitHub Configuration (`.github/`)
```
.github/
├── README.md                    # Explanation of GitHub config files
├── workflows/                   # GitHub Actions CI/CD
│   └── ci.yml                  # CI pipeline
├── ISSUE_TEMPLATE/             # Issue templates (GitHub uses automatically)
│   ├── bug_report.md
│   └── feature_request.md
└── PULL_REQUEST_TEMPLATE.md     # PR template (GitHub uses automatically)
```

**Note**: Files in `.github/` are **GitHub configuration files**, not documentation. They must stay in `.github/` for GitHub to recognize them. See [.github/README.md](../.github/README.md) for details.

## 🔍 Understanding File Locations

### Documentation vs Configuration

**Documentation** (`docs/`):
- Files for humans to read
- Can be organized and moved
- Examples: guides, tutorials, references

**GitHub Configuration** (`.github/`):
- Files for GitHub to read automatically
- **Must stay in specific locations**
- Examples: issue templates, PR templates, workflows

See [.github/README.md](../../.github/README.md) for why these files must stay in `.github/`.

## 📚 Documentation Categories

### Getting Started
**Location**: `docs/getting-started/`

For new developers and first-time setup:
- **SETUP.md**: Detailed setup instructions with troubleshooting
- **QUICK-START.md**: Fast-track guide to get running quickly

### Development
**Location**: `docs/development/`

For active development and collaboration:
- **GIT-WORKFLOW.md**: Complete Git workflow, branching strategy, and best practices
- **GIT-QUICK-REFERENCE.md**: Quick reference for common Git commands
- **CONTRIBUTING.md**: How to contribute to the project

### Guides
**Location**: `docs/guides/`

For planning and detailed reference:
- **TaskManager-SaaS-Implementation-Plan.md**: Complete SDLC + DevOps implementation plan
- **GIT-SETUP-COMPLETE.md**: Git workflow setup and configuration details
- **WORKFLOW-SUMMARY.md**: Quick workflow summary

## 🔗 Navigation

### From Root README
The main [README.md](../README.md) links to:
- Documentation index: `docs/README.md`
- Quick links to key documents

### From Documentation Index
The [docs/README.md](./README.md) provides:
- Complete navigation of all documentation
- Quick links by topic
- Links organized by audience (new developers, contributors, planners)

## 📖 Finding Documentation

### I want to...
- **Set up the project** → `docs/getting-started/`
- **Understand Git workflow** → `docs/development/GIT-WORKFLOW.md`
- **Contribute code** → `docs/development/CONTRIBUTING.md`
- **See the implementation plan** → `docs/guides/TaskManager-SaaS-Implementation-Plan.md`
- **Quick Git commands** → `docs/development/GIT-QUICK-REFERENCE.md`

## 🔄 Maintaining Documentation

### When Adding New Documentation

1. **Choose the right category:**
   - Setup/onboarding → `getting-started/`
   - Development process → `development/`
   - Detailed guides → `guides/`

2. **Update indexes:**
   - Add to `docs/README.md`
   - Update this file if structure changes

3. **Update cross-references:**
   - Check for broken links
   - Use relative paths within docs/

### Documentation Standards

- Use Markdown format
- Keep files focused and scannable
- Include code examples where helpful
- Link to related documents
- Update when code changes

## 📝 Quick Links

- [Documentation Index](./README.md) - Start here
- [Getting Started](./getting-started/) - Setup guides
- [Development](./development/) - Workflow and contribution
- [Guides](./guides/) - Detailed plans and guides

