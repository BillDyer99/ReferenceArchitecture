/*
  modules/sql-database.bicep
  --------------------------
  Azure SQL Database (serverless, General Purpose).
  The SQL Server lives in rg-shared and is referenced as an existing resource.
*/

@description('Environment suffix, e.g. "prd" or "dev".')
param environment string

@description('Name of the shared SQL Server.')
param sqlServerName string

@description('Azure region of the shared SQL Server.')
param sqlServerLocation string

// ---------------------------------------------------------------------------
// Reference to shared SQL Server (same scope — this module is deployed
// targeting rg-shared via the parent template's module scope parameter)
// ---------------------------------------------------------------------------

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' existing = {
  name: sqlServerName
}

// ---------------------------------------------------------------------------
// SQL Database — serverless tier matching existing setup
// ---------------------------------------------------------------------------

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: 'sqldb-ref-arch-${environment}'
  location: sqlServerLocation
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 2
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 34359738368   // 32 GB
    autoPauseDelay: 60          // minutes; -1 to disable
    minCapacity: json('0.5')    // minimum vCores when not paused
    requestedBackupStorageRedundancy: 'Local'
  }
}

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------

output databaseName string = sqlDatabase.name
