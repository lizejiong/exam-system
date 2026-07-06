# ESLint 与 TS 稳定化实施计划

> **执行方式**: inline
**目标**: 降低 `apps/user` 等应用在日常开发中遇到的 ESLint / TypeScript 误报和打断感，同时保留对真实问题的基本约束。

**架构**: 保留根 `tsconfig.json` 作为编译基线，新增一个只给 ESLint 使用的 `tsconfig.eslint.json`，让 lint 的类型分析范围可控且稳定。ESLint 采用“基础语法规则 + 源码类型规则 + 测试/配置文件降噪”的分层配置，避免把 type-aware 规则强压到所有文件。

**技术栈**: TypeScript、`eslint.config.mjs` Flat Config、`typescript-eslint`、Nest monorepo。

---

### 任务 1: 新增 ESLint 专用 tsconfig

**文件**:
- 新建 `tsconfig.eslint.json`

- [ ] **步骤 1: 写入专用 lint 配置**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["apps/**/*.ts", "libs/**/*.ts"],
  "exclude": ["dist", "coverage", "node_modules"]
}
```

- [ ] **步骤 2: 校验 lint 专用项目能被 TypeScript 解析**

Run: `pnpm.cmd exec tsc -p tsconfig.eslint.json --noEmit`

Expected: 无模块解析错误，且不会输出编译产物。

---

### 任务 2: 重构 ESLint 分层配置

**文件**:
- 修改 `eslint.config.mjs`

- [ ] **步骤 1: 改为基础规则默认启用，类型规则只作用于源码**

```js
// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['apps/**/*.ts', 'libs/**/*.ts'],
  })),
  {
    files: ['**/*.{spec,test}.ts', '**/*.config.ts', '**/main.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
```

- [ ] **步骤 2: 运行 eslint 只验证当前仓库源码**

Run: `pnpm.cmd exec eslint apps/user/src/user.controller.ts apps/user/src/user.module.ts libs/redis/src/redis.module.ts libs/redis/src/redis.service.ts`

Expected: 退出码为 `0`，若存在真实问题只输出 warning，不阻断开发。

---

### 任务 3: 回归验证

**文件**:
- 无新增文件

- [ ] **步骤 1: 用 TypeScript 编译验证路径别名和模块解析**

Run: `pnpm.cmd exec tsc -p apps/user/tsconfig.app.json --noEmit`

Expected: `@app/redis` 能被正确解析，且 `apps/user` 源码无新的 TS 报错。

- [ ] **步骤 2: 复跑 ESLint，确认不再出现会中断开发的错误**

Run: `pnpm.cmd exec eslint apps/user/src/user.controller.ts apps/user/src/user.module.ts libs/redis/src/redis.module.ts libs/redis/src/redis.service.ts`

Expected: 只有 warning 或无输出，命令退出码为 `0`。
