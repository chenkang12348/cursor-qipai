import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'components.d.ts'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/bots/**/*.{ts,js}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Bot 模块禁止网络请求，请使用本地算法。',
        },
        {
          name: 'XMLHttpRequest',
          message: 'Bot 模块禁止网络请求，请使用本地算法。',
        },
      ],
    },
  },
)
