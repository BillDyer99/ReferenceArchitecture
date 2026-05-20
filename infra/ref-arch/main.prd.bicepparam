using './main.bicep'

param environment = 'prd'
param location = 'centralus'
param appServicePlanSku = 'F1'
param sqlServerName = 'sql-billdyer99-001'
param sqlServerResourceGroup = 'rg-shared'
param sqlAdminLogin = 'sqladmin'
param sqlAdminPassword = readEnvironmentVariable('SQL_ADMIN_PASSWORD')
