/**
 * Tailscale Auth Keys Management
 *
 * This module manages pre-authentication keys for automated device onboarding:
 * - Reusable keys for infrastructure (can be used multiple times)
 * - One-time keys for specific devices
 * - Ephemeral keys for temporary/container workloads
 *
 * @see https://tailscale.com/kb/1085/auth-keys
 */

import * as pulumi from "@pulumi/pulumi";
import * as tailscale from "@pulumi/tailscale";

export interface KeyOutputs {
    reusableKeyId?: pulumi.Output<string>;
    reusableKeyExpiry?: pulumi.Output<string>;
    reusableKeyValue?: pulumi.Output<string>; // This is a secret!
}

/**
 * Creates and manages Tailscale authentication keys.
 */
export function createAuthKeys(): KeyOutputs {
    const config = new pulumi.Config();

    // Configuration
    // Note: Auth keys require OAuth client to have tag scopes (e.g., tag:server)
    // Set createReusableKey to true after configuring OAuth scopes
    const createReusableKey = config.getBoolean("createReusableKey") ?? false;
    const keyExpiryDays = config.getNumber("keyExpiryDays") ?? 90;

    // Calculate expiry time (Tailscale expects seconds)
    const expirySeconds = keyExpiryDays * 24 * 60 * 60;

    let outputs: KeyOutputs = {};

    if (createReusableKey) {
        // ==========================================================================
        // Reusable Server Key
        // ==========================================================================
        // This key can be used multiple times to add new devices.
        // Great for infrastructure automation, Kubernetes, etc.
        const serverKey = new tailscale.TailnetKey("server-auth-key", {
            reusable: true,
            ephemeral: false,
            preauthorized: true,
            expiry: expirySeconds,
            description: "GitOps managed reusable key for server onboarding",
            // Note: To use tags, OAuth client needs 'devices:write' scope with tag permissions
            // tags: ["tag:server"],
        });

        outputs.reusableKeyId = serverKey.id;
        outputs.reusableKeyExpiry = serverKey.expiresAt;
        outputs.reusableKeyValue = serverKey.key;

        // ==========================================================================
        // Ephemeral Container Key (Optional)
        // ==========================================================================
        // Perfect for containers that should be removed when they disconnect.
        //
        // const containerKey = new tailscale.TailnetKey("container-auth-key", {
        //   reusable: true,
        //   ephemeral: true,  // Node is removed when it disconnects
        //   preauthorized: true,
        //   expirySeconds: expirySeconds,
        //   description: "GitOps managed ephemeral key for containers",
        //   tags: ["tag:k8s"],
        // });

        // ==========================================================================
        // Infrastructure Key (Optional)
        // ==========================================================================
        // For exit nodes, subnet routers, etc.
        //
        // const infraKey = new tailscale.TailnetKey("infra-auth-key", {
        //   reusable: true,
        //   ephemeral: false,
        //   preauthorized: true,
        //   expirySeconds: expirySeconds,
        //   description: "GitOps managed key for infrastructure devices",
        //   tags: ["tag:infra"],
        // });
    }

    return outputs;
}
