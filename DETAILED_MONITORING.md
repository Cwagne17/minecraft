# EC2 Detailed Monitoring Configuration

## Overview

The `MinecraftServerBase` now supports optional detailed monitoring with cost consideration.

## Configuration

### Default Behavior (Cost-Optimized)

By default, detailed monitoring is **disabled** to avoid the ~$2/month cost:

```typescript
new DungeonsAndColoniesRpg(this, "Server", {
  vpc,
  // detailedMonitoring defaults to false
});
```

### Enable Detailed Monitoring

To enable 1-minute metrics (with ~$2/month cost):

```typescript
new DungeonsAndColoniesRpg(this, "Server", {
  vpc,
  detailedMonitoring: true, // Enables 1-minute metrics
});
```

## Cost Breakdown

| Monitoring Type         | Interval  | Cost/Month | Included Metrics                |
| ----------------------- | --------- | ---------- | ------------------------------- |
| **Standard** (default)  | 5 minutes | **$0**     | CPU, Network, Disk, Status      |
| **Detailed** (optional) | 1 minute  | **~$2.10** | Same metrics, higher resolution |

## CDK NAG Handling

- **When disabled** (default): Adds suppression for `AwsSolutions-EC28` with cost justification
- **When enabled**: No suppression needed, passes CDK NAG check

## Implementation Details

### Props Interface

```typescript
export interface MinecraftServerBaseProps {
  // ... other props

  /**
   * Enable detailed monitoring for the EC2 instance.
   * Provides 1-minute metrics instead of 5-minute metrics.
   * @default false (to avoid ~$2/month cost)
   */
  readonly detailedMonitoring?: boolean;
}
```

### Instance Creation

```typescript
this.instance = new ec2.Instance(this, "Instance", {
  // ... other config
  detailedMonitoring: props.detailedMonitoring ?? false,
});
```

### CDK NAG Suppression

```typescript
const instanceSuppressions = [
  {
    id: "AwsSolutions-EC29",
    reason:
      "Minecraft server does not require ASG. Data volume has retention policy to prevent data loss.",
  },
];

// Add EC28 suppression only if detailed monitoring is disabled
if (!(props.detailedMonitoring ?? false)) {
  instanceSuppressions.push({
    id: "AwsSolutions-EC28",
    reason:
      "Detailed monitoring disabled to avoid ~$2/month cost. Standard 5-minute monitoring is sufficient for Minecraft server.",
  });
}

NagSuppressions.addResourceSuppressions(cfnInstance, instanceSuppressions);
```

## When to Enable Detailed Monitoring

### Enable If:

- ✅ You want more granular performance monitoring (1-minute vs 5-minute)
- ✅ You're troubleshooting performance issues
- ✅ You want to create custom CloudWatch alarms with higher precision
- ✅ Cost is not a concern (~$2/month is acceptable)

### Keep Disabled If:

- ✅ Cost optimization is important
- ✅ Standard 5-minute metrics are sufficient
- ✅ Server runs intermittently (not 24/7)
- ✅ Basic monitoring needs are met

## Standard vs Detailed Metrics

Both provide the same metrics:

- CPU Utilization
- Network In/Out
- Disk Read/Write Operations
- Disk Read/Write Bytes
- Status Check Failed

**Difference**: Detailed provides 1-minute granularity vs 5-minute granularity.

## Cost Calculation

**Detailed Monitoring Cost:**

- 7 metrics × $0.30 per metric per month = $2.10/month per instance
- Billed when instance is running
- No cost when instance is stopped

**Example Monthly Costs:**

- Running 24/7: $2.10/month
- Running 12 hours/day: ~$1.05/month
- Running weekends only: ~$0.60/month

## Usage Examples

### Pattern Classes

All pattern classes inherit this behavior:

```typescript
// Cost-optimized (default)
new DungeonsAndColoniesRpg(this, "Server", {
  vpc,
  cfApiParameterName: "/minecraft/cf-api-key",
});

// With detailed monitoring
new BetterMcForgeBmc4(this, "Server", {
  vpc,
  cfApiParameterName: "/minecraft/cf-api-key",
  detailedMonitoring: true,
});
```

### Direct MinecraftServerBase Usage

```typescript
new MinecraftServerBase(this, "CustomServer", {
  vpc,
  detailedMonitoring: true, // Enable for this instance
  dockerEnv: {
    type: "VANILLA",
    eula: "TRUE",
    memory: "4G",
  },
});
```

## Monitoring Without Detailed Monitoring

Even with standard monitoring, you can still:

- ✅ View CPU, memory, network, disk metrics in CloudWatch
- ✅ Create basic alarms (e.g., CPU > 80% for 15 minutes)
- ✅ Monitor instance status and health
- ✅ Use CloudWatch Logs for application logs
- ✅ SSH to instance for real-time monitoring

The 5-minute interval is usually sufficient for Minecraft server monitoring unless you need to track short-term performance spikes.

## Recommendation

**For most Minecraft servers**: Keep `detailedMonitoring: false` (default)

- Standard monitoring provides adequate visibility
- Saves $24/year per instance
- Can be enabled later if needed

**Enable detailed monitoring if**:

- You're running a high-performance modded server
- You need to troubleshoot performance issues
- You want to create precise auto-scaling rules (future enhancement)
- Cost is not a primary concern
