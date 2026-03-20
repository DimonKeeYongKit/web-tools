# SKILL: Add a new tool to the web-tools project

## Description

This skill adds a new external tool to the dashboard. It involves updating the `toolsMeta` array in `app/page.tsx` and adding the corresponding translations in `app/i18n/translations.ts`. The skill uses Google's favicon service to fetch the icon for external links.

## Steps

1.  **Ask for tool details**:
    *   Tool ID (e.g., `ifixit`)
    *   URL (e.g., `https://www.ifixit.com/`)
    *   Domain for favicon (e.g., `www.ifixit.com`)
    *   Chinese Title and Description
    *   English Title and Description

2.  **Update `app/i18n/translations.ts`**:
    *   Add the new tool's translations to both the `zh.home.tools` and `en.home.tools` objects.

    ```typescript
    // ... existing tools
    [tool_id]: {
      title: "[Chinese Title]",
      description: "[Chinese Description]",
    },
    // ...
    ```

    ```typescript
    // ... existing tools
    [tool_id]: {
      title: "[English Title]",
      description: "[English Description]",
    },
    // ...
    ```

3.  **Update `app/page.tsx`**:
    *   Add a new entry to the `toolsMeta` array.
    *   Construct the `icon` URL using the provided domain.
    *   Ensure `isExternal: true` is set for external links.
    *   Choose a color for the border (e.g., `hover:border-gray-400 dark:hover:border-gray-500`).

    ```typescript
    // ...
    const toolsMeta: { id: ToolId; icon: string; href: string; color: string; isExternal?: boolean }[] = [
      // ... existing tools
      { 
        id: "[tool_id]", 
        icon: "https://www.google.com/s2/favicons?domain=[domain_for_favicon]", 
        href: "[url]", 
        color: "hover:border-gray-400 dark:hover:border-gray-500", 
        isExternal: true 
      },
    ];
    // ...
    ```

## Example Invocation

"Add a new tool with ID 'ifixit', URL 'https://www.ifixit.com/', and domain 'www.ifixit.com'. The Chinese title is 'iFixit' with description '免费的维修手册，适用于任何物品'. The English title is 'iFixit' with description 'The free repair manual for everything'."
