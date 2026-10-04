import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    // jsdom route renders are CPU-bound: the slowest test takes about 1.2 s at
    // load 28, and three that take 0.1-0.6 s passed 5 s at load 40-75 while
    // other sessions shared the machine. None waits on a real timer or process.
    testTimeout: 15_000,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/main.tsx',
        'src/layout/layoutWorker.ts',
        'src/vite-env.d.ts',
        // WebGL scene behavior is covered by the desktop browser spec.
        'src/geometry/createOrbitGlowTexture.ts',
        'src/geometry/updateOrbitWave.ts',
        'src/hooks/useOrbitCore.ts',
        'src/hooks/useOrbitDust.ts',
        'src/hooks/useOrbitGlowTexture.ts',
        'src/hooks/useOrbitLabelLayout.ts',
        'src/hooks/useOrbitTrail.ts',
        'src/screens/home/OrbitCamera.tsx',
        'src/screens/home/OrbitCanvas.tsx',
        'src/screens/home/OrbitCore.tsx',
        'src/screens/home/OrbitDust.tsx',
        'src/screens/home/OrbitGlow.tsx',
        'src/screens/home/OrbitLabel.tsx',
        'src/screens/home/OrbitLabelLayout.tsx',
        'src/screens/home/OrbitPulseRing.tsx',
        'src/screens/home/OrbitSatellite3d.tsx',
        'src/screens/home/OrbitSatellites.tsx',
        'src/screens/home/OrbitScene.tsx',
        'src/screens/home/OrbitSceneLazy.tsx',
        'src/screens/home/OrbitTrack.tsx',
        'src/screens/home/OrbitTrail.tsx',
        'src/screens/home/OrbitVisibility.ts',
        'src/screens/home/orbitCoreFragmentShader.ts',
        'src/screens/home/orbitCoreVertexShader.ts',
        'src/hooks/useOrbitLabels.ts',
        'src/hooks/useOrbitSatellite3d.ts',
        'src/graph/createLabelTexture.ts',
        'src/hooks/useEdgeGeometry3d.ts',
        'src/hooks/useLabelTexture.ts',
        'src/hooks/useOrbitControls3d.ts',
        'src/hooks/useScene3d.ts',
        'src/hooks/useSceneInstances3d.ts',
        'src/screens/brain/GraphScene3d.tsx',
        'src/screens/brain/SceneControls3d.tsx',
        'src/screens/brain/SceneEdges3d.tsx',
        'src/screens/brain/SceneLabel3d.tsx',
        'src/screens/brain/SceneLabels3d.tsx',
        'src/screens/brain/SceneNodes3d.tsx',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
})
