---
name: arrow-functions
description: Coding style guideline - all functions should be declared as arrow functions assigned to const variables, not using the function keyword
---

## Arrow Function Style Guideline

All functions in this codebase must be written as arrow functions assigned to `const` variables. Do not use `function` declarations or `function` expressions.

**Correct:**
```typescript
const greet = (name: string): string => {
  return `Hello, ${name}`;
};

const double = (x: number) => x * 2;
```

**Incorrect:**
```typescript
function greet(name: string): string {
  return `Hello, ${name}`;
}

const double = function(x: number) { return x * 2; };
```

When writing new functions or modifying existing ones, always use the arrow function form. If you encounter `function` declarations in code you are editing, convert them to arrow functions.
