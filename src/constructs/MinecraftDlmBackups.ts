import * as dlm from 'aws-cdk-lib/aws-dlm';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export interface MinecraftDlmBackupsProps {
  /**
   * Tag key to select volumes for backup.
   * @default MinecraftData
   */
  readonly tagKey?: string;

  /**
   * Tag value to select volumes for backup.
   * @default true
   */
  readonly tagValue?: string;

  /**
   * Number of snapshots to retain.
   * @default 3
   */
  readonly retentionCount?: number;
}

export class MinecraftDlmBackups extends Construct {
  public readonly policy: dlm.CfnLifecyclePolicy;

  constructor(scope: Construct, id: string, props: MinecraftDlmBackupsProps = {}) {
    super(scope, id);

    const tagKey = props.tagKey ?? 'MinecraftData';
    const tagValue = props.tagValue ?? 'true';
    const retentionCount = props.retentionCount ?? 3;

    // Create IAM role for DLM
    const dlmRole = new iam.Role(this, 'DlmRole', {
      assumedBy: new iam.ServicePrincipal('dlm.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSDataLifecycleManagerServiceRole'),
      ],
    });

    // Suppress IAM4 - AWS managed policy is required for DLM service role
    NagSuppressions.addResourceSuppressions(dlmRole, [
      {
        id: 'AwsSolutions-IAM4',
        reason: 'AWSDataLifecycleManagerServiceRole is required for DLM. Few resources exist in account due to org structure.',
        appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSDataLifecycleManagerServiceRole'],
      },
    ]);

    // Create lifecycle policy
    this.policy = new dlm.CfnLifecyclePolicy(this, 'Policy', {
      description: 'Daily backup policy for Minecraft data volumes',
      state: 'ENABLED',
      executionRoleArn: dlmRole.roleArn,
      policyDetails: {
        resourceTypes: ['VOLUME'],
        targetTags: [
          {
            key: tagKey,
            value: tagValue,
          },
        ],
        schedules: [
          {
            name: 'DailyBackup',
            createRule: {
              cronExpression: 'cron(0 3 * * ? *)', // Daily at 03:00 UTC
            },
            retainRule: {
              count: retentionCount,
            },
            copyTags: true,
            tagsToAdd: [
              {
                key: 'ManagedBy',
                value: 'DLM',
              },
            ],
          },
        ],
      },
    });
  }
}
