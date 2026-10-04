import path from 'node:path'

import { createAccessibilityConfig } from '@syntopica/eslint-config/accessibility'
import { createBaseConfig } from '@syntopica/eslint-config/base'
import { createCodeQualityConfig } from '@syntopica/eslint-config/code-quality'
import { createTailwindConfig } from '@syntopica/eslint-config/tailwind'
import { createViteReactConfig } from '@syntopica/eslint-config/vite-react'
import prettier from 'eslint-config-prettier'

// Layer order: base → framework → code-quality → accessibility → tailwind

export default [
  ...createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  ...createViteReactConfig(),
  ...createCodeQualityConfig(),
  ...createAccessibilityConfig(),
  ...createTailwindConfig({ cssConfigPath: './src/styles.css' }),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: {
        config: path.join(import.meta.dirname, 'src/styles.css'),
      },
    },
  },
  // A labelled region that scrolls horizontally must take keyboard focus
  // (axe scrollable-region-focusable), so regions may carry tabIndex.
  {
    files: ['**/*.tsx'],
    rules: {
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'region'] },
      ],
    },
  },
  // Entry-point bootstrap files are allowed multiple top-level statements
  {
    files: ['src/main.tsx', 'src/main.ts'],
    rules: {
      'code-policy/atomic-file': 'off',
    },
  },
  // React Three Fiber JSX attributes belong to Three objects, not DOM nodes.
  {
    files: [
      'src/screens/home/OrbitCanvas.tsx',
      'src/screens/home/OrbitCore.tsx',
      'src/screens/home/OrbitTrack.tsx',
      'src/screens/home/OrbitSatellite3d.tsx',
      'src/screens/home/OrbitDust.tsx',
      'src/screens/home/OrbitGlow.tsx',
      'src/screens/home/OrbitTrail.tsx',
      'src/screens/home/OrbitPulseRing.tsx',
      'src/screens/brain/GraphScene3d.tsx',
      'src/screens/brain/SceneEdges3d.tsx',
      'src/screens/brain/SceneLabel3d.tsx',
      'src/screens/brain/SceneNodes3d.tsx',
    ],
    rules: {
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            'args',
            'rotation',
            'intensity',
            'distance',
            'emissive',
            'emissiveIntensity',
            'roughness',
            'transparent',
            'depthWrite',
            'map',
            'blending',
            'attach',
            'sizeAttenuation',
            'side',
            'uniforms',
            'vertexShader',
            'fragmentShader',
            'position',
            'geometry',
            'center',
            'depthTest',
            'renderOrder',
          ],
        },
      ],
    },
  },
  // Declaration files require `interface` for module augmentation (Vite env,
  // vitest matchers) and mirror upstream `any` generics — language constraints.
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  // Disable formatting rules that conflict with Prettier. Must be last.
  prettier,
]
