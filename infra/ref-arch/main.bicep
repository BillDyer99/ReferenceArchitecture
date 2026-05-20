/*
  ref-arch/main.bicep
  -------------------
  Orchestrates all ref-arch resources for a single environment.
  Deploy once per environment (prd, dev) to the corresponding resource group.

  Deployment order:
    1. Static Web App          — need its hostname for CORS on the API
    2. Monitoring              — need App Insights connection string for Key Vault
    3. App Service             — need its managed identity principal ID for Key Vault
    4. SQL Database            — independent, can deploy in parallel with above
    5. Key Vault               — needs principal ID + App Insights connection string
                                 secrets are stored here; KV refs on App Service
                                 resolve at runtime once role assignment is live

  Note: Key Vault references in App Service app settings resolve at runtime,
  not at deploy time, so the App Service and Key Vault can be deployed in the
  same pass without a circular dependency.
*/

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

@description('Environment suffix. Use "prd" for production, "dev" for development.')
@allowed(['prd', 'dev'])
param environment string

@description('Azure region for all resources except the Static Web App (which is global/eastus2).')
param location string = 'centralus'

@description('App Service Plan SKU. Recommended: F1 (free) for prd, B1 (basic) for dev.')
param appServicePlanSku string = 'F1'

@description('Name of the shared SQL Server (in rg-shared).')
param sqlServerName string = 'sql-billdyer99-001'

@description('Resource group containing the shared SQL Server.')
param sqlServerResourceGroup string = 'rg-shared'

@description('SQL Server administrator login name.')
param sqlAdminLogin string = 'sqladmin'

@description('SQL Server administrator password.')
@secure()
param sqlAdminPassword string

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

#disable-next-line no-hardcoded-env-urls
var sqlServerFqdn = '${sqlServerName}.database.windows.net'
var sqlDbName = 'sqldb-ref-arch-${environment}'

var sqlConnectionString = 'Server=tcp:${sqlServerFqdn},1433;Initial Catalog=${sqlDbName};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'

// ---------------------------------------------------------------------------
// 1. Static Web App — deployed first so we have the hostname for CORS
// ---------------------------------------------------------------------------

module staticWebApp 'modules/static-web-app.bicep' = {
  name: 'staticWebApp'
  params: {
    environment: environment
  }
}

// ---------------------------------------------------------------------------
// 2. Monitoring — deployed before Key Vault (need App Insights connection string)
// ---------------------------------------------------------------------------

module monitoring 'modules/monitoring.bicep' = {
  name: 'monitoring'
  params: {
    location: location
    environment: environment
  }
}

// ---------------------------------------------------------------------------
// 3. App Service — deployed before Key Vault (need managed identity principal ID)
//    Key Vault URI is deterministic so we can pre-compute it here.
// ---------------------------------------------------------------------------

var keyVaultUri = 'https://kv-ref-arch-${environment}${az.environment().suffixes.keyvaultDns}/'

module appService 'modules/app-service.bicep' = {
  name: 'appService'
  params: {
    location: location
    environment: environment
    appServicePlanSku: appServicePlanSku
    keyVaultUri: keyVaultUri
    corsAllowedOrigins: [staticWebApp.outputs.defaultHostname]
  }
}

// ---------------------------------------------------------------------------
// 4. SQL Database — deployed into rg-shared (databases are child resources
//    of the SQL Server and live in the same resource group as the server)
// ---------------------------------------------------------------------------

module sqlDatabase 'modules/sql-database.bicep' = {
  name: 'sqlDatabase'
  scope: resourceGroup(sqlServerResourceGroup)
  params: {
    environment: environment
    sqlServerName: sqlServerName
    sqlServerLocation: location
  }
}

// ---------------------------------------------------------------------------
// 5. Key Vault — depends on App Service (principal ID) and Monitoring (App Insights)
// ---------------------------------------------------------------------------

module keyVault 'modules/keyvault.bicep' = {
  name: 'keyVault'
  params: {
    location: location
    environment: environment
    appServicePrincipalId: appService.outputs.principalId
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    sqlConnectionString: sqlConnectionString
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output appServiceName string = appService.outputs.appServiceName
output appServiceHostname string = appService.outputs.appServiceHostname
output staticWebAppName string = staticWebApp.outputs.staticWebAppName
output staticWebAppHostname string = staticWebApp.outputs.defaultHostname
output keyVaultName string = keyVault.outputs.keyVaultName
output sqlDatabaseName string = sqlDatabase.outputs.databaseName
