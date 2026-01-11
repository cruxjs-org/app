/* eslint-disable @typescript-eslint/no-explicit-any */
// src/index.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { AppConfig, LifecycleContext, LifecycleHooks, AppInstance, RouteDefinition, AppMiddleware, Logger, PluginRegistry, ResourceMerger } from '@cruxjs/base';
    import { server as createServer } from '@minejs/server';
    import { DB } from '@minejs/db';
    import type { TableSchema } from '@minejs/db';
    import * as sass from 'sass';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    /**
     * Builds the client bundle using Bun's bundler
     *
     * Browser.tsx is a template file that:
     * - Imports user's client config from ./config.ts
     * - Reads i18n config from HTML meta tag (injected by server)
     * - Bootstraps ClientManager automatically via signal
     *
     * @param {AppConfig} config - The application configuration containing client build settings
     * @param {Logger} logger - Logger instance for logging build progress and errors
     * @returns {Promise<{success: boolean, outputs: string[]} | null>} Build result with output paths, or null if no client config
     * @throws {Error} If the build process fails
     *
     * @example
     * const result = await buildClient(config, logger);
     * if (result?.success) {
     *   console.log('Built to:', result.outputs);
     * }
     */
    async function buildClient(config: AppConfig, logger: Logger) {
        if (!config.client) return null;

        logger.info('Building client...');

        try {
            const result = await Bun.build({
                entrypoints: [config.client.entry],
                outdir: config.client.output,
                target: config.client.target || 'browser',
                minify: config.client.minify ?? !config.debug,
                sourcemap: config.client.sourcemap ?? config.debug ? 'inline' : 'none',
                external: config.client.external || []
            });

            if (!result.success) throw new Error('Build failed');

            const outputs = result.outputs.map(o => o.path);
            logger.success(`Client built → ${outputs.join(', ')}`);

            return { success: true, outputs };
        } catch (err) {
            logger.error('Failed to build client', err as Error);
            throw err;
        }
    }

    /**
     * Builds and installs UI library if specified in config
     *
     * Handles:
     * - Installing the specified UI package from npm
     * - Copying minified UI assets to the configured output path
     * - Supports packages like @mineui/core
     *
     * @param {AppConfig} config - The application configuration containing ui settings
     * @param {Logger} logger - Logger instance for logging build progress and errors
     * @returns {Promise<{success: boolean, output: string} | null>} Build result with output path, or null if no ui config
     * @throws {Error} If the build process fails
     *
     * @example
     * const result = await buildUI(config, logger);
     * if (result?.success) {
     *   console.log('UI built to:', result.output);
     * }
     */
    async function buildUI(config: AppConfig, logger: Logger) {
        if (!config.ui) {
            logger.info('No UI config provided, skipping UI build');
            return null;
        }

        logger.info(`Building UI from package: ${config.ui.package}...`);

        try {
            // Copy minified CSS from node_modules to output directory as min.css
            // @mineui/core exports mineui.css, we copy it as min.css
            const uiSourcePath = `./node_modules/${config.ui.package}/dist/mineui.css`;
            const uiOutputPath = `${config.ui.output}/min.css`;

            // Ensure output directory exists and copy file
            try {
                const { mkdir } = await import('fs/promises');
                await mkdir(config.ui.output, { recursive: true });
                const sourceFile = Bun.file(uiSourcePath);
                const exists = await sourceFile.exists();
                if (!exists) {
                    logger.info(`UI source file not found: ${uiSourcePath}`);
                } else {
                    await Bun.write(uiOutputPath, sourceFile);
                    logger.info(`Copied UI CSS → ${uiOutputPath}`);
                }
            } catch (copyErr) {
                logger.error(`Failed to copy UI CSS: ${copyErr}`);
            }

            logger.success(`UI built → ${config.ui.output}`);

            return { success: true, output: config.ui.output };
        } catch (err) {
            logger.error('Failed to build UI', err as Error);
            throw err;
        }
    }

    /**
     * Builds SCSS/CSS styles using a bundler
     *
     * Handles:
     * - Compiling SCSS to CSS
     * - Minifying CSS if configured
     * - Generating source maps if configured
     * - Outputting to specified directory
     *
     * @param {AppConfig} config - The application configuration containing style settings
     * @param {Logger} logger - Logger instance for logging build progress and errors
     * @returns {Promise<{success: boolean, output: string} | null>} Build result with output path, or null if no style config
     * @throws {Error} If the build process fails
     *
     * @example
     * const result = await buildStyles(config, logger);
     * if (result?.success) {
     *   console.log('Styles built to:', result.output);
     * }
     */
    async function buildStyles(config: AppConfig, logger: Logger) {
        if (!config.style) {
            logger.info('No style config provided, skipping style build');
            return null;
        }

        logger.info(`Building styles from: ${config.style.entry}...`);

        try {
            // Parse output path to get directory and filename
            const outputPath = config.style.output;
            const lastSlashIndex = outputPath.lastIndexOf('/');
            const outputDir = outputPath.substring(0, lastSlashIndex);
            const outputFilename = outputPath.substring(lastSlashIndex + 1);

            // Ensure output directory exists
            const { mkdir } = await import('fs/promises');
            await mkdir(outputDir, { recursive: true });

            // Use sass to compile SCSS to CSS
            const compileResult = sass.compile(config.style.entry, {
                style: config.style.minify ? 'compressed' : 'expanded',
                sourceMap: config.style.sourcemap ? true : false
            });

            // Write CSS file directly without JS wrapper
            await Bun.write(outputPath, compileResult.css);

            logger.info(`Compiled SCSS to CSS → ${outputFilename}`);
            logger.success(`Styles built → ${outputPath}`);

            return { success: true, output: outputPath };
        } catch (err) {
            logger.error('Failed to build styles', err as Error);
            return { success: false, output: config.style?.output || 'unknown' };
        }
    }

    /**
     * Initializes and configures database connections
     *
     * Handles:
     * - Multiple database instances (primary, cache, etc.)
     * - User-defined schemas from config
     * - Plugin schemas from plugins
     * - In-memory databases for plugin-only scenarios
     *
     * @param {AppConfig} config - Application configuration with database settings
     * @param {TableSchema[]} additionalSchemas - Database schemas provided by plugins
     * @param {Logger} logger - Logger instance for logging setup progress
     * @returns {Promise<Map<string, DB>>} Map of database instances by name
     * @throws {Error} If schema loading or database initialization fails
     *
     * @example
     * const databases = await setupDatabases(config, pluginSchemas, logger);
     * const db = databases.get('primary');
     * const result = db.query('SELECT * FROM users');
     */
    async function setupDatabases(
        config: AppConfig,
        additionalSchemas: TableSchema[],
        logger: Logger
    ) {
        const databases = new Map<string, DB>();

        if (!config.database && additionalSchemas.length === 0) {
            logger.info('No database config, skipping setup');
            return databases;
        }

        const dbConfigs = config.database
            ? Array.isArray(config.database)
                ? config.database
                : [config.database]
            : [];

        logger.info('Setting up databases...');

        for (const dbConfig of dbConfigs) {
            const name = dbConfig.name || 'default';
            const db = new DB(dbConfig.connection);

            // Load user schema
            if (dbConfig.schema) {
                try {
                    const schemaModule = await import(dbConfig.schema);
                    const schema = schemaModule.default || schemaModule.schema;

                    if (Array.isArray(schema)) {
                        for (const table of schema) {
                            db.defineSchema(table);
                        }
                    }
                } catch (err) {
                    logger.error(`Failed to load schema: ${dbConfig.schema}`, err as Error);
                    throw err;
                }
            }

            // Load plugin schemas for this database
            for (const schema of additionalSchemas) {
                db.defineSchema(schema);
            }

            databases.set(name, db);
            logger.success(`Database '${name}' ready`);
        }

        // If no user database but plugins need one, create default
        if (databases.size === 0 && additionalSchemas.length > 0) {
            const db = new DB(':memory:');

            for (const schema of additionalSchemas) {
                db.defineSchema(schema);
            }

            databases.set('default', db);
            logger.success(`Database 'default' ready (in-memory for plugins)`);
        }

        return databases;
    }

    /**
     * Initializes internationalization (i18n) support
     *
     * Loads language files and configures the i18n system based on:
     * - Default language
     * - Supported languages
     * - Base path for translation files
     * - File extension (json, cjson, etc.)
     *
     * @param {AppConfig} config - Application configuration with i18n settings
     * @param {Logger} logger - Logger instance for logging setup progress
     * @returns {Promise<void>}
     * @throws {Error} If i18n setup or language file loading fails
     *
     * @example
     * await setupI18n({
     *   i18n: {
     *     defaultLanguage: 'en',
     *     supportedLanguages: ['en', 'ar'],
     *     basePath: './src/i18n'
     *   }
     * }, logger);
     */
    // async function setupI18n(config: AppConfig, logger: Logger) {
    //     if (!config.i18n) return;

    //     logger.info('Setting up i18n...');

    //     try {
    //         await _setupI18n({
    //             defaultLanguage: config.i18n.defaultLanguage,
    //             supportedLanguages: config.i18n.supportedLanguages,
    //             basePath: config.i18n.basePath,
    //             fileExtension: config.i18n.fileExtension || 'json'
    //         });

    //         logger.success(`i18n ready → ${config.i18n.supportedLanguages.join(', ')}`);
    //     } catch (err) {
    //         logger.error('Failed to setup i18n', err as Error);
    //         throw err;
    //     }
    // }

    /**
     * Dynamically loads route definitions from API directory
     *
     * Scans the specified directory for route files and imports them.
     * Each route file should export either:
     * - `routes` property with RouteDefinition array
     * - Default export with RouteDefinition array
     *
     * @param {AppConfig} config - Application configuration with api.directory
     * @param {Logger} logger - Logger instance for logging scan progress
     * @returns {Promise<RouteDefinition[]>} Array of loaded route definitions
     *
     * @example
     * const routes = await loadRoutes({
     *   api: { directory: './src/server/api' }
     * }, logger);
     * console.log(`Loaded ${routes.length} routes`);
     */
    async function loadRoutes(config: AppConfig, logger: Logger): Promise<RouteDefinition[]> {
        if (!config.api) return [];

        logger.info(`Loading routes from ${config.api.directory}...`);

        const routes: RouteDefinition[] = [];

        try {
            const files = await scanDirectory(config.api.directory);

            for (const file of files) {
                try {
                    const module = await import(file);
                    const exported = module.default || module.routes;

                    if (Array.isArray(exported)) {
                        routes.push(...exported);
                    }
                } catch (err) {
                    logger.error(`Failed to load routes from ${file}`, err as Error);
                }
            }

            logger.success(`Routes loaded → ${routes.length} routes`);
            return routes;
        } catch (err) {
            logger.error('Failed to scan route directory', err as Error);
            return [];
        }
    }

    /**
     * Scans a directory for TypeScript/JavaScript files
     *
     * Uses Bun's Glob API to recursively find all .ts and .js files in a directory.
     * Gracefully handles non-existent directories (returns empty array).
     *
     * @param {string} dir - Directory path to scan
     * @returns {Promise<string[]>} Array of absolute file paths found
     *
     * @example
     * const files = await scanDirectory('./src/server/api');
     * // Returns: ['./src/server/api/users.ts', './src/server/api/posts.ts']
     */
    async function scanDirectory(dir: string): Promise<string[]> {
        const files: string[] = [];

        try {
            const entries = await Array.fromAsync(
                new Bun.Glob('**/*.{ts,js}').scan(dir)
            );

            for (const entry of entries) {
                files.push(`${dir}/${entry}`);
            }
        } catch {
            // Directory doesn't exist
        }

        return files;
    }

    /**
     * Creates a CruxJS application instance with full lifecycle management
     *
     * This is the main entry point for building a CruxJS application. It:
     * 1. Registers plugins (Phase 0)
     * 2. Builds client, initializes databases, setups i18n (Phase 1: AWAKE)
     * 3. Creates server, merges routes and middleware (Phase 2: START)
     * 4. Starts the server and enables request handling (Phase 3: READY)
     *
     * Phases execute sequentially when `app.start()` is called.
     *
     * @param {AppConfig} userConfig - Application configuration object
     * @param {LifecycleHooks} [hooks] - Optional lifecycle event handlers
     * @returns {AppInstance} Application instance with control methods
     *
     * @throws {Error} Will throw if any lifecycle phase fails (unless caught in onError hook)
     *
     * @example
     * // Basic usage
     * const app = createApp({
     *   debug: true,
     *   server: { port: 3000 },
     *   api: { directory: './src/api' },
     *   plugins: [spaPlugin]
     * });
     * await app.start();
     *
     * @example
     * // With lifecycle hooks
     * const app = createApp(config, {
     *   onAwake: async (ctx) => {
     *     console.log('⏰ App awoken, databases ready');
     *   },
     *   onReady: async (ctx) => {
     *     console.log('✅ Server ready:', ctx.server.getURL());
     *   },
     *   onError: async (ctx, phase, error) => {
     *     console.error(`Error in ${phase}:`, error.message);
     *   }
     * });
     *
     * @example
     * // With cleanup
     * const app = createApp(config);
     * await app.start();
     * // ... server is running
     * await app.stop();  // Cleanup
     */
    export function createApp(
        userConfig: AppConfig,
        hooks?: LifecycleHooks
    ): AppInstance {
        // Apply config hook
        const config: AppConfig = hooks?.onConfig
            ? hooks.onConfig(userConfig) as AppConfig
            : userConfig;

        const logger = new Logger(config.debug);
        const pluginRegistry = new PluginRegistry(logger);
        const resourceMerger = new ResourceMerger(logger);

        const databases = new Map<string, DB>();
        const middlewares = new Map<string, AppMiddleware>();
        let serverInstance: any = null;
        let clientBuild: any = null;

        const ctx: LifecycleContext = {
            config,
            databases,
            plugins: []
        };

        // Create partial app instance for plugin registration
        const partialApp: AppInstance = {
            config,
            server: null,
            databases,
            plugins: [],
            middlewares,
            start: async () => { },
            stop: async () => { },
            restart: async () => { },
            getContext: () => ctx,
            getMiddleware: (name: string) => middlewares.get(name)
        };

        // ─────────────────────────────────────────────────────────
        // Phase 0: Plugin Registration
        // ─────────────────────────────────────────────────────────

        async function phaseRegister() {
            if (!config.plugins || config.plugins.length === 0) {
                logger.info('No plugins to register');
                return;
            }

            logger.phase('REGISTER');

            for (const plugin of config.plugins) {
                await pluginRegistry.register(plugin, partialApp);
            }

            ctx.plugins = pluginRegistry.getAll();

            // Collect plugin middlewares
            const pluginMiddlewares = pluginRegistry.collectMiddlewares();
            pluginMiddlewares.forEach((mw, name) => middlewares.set(name, mw));
        }

        // ─────────────────────────────────────────────────────────
        // Phase 1: AWAKE
        // ─────────────────────────────────────────────────────────

        async function phaseAwake() {
            logger.phase('AWAKE');

            try {
                // // Setup i18n
                // await setupI18n(config, logger);

                // Build client
                clientBuild = await buildClient(config, logger);
                ctx.clientBuild = clientBuild;

                // Build UI library if configured
                const uiBuild = await buildUI(config, logger);
                ctx.uiBuild = uiBuild;

                // Build styles if configured
                const styleBuild = await buildStyles(config, logger);
                ctx.styleBuild = styleBuild;

                // Collect plugin schemas
                const pluginSchemas = pluginRegistry.collectSchemas();

                // Setup databases
                const dbs = await setupDatabases(config, pluginSchemas, logger);
                databases.clear();
                dbs.forEach((db, name) => databases.set(name, db));

                // Call plugin hooks
                await pluginRegistry.callHook('onAwake', ctx);

                // Call user hook
                await hooks?.onAwake?.(ctx);
            } catch (err) {
                await hooks?.onError?.(ctx, 'AWAKE', err as Error);
                throw err;
            }
        }

        // ─────────────────────────────────────────────────────────
        // Phase 2: START
        // ─────────────────────────────────────────────────────────

        async function phaseStart() {
            logger.phase('START');

            try {
                // Load user routes
                const userApiRoutes = await loadRoutes(config, logger);

                // Collect plugin routes
                const pluginRoutes = pluginRegistry.collectRoutes();

                // Merge user routes + plugin routes
                const userRoutes = config.routes || [];
                const allUserRoutes = [...userRoutes, ...userApiRoutes];
                const mergedRoutes = resourceMerger.mergeRoutes(allUserRoutes, pluginRoutes);

                // Collect static configs
                const userStatic = config.static
                    ? Array.isArray(config.static)
                        ? config.static
                        : [config.static]
                    : [];
                const pluginStatic = pluginRegistry.collectStatic();
                const mergedStatic = resourceMerger.mergeStatic(userStatic, pluginStatic);

                logger.info('Creating server...');

                // Collect error handlers from plugins (especially SPA plugin)
                let errorHandler: ((statusCode: number, path: string) => Response) | undefined;
                for (const plugin of ctx.plugins) {
                    const pluginWithHandler = plugin as any;
                    if (pluginWithHandler.__spaErrorHandler) {
                        errorHandler = pluginWithHandler.__spaErrorHandler;
                        console.log(`[CruxJS] ✓ Error handler collected from: ${plugin.name}`);
                        break;  // Use first error handler found
                    }
                }

                // Create server
                serverInstance = await createServer({
                    port: config.server?.port || 3000,
                    hostname: config.server?.host || 'localhost',
                    logging: config.server?.logging,
                    routes: mergedRoutes,
                    static: mergedStatic.length > 0 ? mergedStatic : undefined,
                    security: config.security,
                    middlewares: config.middlewares,
                    i18n: config.i18n
                        ? {
                            defaultLanguage: config.i18n.defaultLanguage,
                            supportedLanguages: config.i18n.supportedLanguages,
                            basePath: config.i18n.basePath,
                            fileExtension: config.i18n.fileExtension || 'json'
                        }
                        : undefined,
                    onError: errorHandler
                });

                // Inject databases
                databases.forEach((db, name) => {
                    serverInstance.db.set(name, db);
                });

                ctx.server = serverInstance;
                partialApp.server = serverInstance;

                logger.success(
                    `Server created → ${config.server?.host || 'localhost'}:${config.server?.port || 3000}`
                );

                // Call plugin hooks
                await pluginRegistry.callHook('onStart', ctx);

                // Call user hook
                await hooks?.onStart?.(ctx);
            } catch (err) {
                await hooks?.onError?.(ctx, 'START', err as Error);
                throw err;
            }
        }

        // ─────────────────────────────────────────────────────────
        // Phase 3: READY
        // ─────────────────────────────────────────────────────────

        async function phaseReady() {
            logger.phase('READY');

            try {
                await serverInstance.start();

                logger.success(
                    `Server running on http://${config.server?.host || 'localhost'}:${config.server?.port || 3000}`
                );

                // Call plugin hooks
                await pluginRegistry.callHook('onReady', ctx);

                // Call user hook
                await hooks?.onReady?.(ctx);
            } catch (err) {
                await hooks?.onError?.(ctx, 'READY', err as Error);
                throw err;
            }
        }

        // ─────────────────────────────────────────────────────────
        // App Instance
        // ─────────────────────────────────────────────────────────

        return {
            config,
            server: serverInstance,
            databases,
            plugins: ctx.plugins,
            middlewares,

            async start() {
                await phaseRegister();
                await phaseAwake();
                await phaseStart();
                await phaseReady();
            },

            async stop() {
                logger.info('Stopping server...');

                try {
                    if (serverInstance) {
                        await serverInstance.stop();
                    }

                    databases.forEach((db, name) => {
                        db.close();
                        logger.info(`Database '${name}' closed`);
                    });

                    // Call plugin hooks
                    await pluginRegistry.callHook('onShutdown', ctx);

                    await hooks?.onFinish?.(ctx);

                    logger.success('Server stopped');
                } catch (err) {
                    logger.error('Failed to stop server', err as Error);
                    throw err;
                }
            },

            async restart() {
                await this.stop();
                await this.start();
            },

            getContext() {
                return ctx;
            },

            getMiddleware(name: string) {
                return middlewares.get(name);
            }
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ ════ ════════════════════════════════════════╗

    export * from '@cruxjs/base';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