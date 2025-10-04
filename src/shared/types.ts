/**
 * Environment variables for the minecraft-server docker container using TypeScript naming conventions.
 * These will be automatically converted to uppercase Docker environment variable names.
 * See https://docker-minecraft-server.readthedocs.io/en/latest/variables/ for full documentation.
 */
export interface MinecraftDockerEnv {
    // General Options
    /** The linux user id to run as @default 1000 */
    readonly uid?: string;
    /** The linux group id to run as @default 1000 */
    readonly gid?: string;
    /** Memory allocation for the server (e.g., '4G', '8G') @default 1G */
    readonly memory?: string;
    /** Initial heap size @default 1G */
    readonly initMemory?: string;
    /** Max heap size @default 1G */
    readonly maxMemory?: string;
    /** Timezone (e.g., 'America/New_York') @default UTC */
    readonly tz?: string;
    /** Enable rolling log files @default false */
    readonly enableRollingLogs?: Bool;
    /** Enable remote JMX for profiling @default false */
    readonly enableJmx?: Bool;
    /** IP/host for JMX (required if enableJmx is true) */
    readonly jmxHost?: string;
    /** Use Aikar's optimized JVM flags @default false */
    readonly useAikarFlags?: Bool;
    /** Use MeowIce's optimized JVM flags for Java 17+ @default false */
    readonly useMeowiceFlags?: Bool;
    /** Enable MeowIce's GraalVM flags @default true */
    readonly useMeowiceGraalvmFlags?: Bool;
    /** General JVM options (space-delimited) */
    readonly jvmOpts?: string;
    /** JVM XX options (space-delimited) */
    readonly jvmXxOpts?: string;
    /** JVM DD options (comma-separated name=value pairs) */
    readonly jvmDdOpts?: string;
    /** Extra arguments passed to the jar file */
    readonly extraArgs?: string;
    /** Include timestamp with each log @default false */
    readonly logTimestamp?: Bool;

