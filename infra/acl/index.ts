/**
 * Tailscale ACL (Access Control List) Configuration
 *
 * This module manages your entire Tailscale policy including:
 * - ACL rules (who can access what)
 * - Groups (logical groupings of users)
 * - Tag owners (who can assign tags to devices)
 * - Hosts (named IP addresses)
 * - SSH rules
 * - Auto-approvers for subnet routes
 *
 * @see https://tailscale.com/kb/1018/acls
 */

import * as pulumi from "@pulumi/pulumi";
import * as tailscale from "@pulumi/tailscale";

export interface AclOutputs {
    aclId: pulumi.Output<string>;
}

/**
 * Creates and manages the Tailscale ACL policy.
 *
 * The ACL is defined as a JSON object following Tailscale's policy format.
 * This gives you complete control over network access.
 */
export function createAcl(): AclOutputs {

    // Define your ACL policy
    // This is a sensible default for a personal tailnet - customize as needed!
    const aclPolicy = {
        // ==========================================================================
        // Tag Owners - Who can assign tags to devices
        // ==========================================================================
        tagOwners: {
            "tag:server": ["autogroup:admin"],
            "tag:personal": ["autogroup:admin"],
            "tag:infra": ["autogroup:admin"],
            "tag:k8s": ["autogroup:admin"],
            "tag:iot": ["autogroup:admin"],
            "tag:exit-node": ["autogroup:admin"],
        },

        // ==========================================================================
        // Hosts - Named IPs for easy reference (customize with your IPs)
        // ==========================================================================
        hosts: {
            // Example: "nas": "100.x.x.x",
            // Example: "pihole": "100.x.x.x",
        },

        // ==========================================================================
        // ACL Rules - Who can access what
        // ==========================================================================
        acls: [
            // 1. Admins (you) can access everything
            {
                action: "accept",
                src: ["autogroup:admin"],
                dst: ["*:*"],
            },

            // 2. Personal devices can access everything
            {
                action: "accept",
                src: ["tag:personal"],
                dst: ["*:*"],
            },

            // 3. Servers can talk to each other (all ports)
            {
                action: "accept",
                src: ["tag:server"],
                dst: ["tag:server:*"],
            },

            // 4. Kubernetes nodes can communicate with each other
            {
                action: "accept",
                src: ["tag:k8s"],
                dst: ["tag:k8s:*"],
            },

            // 5. All devices can access servers on common ports
            {
                action: "accept",
                src: ["*"],
                dst: [
                    "tag:server:22",      // SSH
                    "tag:server:80",      // HTTP
                    "tag:server:443",     // HTTPS
                    "tag:server:8080",    // Alt HTTP
                    "tag:server:3000",    // Dev servers
                    "tag:server:5432",    // PostgreSQL
                    "tag:server:6443",    // Kubernetes API
                ],
            },

            // 6. IoT devices - restricted access (only to specific services)
            {
                action: "accept",
                src: ["tag:iot"],
                dst: [
                    "tag:server:80",      // HTTP only
                    "tag:server:443",     // HTTPS only
                    "tag:server:1883",    // MQTT
                    "tag:server:8883",    // MQTT over TLS
                ],
            },

            // 7. Everyone can use exit nodes
            {
                action: "accept",
                src: ["*"],
                dst: ["tag:exit-node:*"],
            },
        ],

        // ==========================================================================
        // SSH Rules - Tailscale SSH access control
        // ==========================================================================
        ssh: [
            // Admins can SSH to servers and k8s nodes
            {
                action: "accept",
                src: ["autogroup:admin"],
                dst: ["tag:server", "tag:k8s", "tag:infra", "tag:personal"],
                users: ["autogroup:nonroot", "root"],
            },

            // Personal devices can SSH to servers
            {
                action: "accept",
                src: ["tag:personal"],
                dst: ["tag:server"],
                users: ["root", "ubuntu", "ec2-user", "admin"],
            },

            // Servers can SSH to other servers (for automation)
            {
                action: "accept",
                src: ["tag:server"],
                dst: ["tag:server"],
                users: ["root", "ubuntu"],
            },
        ],

        // ==========================================================================
        // Auto Approvers - Automatically approve routes/exit nodes
        // ==========================================================================
        autoApprovers: {
            // Auto-approve exit nodes tagged with exit-node or infra
            exitNode: ["tag:exit-node", "tag:infra"],

            // Auto-approve subnet routes (customize with your subnets)
            routes: {
                // Home network
                "192.168.0.0/16": ["tag:server", "tag:infra"],
                // Docker networks
                "172.16.0.0/12": ["tag:server", "tag:k8s"],
                // Common private range
                "10.0.0.0/8": ["tag:server", "tag:k8s", "tag:infra"],
            },
        },
    };

    // Create the ACL resource
    const acl = new tailscale.Acl("tailnet-acl", {
        acl: JSON.stringify(aclPolicy, null, 2),
    });

    return {
        aclId: acl.id,
    };
}
