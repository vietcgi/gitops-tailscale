/**
 * GitOps Tailscale Infrastructure
 *
 * This is the main entry point for managing your Tailscale tailnet with Pulumi.
 * All resources are modular and can be enabled/disabled via configuration.
 */

import * as pulumi from "@pulumi/pulumi";

// Import all infrastructure modules
import { createAcl, AclOutputs } from "./acl";
import { createDnsConfiguration, DnsOutputs } from "./dns";
import { createAuthKeys, KeyOutputs } from "./keys";
import { createTailnetSettings, SettingsOutputs } from "./settings";

// Get configuration
const config = new pulumi.Config();

// =============================================================================
// ACL Configuration
// =============================================================================
const aclOutputs: AclOutputs = createAcl();

// =============================================================================
// DNS Configuration
// =============================================================================
const dnsOutputs: DnsOutputs = createDnsConfiguration();

// =============================================================================
// Auth Keys (for automated device onboarding)
// =============================================================================
const keyOutputs: KeyOutputs = createAuthKeys();

// =============================================================================
// Tailnet Settings
// =============================================================================
const settingsOutputs: SettingsOutputs = createTailnetSettings();

// =============================================================================
// Stack Outputs
// =============================================================================

// Export ACL info
export const aclId = aclOutputs.aclId;

// Export DNS info
export const magicDnsEnabled = dnsOutputs.magicDnsEnabled;
export const dnsSearchPaths = dnsOutputs.searchPaths;

// Export key info (secret values are automatically redacted)
export const reusableAuthKeyId = keyOutputs.reusableKeyId;
export const reusableAuthKeyExpiry = keyOutputs.reusableKeyExpiry;

// Export settings
export const tailnetSettingsId = settingsOutputs.settingsId;
