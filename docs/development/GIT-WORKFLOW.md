# Git Workflow Guide

## Branching Strategy: GitHub Flow

We use **GitHub Flow** - a simple, branch-based workflow that works well for continuous deployment.

### Branch Structure

```
main (production-ready code)
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/user-authentication
  │     ├── feature/task-management
  │     ├── feature/project-analytics
  │     └── bugfix/login-error
  │
  └── hotfix/critical-security-patch
```

### Branch Types

#### 1. **main** (Production)
- **Purpose**: Production-ready code
- **Protection**: Required PR reviews, CI must pass
- **Deployment**: Auto-deploys to production
- **Merges from**: `develop` (via PR) or `hotfix/*` (direct merge)

#### 2. **develop** (Integration)
- **Purpose**: Integration branch for all features
- **Protection**: CI must pass
- **Deployment**: Auto-deploys to staging
- **Merges from**: `feature/*`, `bugfix/*` branches

#### 3. **feature/** (Feature Development)
- **Naming**: `feature/description` (e.g., `feature/user-authentication`)
- **Purpose**: New features or enhancements
- **Created from**: `develop`
- **Merged to**: `develop` (via PR)

#### 4. **bugfix/** (Bug Fixes)
- **Naming**: `bugfix/description` (e.g., `bugfix/login-error`)
- **Purpose**: Fix bugs in `develop`
- **Created from**: `develop`
- **Merged to**: `develop` (via PR)

#### 5. **hotfix/** (Critical Fixes)
- **Naming**: `hotfix/description` (e.g., `hotfix/security-patch`)
- **Purpose**: Critical fixes for production
- **Created from**: `main`
- **Merged to**: Both `main` and `develop`

## Workflow Process

### Starting a New Feature

1. **Update develop branch:**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/user-authentication
   ```

3. **Work on feature:**
   - Make commits following commit conventions
   - Push regularly: `git push origin feature/user-authentication`

4. **Create Pull Request:**
   - Push branch to remote
   - Create PR from `feature/user-authentication` to `develop`
   - Wait for CI to pass and code review

5. **Merge:**
   - After approval, merge PR (squash merge recommended)
   - Delete feature branch

### Bug Fix Process

1. **Create bugfix branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b bugfix/login-error
   ```

2. **Fix and commit:**
   ```bash
   # Make fixes
   git add .
   git commit -m "fix: resolve login error on invalid credentials"
   git push origin bugfix/login-error
   ```

3. **Create PR to develop:**
   - Create PR and get approval
   - Merge after CI passes

### Hotfix Process (Production Issues)

1. **Create hotfix from main:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/security-patch
   ```

2. **Fix and commit:**
   ```bash
   # Make critical fix
   git add .
   git commit -m "fix: patch security vulnerability in auth"
   git push origin hotfix/security-patch
   ```

3. **Merge to main:**
   - Create PR to `main`
   - After merge, also merge to `develop`

## Commit Message Conventions

We follow **Conventional Commits** specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, config)
- **perf**: Performance improvements
- **ci**: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(auth): add user registration endpoint"

# Bug fix
git commit -m "fix(api): resolve 500 error on task creation"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor(db): optimize user query performance"

# With body
git commit -m "feat(tasks): add task assignment feature

- Add assignee field to tasks
- Update task creation endpoint
- Add validation for assignee"
```

### Scope (Optional)
- `auth`: Authentication related
- `api`: API endpoints
- `db`: Database related
- `ui`: Frontend UI
- `config`: Configuration
- `test`: Testing

## Pre-commit Hooks

Pre-commit hooks automatically run before each commit:

1. **Linting**: ESLint checks (frontend & backend)
2. **Formatting**: Prettier formatting check
3. **Tests**: Run unit tests (fast tests only)
4. **Commit message**: Validate commit message format

### Bypassing Hooks (Emergency Only)

```bash
# Skip hooks (use sparingly!)
git commit --no-verify -m "emergency: critical hotfix"
```

## Pull Request Guidelines

### PR Title
- Follow commit message conventions
- Example: `feat(auth): implement user authentication`

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

### PR Review Requirements
- At least 1 approval required
- CI must pass
- No merge conflicts
- Up-to-date with target branch

## Branch Protection Rules

### main Branch
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass (CI)
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict pushes (no direct pushes)

### develop Branch
- ✅ Require status checks to pass (CI)
- ✅ Require branches to be up to date
- ⚠️ Allow force pushes (for emergency fixes)

## Tagging and Releases

### Version Tags
- Format: `v1.0.0` (Semantic Versioning)
- Created from `main` branch
- Tagged after successful production deployment

### Creating a Release Tag
```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Common Commands

### Daily Workflow
```bash
# Start work
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# During work
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature

# End of day
git push origin feature/my-feature
```

### Sync with Remote
```bash
# Update local branch
git checkout develop
git pull origin develop

# Rebase feature branch
git checkout feature/my-feature
git rebase develop
```

### Clean Up
```bash
# Delete local branch
git branch -d feature/my-feature

# Delete remote branch (after PR merge)
git push origin --delete feature/my-feature
```

## Troubleshooting

### Merge Conflicts
```bash
# Update develop
git checkout develop
git pull origin develop

# Rebase feature branch
git checkout feature/my-feature
git rebase develop

# Resolve conflicts, then:
git add .
git rebase --continue
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Update Commit Message
```bash
git commit --amend -m "new message"
```

## Best Practices

1. **Commit Often**: Small, logical commits
2. **Write Clear Messages**: Follow conventions
3. **Pull Before Push**: Always sync with remote
4. **Review Before PR**: Self-review your code
5. **Keep Branches Clean**: Delete merged branches
6. **Test Before Commit**: Run tests locally
7. **No Direct Pushes to main**: Always use PRs

