/**
 * Tailscale Tailnet Settings
 *
 * This module manages global tailnet settings:
 * - Device approval requirements
 * - Key expiry policies
 * - Network settings
 *
 * @see https://tailscale.com/kb/1018/acls
 */

import * as pulumi from "@pulumi/pulumi";
import * as tailscale from "@pulumi/tailscale";

export interface SettingsOutputs {
    settingsId: pulumi.Output<string>;
}

/**
 * Creates and manages Tailscale tailnet-wide settings.
 */
export function createTailnetSettings(): SettingsOutputs {
    const config = new pulumi.Config();

    // Get configuration values with defaults
    const devicesNeedApproval = config.getBoolean("devicesNeedApproval") ?? false;
    const networkFlowLoggingEnabled = config.getBoolean("networkFlowLoggingEnabled") ?? false;

    // ==========================================================================
    // Tailnet Settings
    // ==========================================================================
    const settings = new tailscale.TailnetSettings("tailnet-settings", {
        // Device approval - if true, new devices need admin approval
        devicesApprovalOn: devicesNeedApproval,

        // Key expiry - disable if you want keys to never expire (not recommended)
        devicesKeyDurationDays: 180,

        // Network flow logging - useful for debugging but may have privacy implications
        networkFlowLoggingOn: networkFlowLoggingEnabled,

        // Regional routing - enable for better performance
        regionalRoutingOn: true,

        // Post-quantum crypto - enable for enhanced security (may have performance impact)
        // postQuantumOn: false,
    });

    // ==========================================================================
    // Contacts (Optional)
    // ==========================================================================
    // Set up contacts for security notifications
    //
    // const contacts = new tailscale.Contacts("tailnet-contacts", {
    //   account: {
    //     email: "your-email@example.com",
    //   },
    //   security: {
    //     email: "your-email@example.com",
    //   },
    //   support: {
    //     email: "your-email@example.com",
    //   },
    // });

    return {
        settingsId: settings.id,
    };
}
