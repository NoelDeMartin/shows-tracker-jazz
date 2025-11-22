# Sort Imports

## Overview

Sort imports in all modified files (check git status) according to the rules below.

## Sorting Rules

Apply these rules in the order listed:

### 1. Group by Source (separated by blank lines)

- External packages (e.g., `react`, `axios`)
- Project imports (starting with `@/`)
- Relative imports (starting with `./` or `../`)

### 2. Within Each Group, Organize by Import Category

- Side-effect imports (e.g., `import './styles.css'`)
- Regular imports
- Type imports (e.g., `import type { Foo } from 'bar'`)

### 3. Within Each Category, Sort by Import Type (HIERARCHY TAKES PRECEDENCE)

**The import type hierarchy ALWAYS takes precedence over alphabetical sorting:**

- Star imports: `import * as Foo from 'foo'`
- Default imports: `import Foo from 'foo'`
- Named imports: `import { Bar, Baz } from 'foo'`

### 4. Within Each Import Type, Sort Alphabetically (case-sensitive)

- Sort by the **imported identifier**, not the module path
- Star imports: sort by namespace name (e.g., `* as React` → sort by `React`)
- Default imports: sort by default name (e.g., `import React` → sort by `React`)
- Named imports: sort by first identifier in `{}` (e.g., `{ Bar, Foo }` → sort by `Bar`)

### 5. Within Named Import Braces, Sort Alphabetically

Always sort identifiers inside `{}` alphabetically: `import { a, b, c } from 'foo'`

## Example

```typescript
import * as ReactQuery from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { AxiosError } from 'axios';
import type { ComponentProps } from 'react';

import Card from '@/components/shadcn/card';
import Dialog from '@/components/shadcn/dialog';
import { Button } from '@/components/shadcn/button';
import { Show } from '@/schemas/Show';
import type { CardProps } from '@/components/shadcn/card';
import type { ShowSchema } from '@/schemas/Show';

import './styles.css';
import Component from './Component';
import { helper } from './helper';
import { utils } from './utils';
import type { HelperType } from './helper';
```

## Key Reminder: Hierarchy Over Alphabetical

**Correct** (default before named):

```typescript
import z from 'zod';
import { co } from 'jazz-tools';
```

**Incorrect** (alphabetical by module path):

```typescript
import { co } from 'jazz-tools'; // ❌ Named import should not come before default
import z from 'zod';
```
