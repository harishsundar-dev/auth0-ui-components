import CodeBlock from '../components/CodeBlock';

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

        {/* Option 1: styles.css */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
              Recommended
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">styles.css</code>
            </h3>
          </div>
          <p className="text-gray-600">
            A self-contained, pre-compiled stylesheet. All Tailwind utilities are bundled in — no
            Tailwind installation or configuration required in your app.
          </p>
          <CodeBlock code={`import '@auth0/universal-components-react/styles';`} language="tsx" />
        </div>

        {/* Option 2: Tailwind v4 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Tailwind apps
            </span>
            <h3 className="text-lg font-semibold text-gray-900">Tailwind v4 theme variables</h3>
          </div>
          <p className="text-gray-600">
            If your app already runs Tailwind v4, define the Auth0 design tokens in your{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">@theme</code> block using the{' '}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--auth0-</code> prefix. The
            components read these variables at runtime, so Tailwind generates them as part of your
            normal build. See the full token list in the{' '}
            <a href="#css-variables" className="text-blue-600 hover:underline">
              CSS Variables
            </a>{' '}
            section below.
          </p>
          <CodeBlock
            code={`/* app.css */
@import "tailwindcss";

@theme {
  --auth0-background: oklch(100% 0 0);
  --auth0-foreground: oklch(9% 0 0);
  --auth0-primary:    oklch(37% 0 0);
  /* ... see CSS Variables section for the full list */
}`}
            language="css"
            title="app.css"
          />
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
      <section id="css-variables" className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">CSS Variables</h2>
        <p className="text-gray-600">
          All colors, border radii, and font sizes are driven by CSS custom properties prefixed with{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--auth0-</code>. The table below
          lists every token with its light and dark defaults.
        </p>

        <h3 className="text-lg font-medium text-gray-900">Color variables</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                  Variable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                  Light default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">
                  Dark default
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used for
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                [
                  '--auth0-background',
                  'oklch(100% 0 0)',
                  'oklch(13% 0 0)',
                  'Page / container background',
                ],
                ['--auth0-foreground', 'oklch(9% 0 0)', 'oklch(96% 0 0)', 'Default text color'],
                [
                  '--auth0-primary',
                  'oklch(37% 0 0)',
                  'oklch(70% 0 0)',
                  'Primary action color (buttons, links, active states)',
                ],
                [
                  '--auth0-primary-foreground',
                  'oklch(100% 0 0)',
                  'oklch(9% 0 0)',
                  'Text on primary-colored surfaces',
                ],
                [
                  '--auth0-secondary',
                  'oklch(96% 0 0)',
                  'oklch(22% 0 0)',
                  'Secondary surfaces and subtle backgrounds',
                ],
                [
                  '--auth0-secondary-foreground',
                  'oklch(100% 0 0)',
                  'oklch(96% 0 0)',
                  'Text on secondary surfaces',
                ],
                [
                  '--auth0-muted',
                  'oklch(96% 0 0)',
                  'oklch(22% 0 0)',
                  'Muted / disabled backgrounds',
                ],
                [
                  '--auth0-muted-foreground',
                  'oklch(45% 0 0)',
                  'oklch(60% 0 0)',
                  'Muted / placeholder text',
                ],
                [
                  '--auth0-accent',
                  'oklch(97% 0 0)',
                  'oklch(25% 0 0)',
                  'Hover and highlight backgrounds',
                ],
                [
                  '--auth0-accent-foreground',
                  'oklch(9% 0 0)',
                  'oklch(96% 0 0)',
                  'Text on accent surfaces',
                ],
                [
                  '--auth0-destructive',
                  'oklch(93% 0.03 17)',
                  'oklch(25% 0.05 17)',
                  'Error and destructive action color',
                ],
                [
                  '--auth0-destructive-foreground',
                  'oklch(36% 0.14 17)',
                  'oklch(80% 0.08 17)',
                  'Text on destructive surfaces',
                ],
                ['--auth0-card', 'oklch(100% 0 0)', 'oklch(17% 0 0)', 'Card background'],
                ['--auth0-card-foreground', 'oklch(0% 0 0)', 'oklch(96% 0 0)', 'Text inside cards'],
                [
                  '--auth0-popover',
                  'oklch(100% 0 0)',
                  'oklch(17% 0 0)',
                  'Popover / dropdown / dialog background',
                ],
                [
                  '--auth0-popover-foreground',
                  'oklch(9% 0 0)',
                  'oklch(96% 0 0)',
                  'Text inside popovers',
                ],
                ['--auth0-input', 'oklch(100% 0 0)', 'oklch(22% 0 0)', 'Input field background'],
                ['--auth0-border', 'oklch(89% 0 0)', 'oklch(30% 0 0)', 'Border color'],
                ['--auth0-ring', 'oklch(89% 0 0)', 'oklch(40% 0 0)', 'Focus ring color'],
              ].map(([variable, light, dark, description]) => (
                <tr key={variable}>
                  <td className="px-4 py-2 font-mono text-xs text-violet-700 whitespace-nowrap">
                    {variable}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {light}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500 whitespace-nowrap">
                    {dark}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dark mode */}
        <h3 className="text-lg font-medium text-gray-900">Dark mode</h3>
        <p className="text-gray-600">
          Set <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">themeSettings.mode</code> to{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">"dark"</code> on{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">Auth0ComponentProvider</code> to
          switch to the built-in dark palette. To customise dark mode colors, override the{' '}
          <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">--auth0-*</code> variables
          inside a <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">.dark</code> selector
          (or your app's equivalent dark mode scope).
        </p>
        <CodeBlock
          code={`/* In your root CSS, use the dark variant */
@theme {
  /* light tokens ... */
}

.dark {
  --auth0-background: oklch(13% 0 0);
  --auth0-foreground: oklch(96% 0 0);
  --auth0-primary:    oklch(70% 0 0);
  --auth0-card:       oklch(17% 0 0);
  --auth0-border:     oklch(30% 0 0);
  /* ... other tokens from the table above */
}`}
          language="css"
          title="Tailwind v4 dark mode overrides"
        />

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
