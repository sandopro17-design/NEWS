/**
 * GitHub Pages serves 404.html for unknown paths. Copying the SPA shell lets
 * client-side routes (e.g. /NEWS/feed) work on hard refresh / deep links.
 */
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
copyFileSync(resolve(root, 'dist/index.html'), resolve(root, 'dist/404.html'))
