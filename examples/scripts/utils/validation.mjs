import { $ } from "execa"
import ora from "ora"

import { confirmWithUser } from "./helpers.mjs"
import {
  MYORG_API_SCOPES,
  MYACCOUNT_API_SCOPES_DESIRED,
} from "./resource-servers.mjs"

/**
 * Check Node.js version
 */
export function checkNodeVersion() {
  if (process.version.replace("v", "").split(".")[0] < 20) {
    console.error(
      "❌ Node.js version 20 or later is required to run this script."
    )
    process.exit(1)
  }
}

/**
 * Check Auth0 CLI is installed
 */
export async function checkAuth0CLI() {
  const cliCheck = ora({
    text: `Checking that the Auth0 CLI has been installed`,
  }).start()

  try {
    await $`auth0 --version`
    cliCheck.succeed()
  } catch {
    cliCheck.fail(
      "The Auth0 CLI must be installed: https://github.com/auth0/auth0-cli"
    )
    process.exit(1)
  }
}

/**
 * Validate tenant configuration
 * @param {string} tenantName - Required tenant name from command line argument
 */
export async function validateTenant(tenantName) {
  if (!tenantName) {
    console.error("\n❌ Error: Tenant name is required")
    console.error("\nUsage: node scripts/bootstrap.mjs <tenant-domain>")
    console.error("\nExample:")
    console.error("   node scripts/bootstrap.mjs my-tenant.us.auth0.com")
    console.error(
      "\nThis is a safety measure to prevent accidentally configuring the wrong tenant."
    )
    process.exit(1)
  }

  const spinner = ora({
    text: `Validating tenant: ${tenantName}`,
  }).start()

  try {
    // Get current tenant from CLI
    // NOTE: we're outputting as CSV here due to a bug in the Auth0 CLI that doesn't respect the --json flag
    // https://github.com/auth0/auth0-cli/pull/1002
    const tenantSettingsArgs = ["tenants", "list", "--csv", "--no-input"]
    const { stdout } = await $`auth0 ${tenantSettingsArgs}`

    // parse the CSV to get the current active tenant (skip the first line)
    // and get the one that starts with the "→" symbol
    const cliDomain = stdout
      .split("\n")
      .slice(1)
      .find((line) => line.includes("→"))
      ?.split(",")[1]
      ?.trim()

    if (!cliDomain) {
      spinner.fail("No active tenant found in Auth0 CLI")
      console.error("\n❌ Please login to Auth0 CLI first:")
      console.error("   1. Run: auth0 login")
      console.error(
        "   2. If you have multiple tenants, run: auth0 tenants use <tenant-domain>"
      )
      console.error(
        "\nNote: If you're on a private cloud instance, you may need to pass --domain flag"
      )
      process.exit(1)
    }

    // Verify the provided tenant name matches the CLI active tenant
    if (tenantName !== cliDomain) {
      spinner.fail("Tenant mismatch detected")
      console.error(`\n❌ Tenant mismatch:`)
      console.error(`   Requested tenant: ${tenantName}`)
      console.error(`   CLI is using:     ${cliDomain}`)
      console.error("\nPlease ensure you're using the correct tenant:")
      console.error(`   Run: auth0 tenants use ${tenantName}`)
      console.error(
        "\nThis is a safety measure to prevent accidentally configuring the wrong tenant."
      )
      process.exit(1)
    }

    spinner.succeed(`Validated tenant: ${cliDomain}`)
    return cliDomain
  } catch (e) {
    spinner.fail("Failed to validate tenant")
    console.error(e)
    process.exit(1)
  }
}

/**
 * Validate that required API scopes are available on the tenant
 * Changes from hard fail to soft warning - if API is missing, warns user and offers to continue without that feature
 * @param {object} resources - Discovered resources from the tenant
 * @param {string} domain - The tenant domain
 * @param {object} featureConfig - Feature configuration { enableMyOrg, enableMyAccount }
 * @returns {Promise<object>} Updated featureConfig after user decisions
 */
