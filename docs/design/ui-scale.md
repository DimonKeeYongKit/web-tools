# UI Scale Guidelines

This document defines the default UI sizing and spacing standards for this project.

## Scope

- All pages under app/**/page.tsx.
- Shared controls under app/components.

## Typography

- Page/section title: text-lg md:text-xl.
- Large page title exception (compound interest): text-xl md:text-2xl.
- Field labels and card titles: text-xs md:text-sm.
- Description/body text: text-xs md:text-sm.
- Helper and dense metadata: text-xs.
- Monospace output text: text-xs md:text-sm.

## Layout And Spacing

- Main page paddings: px-4 md:px-5 and py-6 md:py-8.
- Standard gaps: gap-3.
- Dense button groups: gap-2.5.
- Card paddings: p-4 md:p-5.

## Controls

- Inputs/selects: px-2.5 py-1.5.
- Main buttons: px-3.5 py-1.5 or px-4 py-2.
- Compact row action buttons: px-2.5 py-1.5.

## Containers

- Home and data-dense pages: max-w-4xl.
- Form-heavy tool pages: max-w-2xl to max-w-3xl.

## Shared Components

- NavBar: max-w-4xl, compact vertical sizing.
- Language/theme toggles: h-8 class family.
- NumberInput: compact sizing with text-xs md:text-sm.
