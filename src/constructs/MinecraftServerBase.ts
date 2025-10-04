import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { mapMinecraftEnv, MinecraftDockerEnv } from '../shared/types';

export interface MinecraftServerBaseProps {
  /**
   * VPC to deploy in. If not provided, a new one will be created.
   */
  readonly vpc?: ec2.IVpc;

  /**
   * Instance type for the Minecraft server.
   * Uses a t4g instance type by default.
   * @default medium
   */
  readonly instanceSize?: ec2.InstanceSize;

  /**
   * Size of the data volume in GiB.
   * @default 30
   */
  readonly volumeGiB?: number;

  /**
   * Whether to allocate and associate an Elastic IP.
   * @default true
   */
  readonly allocateElasticIp?: boolean;

  /**
   * CIDR range allowed to connect to the server.
   * @default 0.0.0.0/0
   */
  readonly egressCidrAllow?: string;

  /**
   * Docker image to use.
   * @default itzg/minecraft-server
   */
  readonly dockerImage?: string;

  /**
   * Docker image tag to use (e.g., 'java17', 'java21', 'latest').
   * @default 'latest'
   */
  readonly dockerImageTag?: string;

  /**
   * Environment variables for the docker container.
   * @default {}
   */
  readonly dockerEnv?: MinecraftDockerEnv;

  /**
   * Extra lines to add to user data script.
   * @default []
   */
  readonly extraUserDataLines?: string[];

  /**
   * Name of SSM parameter containing CurseForge API key.
   * If provided, will be fetched and passed to docker as CF_API_KEY.
   */
  readonly cfApiParameterName?: string;
}

export class MinecraftServerBase extends Construct {
  public readonly instance: ec2.Instance;
  public readonly securityGroup: ec2.SecurityGroup;
  public readonly vpc: ec2.IVpc;
  public readonly dataDeviceName: string;
  public readonly eip?: ec2.CfnEIP;

  constructor(scope: Construct, id: string, props: MinecraftServerBaseProps = {}) {
    super(scope, id);

    // Use provided VPC or create a new one
    this.vpc = props.vpc ?? new ec2.Vpc(this, 'Vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    // Security group allowing Minecraft traffic
    this.securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Minecraft server',
      allowAllOutbound: true,
    });

    const egressCidr = props.egressCidrAllow ?? '0.0.0.0/0';
    this.securityGroup.addIngressRule(
      ec2.Peer.ipv4(egressCidr),
      ec2.Port.tcp(25565),
      'Allow Minecraft traffic',
    );

    // IAM role for the instance
    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    // If CF API parameter is provided, grant read access
    if (props.cfApiParameterName) {
      role.addToPolicy(
        new iam.PolicyStatement({
          actions: ['ssm:GetParameter'],
          resources: [
            `arn:aws:ssm:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:parameter${props.cfApiParameterName}`,
          ],
        }),
      );
    }

    // Use Amazon Linux 2023 ARM64 AMI
    const machineImage = ec2.MachineImage.latestAmazonLinux2023({
      cpuType: ec2.AmazonLinuxCpuType.ARM_64,
    });

    const instanceSize = props.instanceSize ?? ec2.InstanceSize.MEDIUM;

    // Create the instance
    this.instance = new ec2.Instance(this, 'Instance', {
      vpc: this.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        instanceSize,
      ),
      machineImage,
      securityGroup: this.securityGroup,
      role,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Attach EBS data volume
    this.dataDeviceName = '/dev/xvdb';
    const volumeGiB = props.volumeGiB ?? 30;

    const dataVolume = new ec2.Volume(this, 'DataVolume', {
      availabilityZone: this.instance.instanceAvailabilityZone,
      size: cdk.Size.gibibytes(volumeGiB),
      volumeType: ec2.EbsDeviceVolumeType.GP3,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new ec2.CfnVolumeAttachment(this, 'DataVolumeAttachment', {
      instanceId: this.instance.instanceId,
      volumeId: dataVolume.volumeId,
      device: this.dataDeviceName,
    });

    // Build user data script
    const userData = this.instance.userData;

    // Wait for volume to be attached
    userData.addCommands(
      'echo "Waiting for volume to be attached..."',
      'while [ ! -e /dev/xvdb ]; do sleep 1; done',
      'sleep 5',
    );

    // Format and mount volume if not already formatted
    userData.addCommands(
      'echo "Setting up data volume..."',
      'if ! blkid /dev/xvdb; then',
      '  mkfs -t ext4 /dev/xvdb',
      'fi',
      'mkdir -p /minecraft',
      'mount /dev/xvdb /minecraft',
      'echo "/dev/xvdb /minecraft ext4 defaults,nofail 0 2" >> /etc/fstab',
    );

    // Install Docker
    userData.addCommands(
      'echo "Installing Docker..."',
      'dnf install -y docker',
      'systemctl enable docker',
      'systemctl start docker',
    );

    // Fetch CF API key if needed
    let cfApiKeyVar = '';
    if (props.cfApiParameterName) {
      userData.addCommands(
        'echo "Installing AWS CLI..."',
        'dnf install -y awscli',
        'echo "Fetching CurseForge API key from SSM..."',
        `export CF_API_KEY=$(aws ssm get-parameter --name "${props.cfApiParameterName}" --query Parameter.Value --output text --region ${cdk.Stack.of(this).region})`,
      );
      cfApiKeyVar = '-e CF_API_KEY="$CF_API_KEY"';
    }

    // Build docker environment variables
    const dockerEnv = props.dockerEnv ?? {};
    const mappedEnv = mapMinecraftEnv(dockerEnv);
    const envVars = Object.entries(mappedEnv)
      .map(([key, value]) => `-e ${key}="${value}"`)
      .join(' ');

    const dockerImage = props.dockerImage ?? 'itzg/minecraft-server';
    const dockerImageTag = props.dockerImageTag ?? 'latest';
    const fullDockerImage = `${dockerImage}:${dockerImageTag}`;

    // Run Minecraft server container
    userData.addCommands(
      'echo "Starting Minecraft server container..."',
      'docker run -d --restart=always --name minecraft \\',
      '  -p 25565:25565 \\',
      '  -e EULA=TRUE \\',
      `  ${envVars} \\`,
      `  ${cfApiKeyVar} \\`,
      '  -v /minecraft:/data \\',
      `  ${fullDockerImage}`,
      'echo "Minecraft server setup complete!"',
    );

    // Add extra user data lines if provided
    if (props.extraUserDataLines && props.extraUserDataLines.length > 0) {
      userData.addCommands(...props.extraUserDataLines);
    }

    // Allocate and associate Elastic IP if requested
    if (props.allocateElasticIp ?? true) {
      this.eip = new ec2.CfnEIP(this, 'EIP', {
        domain: 'vpc',
        instanceId: this.instance.instanceId,
      });
    }
  }
}
