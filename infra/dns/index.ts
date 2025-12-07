/**
 * Tailscale DNS Configuration
 *
 * This module manages DNS settings for your tailnet:
 * - MagicDNS (automatic DNS names for your devices)
 * - Global nameservers
 * - Search paths
 * - Split DNS (route specific domains to specific nameservers)
 *
 * @see https://tailscale.com/kb/1054/dns
 */

import * as pulumi from "@pulumi/pulumi";
import * as tailscale from "@pulumi/tailscale";

export interface DnsOutputs {
    magicDnsEnabled: pulumi.Output<boolean>;
    searchPaths: pulumi.Output<string[]>;
    nameserversId?: pulumi.Output<string>;
}

/**
 * Creates and manages Tailscale DNS configuration.
 */
export function createDnsConfiguration(): DnsOutputs {
    const config = new pulumi.Config();

    // Get configuration values with defaults
    const magicDnsEnabled = config.getBoolean("magicDnsEnabled") ?? true;
    const searchPathsConfig = config.getObject<string[]>("dnsSearchPaths") ?? [];

    // ==========================================================================
    // DNS Preferences (MagicDNS)
    // ==========================================================================
    const dnsPreferences = new tailscale.DnsPreferences("dns-preferences", {
        magicDns: magicDnsEnabled,
    });

    // ==========================================================================
    // DNS Search Paths
    // ==========================================================================
    let dnsSearchPaths: tailscale.DnsSearchPaths | undefined;

    if (searchPathsConfig.length > 0) {
        dnsSearchPaths = new tailscale.DnsSearchPaths("dns-search-paths", {
            searchPaths: searchPathsConfig,
        });
    }

    // ==========================================================================
    // Global Nameservers (Optional)
    // ==========================================================================
    // Uncomment and configure if you want to set custom global nameservers
    //
    // const dnsNameservers = new tailscale.DnsNameservers("dns-nameservers", {
    //   nameservers: [
    //     "1.1.1.1",        // Cloudflare
    //     "8.8.8.8",        // Google
    //     "9.9.9.9",        // Quad9
    //   ],
    // });

    // ==========================================================================
    // Split DNS (Optional)
    // ==========================================================================
    // Route specific domains to specific nameservers.
    // Great for accessing internal resources via your own DNS server.
    //
    // Example: Route internal.company.com to your internal DNS
    //
    // const splitDns = new tailscale.DnsSplitNameservers("split-dns-internal", {
    //   domain: "internal.home",
    //   nameservers: ["100.x.x.x"], // Your Pi-hole or internal DNS
    // });
    //
    // Example: Route home.arpa to a local DNS
    //
    // const splitDnsHome = new tailscale.DnsSplitNameservers("split-dns-home", {
    //   domain: "home.arpa",
    //   nameservers: ["192.168.1.1"],
    // });

    return {
        magicDnsEnabled: pulumi.output(magicDnsEnabled),
        searchPaths: pulumi.output(searchPathsConfig),
    };
}
