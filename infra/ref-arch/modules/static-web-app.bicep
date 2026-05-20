/*
  modules/static-web-app.bicep
  ----------------------------
  Azure Static Web App (free tier) for the React frontend.
  Note: the deployment token is available via listSecrets() post-deploy
  and must be stored as a GitHub secret manually or via a pipeline step.
*/

@description('Environment suffix, e.g. "prd" or "dev".')
param environment string

// SWA is a global resource; location 'eastus2' matches existing setup
param location string = 'eastus2'

// ---------------------------------------------------------------------------
// Static Web App
// ---------------------------------------------------------------------------

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: 'stapp-ref-arch-${environment}'
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
    buildProperties: {
      skipGithubActionWorkflowGeneration: true  // we manage our own CI/CD
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output staticWebAppName string = staticWebApp.name
output defaultHostname string = staticWebApp.properties.defaultHostname
