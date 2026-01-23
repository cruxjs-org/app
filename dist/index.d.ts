import { AppConfig, LifecycleHooks, AppInstance } from '@cruxjs/base';
export * from '@cruxjs/base';
import { Logger } from '@minejs/logger';

declare function optimizeBundle(outputs: string[], config: AppConfig, logger: Logger): Promise<void>;
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
declare function createApp(userConfig: AppConfig, hooks?: LifecycleHooks): AppInstance;

export { createApp, optimizeBundle };
