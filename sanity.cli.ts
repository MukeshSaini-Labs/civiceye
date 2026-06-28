import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'yq5z9c9q',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  },
  deployment: {
    appId: 'dkpj8q0cd96f7o23ez3c5aed',
  }
})
