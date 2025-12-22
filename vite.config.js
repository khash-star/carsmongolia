import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import obfuscator from 'rollup-plugin-obfuscator'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    // Production build тохиргоо
    minify: 'terser', // Terser ашиглах (илүү сайн minification)
    sourcemap: false, // Source map идэвхгүй болгох (код хамгаалалт)
    terserOptions: {
      compress: {
        drop_console: true, // console.log устгах
        drop_debugger: true, // debugger устгах
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Тодорхой функцүүдийг устгах
      },
      format: {
        comments: false, // Комментар устгах
      },
    },
    rollupOptions: {
      plugins: [
        // Production build дээр л obfuscation хийх
        process.env.NODE_ENV === 'production' && obfuscator({
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: false, // Development-д асуудал үүсгэж болно
          debugProtectionInterval: 0,
          disableConsoleOutput: true, // console.log устгах
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false,
          selfDefending: true, // Код-ыг хамгаалах
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 10,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayEncoding: ['base64'],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 4,
          stringArrayWrappersType: 'function',
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        })
      ].filter(Boolean), // undefined утгуудыг арилгах
      output: {
        // Chunk нэрүүдийг хамгаалах
        manualChunks: undefined,
        // Файлын нэрүүдийг хамгаалах
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
    // Chunk size-ийг багасгах
    chunkSizeWarningLimit: 1000,
  },
}) 