export async function validateRequiredScopes(resources, domain, featureConfig) {
  const spinner = ora({
    text: `Validating required API scopes`,
  }).start()

  const warnings = []
  const updatedConfig = { ...featureConfig }

  // Check My Organization API scopes (only if enabled)
  if (featureConfig.enableMyOrg) {
    const myOrgApi = resources.resourceServers.find(
      (rs) => rs.identifier === `https://${domain}/my-org/`
    )

    if (!myOrgApi) {
      warnings.push({
        api: "My Organization API",
        feature: "enableMyOrg",
        issue: "API not found on tenant",
        suggestion: "Ensure your tenant has the My Organization feature enabled",
        continueMessage: "Continue with User Self-Service only?",
      })
    } else {
      const availableMyOrgScopes = myOrgApi.scopes?.map((s) => s.value) || []
      const missingMyOrgScopes = MYORG_API_SCOPES.filter(
        (scope) => !availableMyOrgScopes.includes(scope)
      )
      if (missingMyOrgScopes.length > 0) {
        warnings.push({
          api: "My Organization API",
          feature: "enableMyOrg",
          issue: `Missing ${missingMyOrgScopes.length} required scope(s)`,
          missing: missingMyOrgScopes,
          suggestion: "Contact Auth0 support to enable these scopes on your tenant",
          continueMessage: "Continue with User Self-Service only?",
        })
      }
    }
  }

  // Check My Account API scopes (only if enabled)
  if (featureConfig.enableMyAccount) {
    const myAccountApi = resources.resourceServers.find(
      (rs) => rs.identifier === `https://${domain}/me/`
    )

    if (!myAccountApi) {
      warnings.push({
        api: "My Account API",
        feature: "enableMyAccount",
        issue: "API not found on tenant",
        suggestion: "Ensure your tenant has the My Account feature enabled (may require beta access)",
        continueMessage: "Continue with Organization Management only?",
      })
    } else {
      const availableMyAccountScopes = myAccountApi.scopes?.map((s) => s.value) || []
      const missingMyAccountScopes = MYACCOUNT_API_SCOPES_DESIRED.filter(
        (scope) => !availableMyAccountScopes.includes(scope)
      )
      if (missingMyAccountScopes.length > 0) {
        warnings.push({
          api: "My Account API",
          feature: "enableMyAccount",
          issue: `Missing ${missingMyAccountScopes.length} required MFA scope(s)`,
          missing: missingMyAccountScopes,
          available: availableMyAccountScopes,
          suggestion: "Contact Auth0 support to enable these scopes on your tenant",
          continueMessage: "Continue with Organization Management only?",
        })
      }
    }
  }

  // Process warnings with graceful degradation
  if (warnings.length > 0) {
    spinner.warn("Some API scope issues detected")

    for (const warning of warnings) {
      console.log("")
      console.log(`⚠️  ${warning.api}`)
      console.log(`   Issue: ${warning.issue}`)
      if (warning.missing) {
        console.log(`   Missing scopes:`)
        warning.missing.forEach((scope) => console.log(`     - ${scope}`))
      }
      if (warning.available && warning.available.length > 0) {
        console.log(`   Available scopes:`)
        warning.available.forEach((scope) => console.log(`     - ${scope}`))
      }
      console.log(`   Suggestion: ${warning.suggestion}`)
      console.log("")

      // Check if we have another feature to fall back to
      const canContinue =
        (warning.feature === "enableMyOrg" && updatedConfig.enableMyAccount) ||
        (warning.feature === "enableMyAccount" && updatedConfig.enableMyOrg)

      if (canContinue) {
        const continueWithout = await confirmWithUser(warning.continueMessage)
        if (continueWithout) {
          updatedConfig[warning.feature] = false
          console.log(`   → Disabled ${warning.api} configuration`)
        } else {
          console.error("\n❌ Bootstrap cancelled. Please resolve the issues above before continuing.\n")
          process.exit(1)
        }
      } else {
        // No fallback available, must exit
        console.error("\n❌ Cannot continue without at least one feature enabled.")
        console.error("   Please resolve the issues above before running the bootstrap script.\n")
        process.exit(1)
      }
    }

    // Verify we still have at least one feature enabled
    if (!updatedConfig.enableMyOrg && !updatedConfig.enableMyAccount) {
      console.error("\n❌ No features are enabled. Cannot proceed with bootstrap.\n")
      process.exit(1)
    }

    return updatedConfig
  }

  spinner.succeed("Required API scopes are available")
  return updatedConfig
}
