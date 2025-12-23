---
description: Analyze the codebase with a focus on Atomic Design and Scalability.
---

Component Granularity: Identify repetitive UI patterns that should be abstracted into base components (shadcn/ui extensions) or shared 'Compound Components'.

Design System Consistency: Audit the tailwind.config.js and CSS variables to ensure a unified theme. Check for hardcoded values that bypass the design system.

Logic Decoupling: Separate business logic from UI. Identify where React Server Components (RSC) and Client Components are mixed inefficiently.

Standardization: Check for consistent implementation of Form patterns, Data fetching, and Error handling.

Action Plan: Provide a refactoring map to create a 'Standard Shared Library' within the project to maximize code reuse.