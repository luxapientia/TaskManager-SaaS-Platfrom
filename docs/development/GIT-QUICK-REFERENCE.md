# Git Workflow Quick Reference

## 🚀 Quick Start

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Daily Workflow
```bash
# Make changes
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature-name
```

### Create Pull Request
1. Push your branch
2. Go to GitHub and create PR to `develop`
3. Wait for CI and review
4. Merge after approval

## 📝 Commit Message Format

```
<type>(<scope>): <subject>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Examples
```bash
feat(auth): add user login
fix(api): resolve task creation error
docs: update README
refactor(db): optimize queries
```

## 🌿 Branch Types

| Branch | Purpose | Created From | Merges To |
|--------|---------|--------------|-----------|
| `main` | Production | - | - |
| `develop` | Integration | `main` | `main` |
| `feature/*` | New features | `develop` | `develop` |
| `bugfix/*` | Bug fixes | `develop` | `develop` |
| `hotfix/*` | Critical fixes | `main` | `main` + `develop` |

## 🔧 Common Commands

### Sync with Remote
```bash
git checkout develop
git pull origin develop
```

### Rebase Feature Branch
```bash
git checkout feature/your-feature
git rebase develop
```

### Update Commit Message
```bash
git commit --amend -m "new message"
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

## ⚠️ Pre-commit Hooks

Before each commit, these run automatically:
- ✅ Linting (ESLint)
- ✅ Formatting (Prettier)
- ✅ Commit message validation

**Skip hooks (emergency only):**
```bash
git commit --no-verify -m "emergency: critical fix"
```

## 📋 PR Checklist

Before creating PR:
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date

## 🔗 Full Documentation

See [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) for complete guide.

