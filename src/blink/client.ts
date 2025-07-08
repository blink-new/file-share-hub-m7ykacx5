import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'file-share-hub-m7ykacx5',
  authRequired: false // Allow anonymous file sharing
})