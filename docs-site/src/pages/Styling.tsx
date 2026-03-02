import CodeBlock from '../components/CodeBlock';
import TabbedCodeBlock from '../components/TabbedCodeBlock';

export default function Styling() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-pink-500/10 rounded-xl"></div>
        <div
          className="relative space-y-4 p-6 border-l-4"
          style={{ borderImage: 'linear-gradient(to bottom, rgb(124 58 237), rgb(217 70 239)) 1' }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full"></div>
            <span className="text-sm font-medium text-violet-700 bg-violet-50 px-2 py-1 rounded-full flex items-center">
              <svg
                className="w-3 h-3 text-violet-600 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
              Styling
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Styling & Theming</h1>
          <p className="text-xl text-gray-600">
            Choose the right stylesheet for your setup and customize the look of Auth0 components
            with CSS variables.
          </p>
        </div>
      </div>

      {/* Stylesheet options */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Stylesheet Options</h2>
        <p className="text-gray-600">
          The package ships two stylesheets. Pick the one that matches how your application handles
          CSS.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* styles.css */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                Recommended
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">styles.css</code>
            </h3>
            <p className="text-gray-600 text-sm">
              A self-contained, pre-compiled stylesheet. All Tailwind utilities are bundled in — no
              Tailwind installation or configuration required in your app.
            </p>
            <CodeBlock code={`import '@auth0/universal-components-react/styles';`} language="tsx" />
          </div>

          {/* tailwind.css */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tailwind apps
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tailwind v4 theme variables</h3>
            <p className="text-gray-600 text-sm">
              If your app already runs Tailwind v4, define the Auth0 theme tokens directly in your{' '}
              <code className="text-xs">@theme</code> block using the{' '}
              <code className="text-xs">--auth0-</code> prefix. The components read these variables
              at runtime, so Tailwind generates them as part of your normal build.
            </p>
            <CodeBlock
              code={`/* app.css */
@import "tailwindcss";

@theme {
  --auth0-background: oklch(100% 0 0);
  --auth0-foreground: oklch(9% 0 0);
  --auth0-primary:    oklch(37% 0 0);
  /* ... other tokens */
}`}
              language="css"
              title="app.css"
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>When to use which:</strong> If your app does not use Tailwind, import{' '}
            <code className="text-xs">styles.css</code> — it is self-contained and works without
            Tailwind. If your app uses Tailwind v4, define the{' '}
            <code className="text-xs">--auth0-*</code> tokens in your{' '}
            <code className="text-xs">@theme</code> block so Tailwind generates them alongside your
            other design tokens.
          </p>
        </div>

        <h3 className="text-lg font-medium text-gray-900">Tailwind v4 — full token list</h3>
        <p className="text-gray-600">
          Add all required tokens to your{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">@theme</code> block. The{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--auth0-</code> prefix
          namespaces every token so they never collide with your existing theme.
        </p>
        <CodeBlock
          code={`/* app.css */
@import "tailwindcss";

@theme {
  /* Backgrounds & surfaces */
  --auth0-background:         oklch(100% 0 0);
  --auth0-foreground:         oklch(9% 0 0);
  --auth0-card:               oklch(100% 0 0);
  --auth0-card-foreground:    oklch(0% 0 0);
  --auth0-popover:            oklch(100% 0 0);
  --auth0-popover-foreground: oklch(9% 0 0);
  --auth0-input:              oklch(100% 0 0);

  /* Brand */
  --auth0-primary:            oklch(37% 0 0);
  --auth0-primary-foreground: oklch(100% 0 0);

  /* Secondary / muted / accent */
  --auth0-secondary:             oklch(96% 0 0);
  --auth0-secondary-foreground:  oklch(100% 0 0);
  --auth0-muted:                 oklch(96% 0 0);
  --auth0-muted-foreground:      oklch(45% 0 0);
  --auth0-accent:                oklch(97% 0 0);
  --auth0-accent-foreground:     oklch(9% 0 0);

  /* Destructive */
  --auth0-destructive:            oklch(93% 0.03 17);
  --auth0-destructive-foreground: oklch(36% 0.14 17);

  /* Borders & focus */
  --auth0-border: oklch(89% 0 0);
  --auth0-ring:   oklch(89% 0 0);
}`}
          language="css"
          title="app.css"
        />
      </section>

      {/* Theme configuration */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Theme Configuration</h2>
        <p className="text-gray-600">
          Pass <code className="text-sm bg-gray-100 px-2 py-1 rounded">themeSettings</code> to{' '}
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">Auth0ComponentProvider</code> to
          control the color mode and theme variant.
        </p>

        <CodeBlock
          code={`<Auth0ComponentProvider
  authDetails={authDetails}
  themeSettings={{
    mode: 'light',   // 'light' | 'dark'
    theme: 'default' // 'default' | 'minimal' | 'rounded'
  }}
>
  <App />
</Auth0ComponentProvider>`}
          language="tsx"
        />

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  <code className="text-xs">mode</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">"light" | "dark"</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">"light"</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">Color scheme</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  <code className="text-xs">theme</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">"default" | "minimal" | "rounded"</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">"default"</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  Visual style — <strong>default</strong> is the standard Auth0 look,{' '}
                  <strong>minimal</strong> reduces shadows and borders, <strong>rounded</strong>{' '}
                  increases border radii throughout
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  <code className="text-xs">variables</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  <code className="text-xs">StylingVariables</code>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">—</td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  CSS custom property overrides for branding — see below
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* CSS Variables */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">CSS Variables</h2>
        <p className="text-gray-600">
          All colors, border radii, and font sizes are driven by CSS custom properties prefixed with{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--auth0-</code>. Where you
          override them depends on which stylesheet option you chose:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
          <li>
            <strong>styles.css users</strong> — override inside the{' '}
            <code className="text-xs">.auth0-universal</code> selector to stay scoped.
          </li>
          <li>
            <strong>Tailwind v4 users</strong> — define or override inside your{' '}
            <code className="text-xs">@theme</code> block; Tailwind generates them as part of your
            normal build.
          </li>
        </ul>

        <TabbedCodeBlock
          tabs={[
            {
              label: 'Colors (styles.css)',
              code: `/* Override inside the scoped selector */
.auth0-universal {
  /* Backgrounds & surfaces */
  --auth0-background: oklch(100% 0 0);          /* page background */
  --auth0-foreground: oklch(9% 0 0);            /* default text */
  --auth0-card: oklch(100% 0 0);                /* card background */
  --auth0-card-foreground: oklch(0% 0 0);       /* text inside cards */
  --auth0-popover: oklch(100% 0 0);             /* popover / dropdown / dialog background */
  --auth0-popover-foreground: oklch(9% 0 0);    /* text inside popovers */
  --auth0-input: oklch(100% 0 0);               /* input field background */

  /* Brand */
  --auth0-primary: oklch(37% 0 0);              /* buttons, links, active states */
  --auth0-primary-foreground: oklch(100% 0 0);  /* text on primary surfaces */

  /* Secondary */
  --auth0-secondary: oklch(96% 0 0);
  --auth0-secondary-foreground: oklch(100% 0 0);

  /* Muted */
  --auth0-muted: oklch(96% 0 0);                /* disabled / subtle backgrounds */
  --auth0-muted-foreground: oklch(45% 0 0);     /* placeholder / secondary text */

  /* Accent */
  --auth0-accent: oklch(97% 0 0);               /* hover highlights */
  --auth0-accent-foreground: oklch(9% 0 0);

  /* Destructive */
  --auth0-destructive: oklch(93% 0.03 17);      /* error surfaces */
  --auth0-destructive-foreground: oklch(36% 0.14 17);

  /* Borders & focus */
  --auth0-border: oklch(89% 0 0);
  --auth0-ring: oklch(89% 0 0);
}`,
            },
            {
              label: 'Colors (Tailwind v4)',
              code: `/* Define inside @theme so Tailwind generates the variables */
@theme {
  /* Backgrounds & surfaces */
  --auth0-background: oklch(100% 0 0);          /* page background */
  --auth0-foreground: oklch(9% 0 0);            /* default text */
  --auth0-card: oklch(100% 0 0);                /* card background */
  --auth0-card-foreground: oklch(0% 0 0);       /* text inside cards */
  --auth0-popover: oklch(100% 0 0);             /* popover / dropdown / dialog background */
  --auth0-popover-foreground: oklch(9% 0 0);    /* text inside popovers */
  --auth0-input: oklch(100% 0 0);               /* input field background */

  /* Brand */
  --auth0-primary: oklch(37% 0 0);              /* buttons, links, active states */
  --auth0-primary-foreground: oklch(100% 0 0);  /* text on primary surfaces */

  /* Secondary */
  --auth0-secondary: oklch(96% 0 0);
  --auth0-secondary-foreground: oklch(100% 0 0);

  /* Muted */
  --auth0-muted: oklch(96% 0 0);                /* disabled / subtle backgrounds */
  --auth0-muted-foreground: oklch(45% 0 0);     /* placeholder / secondary text */

  /* Accent */
  --auth0-accent: oklch(97% 0 0);               /* hover highlights */
  --auth0-accent-foreground: oklch(9% 0 0);

  /* Destructive */
  --auth0-destructive: oklch(93% 0.03 17);      /* error surfaces */
  --auth0-destructive-foreground: oklch(36% 0.14 17);

  /* Borders & focus */
  --auth0-border: oklch(89% 0 0);
  --auth0-ring: oklch(89% 0 0);
}`,
            },
            {
              label: 'Border radius',
              code: `:root {
  --radius-xs:  2px;    /* indicators, badges */
  --radius-sm:  4px;    /* tags, chips */
  --radius-md:  6px;    /* small elements */
  --radius-lg:  10px;   /* list items, rows */
  --radius-xl:  12px;   /* inputs, buttons */
  --radius-2xl: 14px;   /* medium containers */
  --radius-3xl: 16px;   /* cards, panels */
  --radius-4xl: 20px;   /* large cards */
  --radius-5xl: 24px;   /* popovers, dropdowns */
  --radius-6xl: 32px;   /* large popovers */
  --radius-7xl: 40px;   /* extra large containers */
  --radius-8xl: 48px;   /* full-page panels */
  --radius-9xl: 56px;   /* dialogs, modals */
}`,
            },
            {
              label: 'Font sizes',
              code: `:root {
  --font-size-page-header:      2.25rem;   /* main page title */
  --font-size-page-description: 0.875rem;  /* page subtitle */
  --font-size-heading:          1.5rem;    /* section headings */
  --font-size-title:            1.25rem;   /* card / panel titles */
  --font-size-subtitle:         1.125rem;  /* secondary headings */
  --font-size-body:             1rem;      /* body text */
  --font-size-paragraph:        0.875rem;  /* descriptions */
  --font-size-label:            0.875rem;  /* form labels */
}`,
            },
          ]}
          language="css"
          title="Available CSS variables"
        />

        <h3 className="text-lg font-medium text-gray-900">Color variables</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Variable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used for
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                ['--auth0-background', 'Page / container background'],
                ['--auth0-foreground', 'Default text color'],
                ['--auth0-primary', 'Primary action color (buttons, links, active states)'],
                ['--auth0-primary-foreground', 'Text on primary-colored surfaces'],
                ['--auth0-secondary', 'Secondary surfaces and subtle backgrounds'],
                ['--auth0-secondary-foreground', 'Text on secondary surfaces'],
                ['--auth0-muted', 'Muted / disabled backgrounds'],
                ['--auth0-muted-foreground', 'Muted / placeholder text'],
                ['--auth0-accent', 'Hover and highlight backgrounds'],
                ['--auth0-accent-foreground', 'Text on accent surfaces'],
                ['--auth0-destructive', 'Error and destructive action color'],
                ['--auth0-destructive-foreground', 'Text on destructive surfaces'],
                ['--auth0-card', 'Card background'],
                ['--auth0-card-foreground', 'Text inside cards'],
                ['--auth0-popover', 'Popover / dropdown / dialog background'],
                ['--auth0-popover-foreground', 'Text inside popovers'],
                ['--auth0-input', 'Input field background'],
                ['--auth0-border', 'Border color'],
                ['--auth0-ring', 'Focus ring color'],
              ].map(([variable, description]) => (
                <tr key={variable}>
                  <td className="px-4 py-2 font-mono text-xs text-violet-700 whitespace-nowrap">
                    {variable}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium text-gray-900">Border radius variables</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Variable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                ['--radius-xs', '2px', 'Indicators, badges'],
                ['--radius-sm', '4px', 'Tags, chips'],
                ['--radius-md', '6px', 'Small elements'],
                ['--radius-lg', '10px', 'List items, rows'],
                ['--radius-xl', '12px', 'Inputs, buttons'],
                ['--radius-2xl', '14px', 'Medium containers'],
                ['--radius-3xl', '16px', 'Cards, panels'],
                ['--radius-4xl', '20px', 'Large cards'],
                ['--radius-5xl', '24px', 'Popovers, dropdowns'],
                ['--radius-6xl', '32px', 'Large popovers'],
                ['--radius-7xl', '40px', 'Extra large containers'],
                ['--radius-8xl', '48px', 'Full-page panels'],
                ['--radius-9xl', '56px', 'Dialogs, modals'],
              ].map(([variable, defaultValue, usage]) => (
                <tr key={variable}>
                  <td className="px-4 py-2 font-mono text-xs text-violet-700 whitespace-nowrap">
                    {variable}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{defaultValue}</td>
                  <td className="px-4 py-2 text-gray-600">{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-medium text-gray-900">Font size variables</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Variable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                  Default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used for
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                ['--font-size-page-header', '2.25rem', 'Main page title'],
                ['--font-size-page-description', '0.875rem', 'Page subtitle'],
                ['--font-size-heading', '1.5rem', 'Section headings'],
                ['--font-size-title', '1.25rem', 'Card / panel titles'],
                ['--font-size-subtitle', '1.125rem', 'Secondary headings'],
                ['--font-size-body', '1rem', 'Body text'],
                ['--font-size-paragraph', '0.875rem', 'Descriptions'],
                ['--font-size-label', '0.875rem', 'Form labels'],
              ].map(([variable, defaultValue, description]) => (
                <tr key={variable}>
                  <td className="px-4 py-2 font-mono text-xs text-violet-700 whitespace-nowrap">
                    {variable}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{defaultValue}</td>
                  <td className="px-4 py-2 text-gray-600">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
