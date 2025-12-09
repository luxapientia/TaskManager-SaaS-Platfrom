# Contributing to TaskManager SaaS

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/taskmanager-saas.git
   cd taskmanager-saas
   ```

3. **Set up development environment:**
   ```bash
   # Install dependencies
   npm install
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   
   # Start services
   docker-compose up -d
   ```

4. **Create a branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Follow Git Workflow
- Read [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) for detailed workflow
- Use conventional commit messages
- Create feature branches from `develop`

### 2. Code Standards

#### Frontend (React + TypeScript)
- Follow TypeScript best practices
- Use functional components with hooks
- Write tests for new components
- Follow ESLint and Prettier rules

#### Backend (Node.js + Express)
- Follow RESTful API conventions
- Write tests for all endpoints
- Use async/await for async operations
- Follow ESLint and Prettier rules

### 3. Testing

**Before committing:**
```bash
# Run all tests
npm test

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

**Test coverage:**
- Aim for >80% test coverage
- Write unit tests for new features
- Add integration tests for API endpoints

### 4. Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add user registration endpoint
fix(api): resolve 500 error on task creation
docs: update API documentation
```

### 5. Pull Request Process

1. **Update your branch:**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/your-feature
   git rebase develop
   ```

2. **Push your changes:**
   ```bash
   git push origin feature/your-feature
   ```

3. **Create Pull Request:**
   - Use the PR template
   - Link related issues
   - Request review from maintainers

4. **Address feedback:**
   - Make requested changes
   - Push updates to your branch
   - PR will automatically update

5. **After approval:**
   - Maintainers will merge your PR
   - Delete your feature branch

## Code Review Guidelines

### For Contributors
- Be open to feedback
- Respond to comments promptly
- Keep PRs focused and small
- Update documentation if needed

### For Reviewers
- Be constructive and respectful
- Explain reasoning for suggestions
- Approve when ready
- Request changes when needed

## Project Structure

```
taskmanager-saas/
├── frontend/          # React frontend
│   ├── src/
│   ├── public/
│   └── tests/
├── backend/           # Node.js backend
│   ├── src/
│   └── tests/
├── infrastructure/   # Terraform IaC
└── .github/          # GitHub workflows and templates
```

## Questions?

- Open an issue for bugs or feature requests
- Check existing documentation
- Ask in discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

