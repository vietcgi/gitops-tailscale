# GitOps Tailscale Infrastructure

Personal Tailscale tailnet managed entirely in code with Pulumi.

## Architecture

```
gitops-tailscale-v/
├── infra/                    # Pulumi infrastructure code
│   ├── Pulumi.yaml           # Project configuration
│   ├── Pulumi.prod.yaml      # Production stack config
│   ├── index.ts              # Main entry point
│   ├── acl/                  # Access Control Lists
│   │   └── index.ts
│   ├── dns/                  # DNS configuration
│   │   └── index.ts
│   ├── keys/                 # Auth keys management
│   │   └── index.ts
│   └── settings/             # Tailnet settings
│       └── index.ts
├── .github/
│   └── workflows/
│       └── pulumi.yml        # CI/CD pipeline
└── README.md
```

## What This Manages

| Resource | Description |
|----------|-------------|
| **ACLs** | Access control policies, groups, tag owners |
| **DNS** | MagicDNS, nameservers, search paths, split DNS |
| **Auth Keys** | Pre-auth keys for automated device onboarding |
| **Tailnet Settings** | Device approval, key expiry, network settings |
| **Webhooks** | Event notifications (optional) |

## Quick Start

### Prerequisites
- [Pulumi CLI](https://www.pulumi.com/docs/install/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- Tailscale OAuth client credentials (recommended) or API key

### Setup

1. **Install dependencies:**
   ```bash
   cd infra
   npm install
   ```

2. **Configure Tailscale credentials:**
   ```bash
   # Option 1: OAuth Client (Recommended for GitOps)
   export TAILSCALE_OAUTH_CLIENT_ID="your-client-id"
   export TAILSCALE_OAUTH_CLIENT_SECRET="your-client-secret"

   # Option 2: API Key (simpler but expires)
   export TAILSCALE_API_KEY="your-api-key"
   ```

3. **Set your tailnet:**
   ```bash
   pulumi config set tailscale:tailnet your-tailnet-id
   ```

4. **Preview changes:**
   ```bash
   pulumi preview
   ```

5. **Deploy:**
   ```bash
   pulumi up
   ```

## Security Best Practices

1. **Use OAuth Clients** instead of API keys for CI/CD (they don't expire)
2. **Store secrets** in Pulumi config with encryption: `pulumi config set --secret`
3. **Restrict API access** - Only allow changes through this GitOps workflow
4. **Enable audit logging** in Tailscale admin console
5. **Use branch protection** and require PR reviews for infrastructure changes

## Common Commands

```bash
# Preview what will change
pulumi preview

# Apply changes
pulumi up

# View current state
pulumi stack output

# Import existing resources
pulumi import tailscale:index/acl:Acl my-acl acl

# Refresh state from Tailscale
pulumi refresh

# Destroy all resources (careful!)
pulumi destroy
```

## CI/CD Pipeline

This repo includes GitHub Actions workflow that:
1. Runs `pulumi preview` on all PRs
2. Runs `pulumi up` on merge to `main`
3. Stores state in Pulumi Cloud (free tier)

## Resources

- [Pulumi Tailscale Provider Docs](https://www.pulumi.com/registry/packages/tailscale/)
- [Tailscale API Documentation](https://tailscale.com/api)
- [Tailscale ACL Reference](https://tailscale.com/kb/1018/acls)