    // Server Options
    /** Server type (e.g., 'VANILLA', 'FORGE', 'FABRIC', 'AUTO_CURSEFORGE') @default VANILLA */
    readonly type?: ServerType;
    /** Accept Minecraft EULA (REQUIRED) */
    readonly eula?: ScreamingBool;
    /** Minecraft version */
    readonly version?: MinecraftGameVersion;
    /** Server login message */
    readonly motd?: string;
    /** Difficulty level: peaceful, easy, normal, hard @default easy */
    readonly difficulty?: Difficulty;
    /** URL or file path for server icon */
    readonly icon?: string;
    /** Override existing server icon @default FALSE */
    readonly overrideIcon?: Bool;
    /** Maximum number of players @default 20 */
    readonly maxPlayers?: string;
    /** Maximum world size (radius in blocks) */
    readonly maxWorldSize?: string;
    /** Allow Nether travel @default true */
    readonly allowNether?: Bool;
    /** Announce player achievements @default true */
    readonly announcePlayerAchievements?: Bool;
    /** Enable command blocks */
    readonly enableCommandBlock?: Bool;
    /** Force players to join in default game mode @default false */
    readonly forceGamemode?: Bool;
    /** Generate structures (villages, etc.) @default true */
    readonly generateStructures?: Bool;
    /** Hardcore mode - spectator on death @default false */
    readonly hardcore?: Bool;
    /** Send data to snoop.minecraft.net @default true */
    readonly snooperEnabled?: Bool;
    /** Maximum building height @default 256 */
    readonly maxBuildHeight?: string;
    /** Spawn animals @default true */
    readonly spawnAnimals?: Bool;
    /** Spawn monsters @default true */
    readonly spawnMonsters?: Bool;
    /** Spawn NPCs/villagers @default true */
    readonly spawnNpcs?: Bool;
    /** Spawn protection radius (0 to disable) */
    readonly spawnProtection?: string;
    /** Server-side view distance in chunks */
    readonly viewDistance?: string;
    /** World generation seed */
    readonly seed?: string;
    /** Game mode: creative, survival, adventure, spectator */
    readonly mode?: GameMode;
    /** Enable player-vs-player @default true */
    readonly pvp?: Bool;
    /** Level type @default minecraft:default */
    readonly levelType?: string;
    /** Generator settings for custom world generation */
    readonly generatorSettings?: string;
    /** World/save name @default world */
    readonly level?: string;
    /** Check players against Minecraft account database @default true */
    readonly onlineMode?: Bool;
    /** Allow flight in Survival mode @default FALSE */
    readonly allowFlight?: ScreamingBool;
    /** Server name */
    readonly serverName?: string;
    /** Server port (rarely needed) */
    readonly serverPort?: string;
    /** Player idle timeout in minutes */
    readonly playerIdleTimeout?: string;
    /** Sync chunk writes */
    readonly syncChunkWrites?: string;
    /** Enable status */
    readonly enableStatus?: string;
    /** Entity broadcast range percentage */
    readonly entityBroadcastRangePercentage?: string;
    /** Function permission level */
    readonly functionPermissionLevel?: string;
    /** Network compression threshold */
    readonly networkCompressionThreshold?: string;
    /** Op permission level */
    readonly opPermissionLevel?: OpPermissionLevel;
    /** Prevent proxy connections */
    readonly preventProxyConnections?: string;
    /** Use native transport */
    readonly useNativeTransport?: string;
    /** Simulation distance */
    readonly simulationDistance?: string;
    /** Execute server directly for docker attach support @default false */
    readonly execDirectly?: Bool;
    /** Delay in seconds before shutdown @default 60 */
    readonly stopServerAnnounceDelay?: string;
    /** HTTP/HTTPS proxy URL */
    readonly proxy?: string;
    /** Enable console (some older versions) @default TRUE */
    readonly console?: ScreamingBool;
    /** Disable GUI (some older versions) @default TRUE */
    readonly gui?: ScreamingBool;
    /** Graceful stop duration @default 60 */
    readonly stopDuration?: string;
    /** Setup files and stop before launching server @default false */
    readonly setupOnly?: Bool;
    /** Enable Flare profiling JVM flags */
    readonly useFlareFlags?: string;
    /** Enable SIMD optimizations @default false */
    readonly useSimdFlags?: Bool;

    // Custom Resource Pack
    /** Link to custom resource pack */
    readonly resourcePack?: string;
    /** Checksum for custom resource pack */
    readonly resourcePackSha1?: string;
    /** Enforce resource pack on clients @default FALSE */
    readonly resourcePackEnforce?: ScreamingBool;

    // Whitelist
    /** Enable whitelist @default false */
    readonly enableWhitelist?: Bool;
    /** Comma-separated usernames/UUIDs */
    readonly whitelist?: string;
    /** URL or file path to whitelist JSON */
    readonly whitelistFile?: string;
    /** Regenerate whitelist on startup @default false */
    readonly overrideWhitelist?: Bool;

    // RCON
    /** Enable RCON support @default true */
    readonly enableRcon?: string;
    /** RCON password */
    readonly rconPassword?: string;
    /** RCON port @default 25575 */
    readonly rconPort?: string;
    /** Broadcast RCON to ops @default false */
    readonly broadcastRconToOps?: Bool;
    /** RCON commands on server start */
    readonly rconCmdsStartup?: string;
    /** RCON commands on client connect */
    readonly rconCmdsOnConnect?: string;
    /** RCON commands on first client connect */
    readonly rconCmdsFirstConnect?: string;
    /** RCON commands on client disconnect */
    readonly rconCmdsOnDisconnect?: string;
    /** RCON commands on last client disconnect */
    readonly rconCmdsLastDisconnect?: string;

    // Auto-Pause
    /** Enable autopause functionality @default FALSE */
    readonly enableAutopause?: ScreamingBool;
    /** Time between last disconnect and pause (seconds) @default 3600 */
    readonly autopauseTimeoutEst?: string;
    /** Time between start and pause with no connects (seconds) @default 600 */
    readonly autopauseTimeoutInit?: string;
    /** Time between port knock and pause (seconds) @default 120 */
    readonly autopauseTimeoutKn?: string;
    /** Autopause state machine period (seconds) @default 10 */
    readonly autopausePeriod?: string;
    /** Network interface for knockd daemon @default eth0 */
    readonly autopauseKnockInterface?: string;
    /** Enable autopause debug output @default false */
    readonly debugAutopause?: Bool;

    // Auto-Stop
    /** Enable autostop functionality @default FALSE */
    readonly enableAutostop?: ScreamingBool;
    /** Time between last disconnect and stop (seconds) @default 3600 */
    readonly autostopTimeoutEst?: string;
    /** Time between start and stop with no connects (seconds) @default 1800 */
    readonly autostopTimeoutInit?: string;
    /** Autostop state machine period (seconds) @default 10 */
    readonly autostopPeriod?: string;
    /** Enable autostop debug output @default false */
    readonly debugAutostop?: Bool;

    // CurseForge
    /** CurseForge API key */
    // readonly cfApiKey?: string; --- IGNORE --- This is set via SSM parameter in the MinecraftServerBase construct
    /** Path to file containing CurseForge API key */
    // readonly cfApiKeyFile?: string; --- IGNORE --- This is set via SSM parameter in the MinecraftServerBase construct
    /** CurseForge modpack page URL */
    readonly cfPageUrl?: string;
    /** CurseForge modpack slug */
    readonly cfSlug?: string;
    /** CurseForge file numerical ID */
    readonly cfFileId?: string;
    /** Substring to match desired filename */
    readonly cfFilenameMatcher?: string;
    /** Path to exclusions/inclusions JSON file */
    readonly cfExcludeIncludeFile?: string;
    /** Comma/space-delimited list of mod slugs/IDs to exclude */
    readonly cfExcludeMods?: string;
    /** Comma/space-delimited list of mod slugs/IDs to force include */
    readonly cfForceIncludeMods?: string;
    /** Force re-evaluation of excludes/includes */
    readonly cfForceSynchronize?: string;
    /** Set LEVEL from: WORLD_FILE or OVERRIDES */
    readonly cfSetLevelFrom?: string;
    /** Number of parallel mod downloads @default 4 */
    readonly cfParallelDownloads?: string;
    /** Skip existing files in overrides @default false */
    readonly cfOverridesSkipExisting?: Bool;
}

/**
 * Converts camelCase property names to SCREAMING_SNAKE_CASE for Docker environment variables.
 */
export function toDockerEnvName(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
}

/**
 * Converts MinecraftDockerEnv object to a Record with uppercase Docker environment variable names.
 */
export function mapMinecraftEnv(env: MinecraftDockerEnv): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(env)) {
        if (value !== undefined) {
            result[toDockerEnvName(key)] = value;
        }
    }
    return result;
}

export enum ServerType {
    VANILLA = 'VANILLA',
    FORGE = 'FORGE',
    FABRIC = 'FABRIC',
    AUTO_CURSEFORGE = 'AUTO_CURSEFORGE',
}

export enum Difficulty {
    PEACEFUL = 'peaceful',
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard',
}

export enum GameMode {
    SURVIVAL = 'survival',
    CREATIVE = 'creative',
    ADVENTURE = 'adventure',
    SPECTATOR = 'spectator',
}

export enum OpPermissionLevel {
    LEVEL_1 = '1',
    LEVEL_2 = '2',
    LEVEL_3 = '3',
    LEVEL_4 = '4',
}

export enum Bool {
    TRUE = 'true',
    FALSE = 'false',
}

export enum ScreamingBool {
    TRUE = 'TRUE',
    FALSE = 'FALSE',
}

export enum MinecraftGameVersion {
    V1_20_1 = '1.20.1',
    V1_19_2 = '1.19.2',
}