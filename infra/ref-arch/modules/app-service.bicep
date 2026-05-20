/*
  modules/app-service.bicep
  -------------------------
  App Service Plan (Linux) + App Service for the .NET API.
  - System-assigned managed identity enabled
  - Key Vault references for secrets
  - CORS configured for the SWA frontend
  - Zip deploy (WEBSITE_RUN_FROM_PACKAGE)
*/

@description('Azure region for all resources.')
param location string

@description('Environment suffix, e.g. "prd" or "dev".')
param environment string

@description('App Service Plan SKU. F1 for prod (free), B1 for dev (basic).')
param appServicePlanSku string

@description('Key Vault URI for building secret references.')
param keyVaultUri string

@description('Allowed CORS origins (SWA default hostname).')
param corsAllowedOrigins array

// ---------------------------------------------------------------------------
// App Service Plan
// ---------------------------------------------------------------------------

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'asp-ref-arch-${environment}'
  location: location
  kind: 'linux'
  sku: {
    name: appServicePlanSku
  }
  properties: {
    reserved: true  // required for Linux
  }
}

// ---------------------------------------------------------------------------
// App Service
// ---------------------------------------------------------------------------

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-ref-arch-api-${environment}'
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|10.0'
      http20Enabled: true
      minTlsVersion: '1.2'

      // App settings
      appSettings: [
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/AppInsightsConnectionString/)'
        }
        {
          name: 'ApplicationInsightsAgent_EXTENSION_VERSION'
          value: '~3'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'Cors__AllowedOrigins__0'
          value: 'https://${corsAllowedOrigins[0]}'
        }
      ]

      // Connection strings
      connectionStrings: [
        {
          name: 'DefaultConnection'
          connectionString: '@Microsoft.KeyVault(SecretUri=${keyVaultUri}secrets/SqlConnectionString/)'
          type: 'SQLAzure'
        }
      ]
    }
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output appServiceName string = appService.name
output appServiceHostname string = appService.properties.defaultHostName
output principalId string = appService.identity.principalId
