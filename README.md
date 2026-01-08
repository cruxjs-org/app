<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.0.4-black"/>
    <img src="https://img.shields.io/badge/🔥-@cruxjs-black"/>
    <br>
    <img src="https://img.shields.io/github/issues/cruxjs-org/app?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/cruxjs-org/app?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    > **_Full-stack framework orchestrator for building modern web applications. Zero configuration. Plugin-based architecture._**

    - ### Setup

        > install [`hmm`](https://github.com/minejs-org/hmm) first.

        ```bash
        hmm i @cruxjs/app
        ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> <br> </div>

    - ### Usage

        ```typescript
        import { createApp, type AppConfig } from '@cruxjs/app';

        // Define your application
        const config: AppConfig = {
          debug: true,
          server: {
            port: 3000,
            host: 'localhost'
          },
          client: {
            entry: './src/client/browser.tsx',
            output: './dist/client',
            target: 'browser'
          },
          api: {
            directory: './src/server/api'
          },
          plugins: [] // Add plugins here
        };

        // Create and run the app
        const app = createApp(config);
        await app.start();
        ```

    <br>

    - ### 1. Define Routes

        **src/server/api/index.ts**
        ```typescript
        import type { RouteDefinition } from '@cruxjs/app';

        export const routes: RouteDefinition[] = [
          {
            method: 'GET',
            path: '/api/users',
            handler: async (ctx) => {
              return ctx.json({ users: [] });
            }
          },
          {
            method: 'POST',
            path: '/api/users',
            handler: async (ctx) => {
              const data = await ctx.request.json();
              // Your logic here
              return ctx.json({ created: true }, { status: 201 });
            }
          }
        ];
        ```

    - ### 2. Create Client Entry

        **src/client/browser.tsx**
        ```typescript
        import { mount } from '@minejsx/runtime';
        import { App } from './ui/App';
        import { ClientManager } from '@cruxjs/client';
        import { HomePage } from './ui/pages/HomePage';
        import { NotFoundPage } from './ui/pages/NotFoundPage';

        // ClientManager is a pure management layer
        // You provide route components and error pages
        const clientManager = new ClientManager({
          debug: true,
          routes: {
            '/': HomePage,
            '/about': AboutPage,
          },
          notFoundComponent: NotFoundPage,
          errorComponent: ErrorPage
        });

        // Mount and run
        (async () => {
          await clientManager.boot();
          mount(<App />, '#app');
          await clientManager.ready('#app-main');
        })();
        ```

    - ### 3. Add Plugins

        ```typescript
        import { serverSPA } from '@cruxplug/spa';

        const spaPlugin = serverSPA({
          baseUrl: 'http://localhost:3000',
          clientEntry: './src/client/browser.tsx',
          clientScriptPath: '/static/dist/js/browser.js',
          pages: [
            {
              title: 'Home',
              path: '/',
              description: 'Welcome to my app',
              keywords: ['app', 'home']
            }
          ],
          errorPages: [
            {
              statusCode: 404,
              title: '404 - Not Found',
              path: '/404'
            }
          ]
        });

        const config: AppConfig = {
          // ... other config
          plugins: [spaPlugin]
        };
        ```

    <br>

- ## Lifecycle 🔥

    CruxJS applications go through **4 phases**:

    - #### **Phase 0: REGISTER**
        > Plugins are registered and can hook into the application lifecycle.

    - #### **Phase 1: AWAKE**
        > Client is built, databases are initialized, i18n is setup, plugins initialize their schemas.

        **Hooks available:**
        ```typescript
        createApp(config, {
          onAwake: async (ctx) => {
            console.log('App is awake, databases ready');
            const db = ctx.databases.get('default');
            // Setup your initial data
          }
        });
        ```

    - #### **Phase 2: START**
        > Server is created, routes are merged (user + plugin routes), middleware stack is built.

        **Hooks available:**
        ```typescript
        onStart: async (ctx) => {
          console.log('Server created, routes ready');
          console.log('Number of routes:', ctx.routes.length);
        }
        ```

    - #### **Phase 3: READY**
        > Server is listening and ready to handle requests.

        **Hooks available:**
        ```typescript
        onReady: async (ctx) => {
          const url = `http://${ctx.config.server.host}:${ctx.config.server.port}`;
          console.log(`🚀 Server ready at ${url}`);
        }
        ```

    <br>

- ## Configuration 🔥

    ### AppConfig

    ```typescript
    interface AppConfig {
      // Debug mode
      debug?: boolean;

      // Server configuration
      server?: {
        port?: number;              // Default: 3000
        host?: string;              // Default: 'localhost'
        logging?: LoggingConfig;
      };

      // Client build configuration
      client?: {
        entry: string;              // Client entry point (e.g., './src/client/browser.tsx')
        output: string;             // Output directory
        target?: 'browser' | 'bun';  // Default: 'browser'
        minify?: boolean;            // Default: !debug
        sourcemap?: boolean;         // Default: debug
        external?: string[];         // External dependencies to exclude from bundle
      };

      // API routes configuration
      api?: {
        directory: string;           // Directory to scan for route files
      };

      // Database configuration
      database?: DatabaseConfig | DatabaseConfig[];

      // Internationalization configuration
      i18n?: {
        defaultLanguage: string;
        supportedLanguages: string[];
        basePath?: string;
        fileExtension?: string;      // Default: 'json'
      };

      // Static files serving
      static?: StaticConfig | StaticConfig[];

      // Security configuration
      security?: SecurityConfig;

      // Inline routes
      routes?: RouteDefinition[];

      // Plugins
      plugins?: CruxPlugin[];

      // Custom middleware
      middlewares?: Record<string, AppMiddleware>;
    }
    ```

    <br>

- ## API Reference 🔥

    ### Core Function

    - #### `createApp(config: AppConfig, hooks?: LifecycleHooks): AppInstance`
        > Creates and returns an application instance.

        **Parameters:**
        - `config` - Application configuration
        - `hooks` (optional) - Lifecycle hooks

        **Returns:** AppInstance with `start()`, `stop()`, `restart()` methods

        **Example:**
        ```typescript
        const app = createApp({
          debug: true,
          server: { port: 3000 }
        }, {
          onAwake: async (ctx) => console.log('awake'),
          onStart: async (ctx) => console.log('start'),
          onReady: async (ctx) => console.log('ready'),
          onFinish: async (ctx) => console.log('done'),
          onError: async (ctx, phase, error) => console.error(error)
        });

        await app.start();
        ```

    ### AppInstance

    - #### `app.start(): Promise<void>`
        > Starts the application through all lifecycle phases (REGISTER → AWAKE → START → READY).

    - #### `app.stop(): Promise<void>`
        > Stops the server and cleans up all resources.

    - #### `app.restart(): Promise<void>`
        > Restarts the application (stops then starts).

    - #### `app.getContext(): LifecycleContext`
        > Returns the current lifecycle context with databases, plugins, and configuration.

    - #### `app.getMiddleware(name: string): AppMiddleware | undefined`
        > Retrieves a registered middleware by name.

    ### LifecycleHooks

    ```typescript
    interface LifecycleHooks {
      onConfig?(config: AppConfig): AppConfig;
      onAwake?(ctx: LifecycleContext): Promise<void>;
      onStart?(ctx: LifecycleContext): Promise<void>;
      onReady?(ctx: LifecycleContext): Promise<void>;
      onFinish?(ctx: LifecycleContext): Promise<void>;
      onError?(ctx: LifecycleContext, phase: string, error: Error): Promise<void>;
    }
    ```

    ### LifecycleContext

    ```typescript
    interface LifecycleContext {
      config: AppConfig;
      server: ServerInstance | null;
      databases: Map<string, DB>;
      plugins: CruxPlugin[];
      clientBuild?: any;
    }
    ```

    <br>

- ## Advanced Features 🚀

    - #### Plugin System
        > CruxJS uses a plugin-based architecture. Plugins can:
        - Provide routes
        - Define database schemas
        - Register middleware
        - Hook into lifecycle events

        **Example - Creating a Plugin:**
        ```typescript
        import type { CruxPlugin } from '@cruxjs/base';

        const myPlugin: CruxPlugin = {
          name: 'my-plugin',
          version: '1.0.0',

          register: async (app) => {
            console.log('Plugin registered');
          },

          routes: [
            {
              method: 'GET',
              path: '/my-plugin/status',
              handler: async (ctx) => ctx.json({ status: 'ok' })
            }
          ],

          schemas: [
            {
              name: 'my_table',
              columns: [
                { name: 'id', type: 'INTEGER PRIMARY KEY' },
                { name: 'data', type: 'TEXT' }
              ]
            }
          ],

          middleware: {
            'my-middleware': async (ctx, next) => {
              console.log('Custom middleware');
              return next();
            }
          },

          hooks: {
            onAwake: async (ctx) => console.log('Plugin awake'),
            onStart: async (ctx) => console.log('Plugin start'),
            onReady: async (ctx) => console.log('Plugin ready'),
            onShutdown: async (ctx) => console.log('Plugin shutdown')
          }
        };
        ```

    - #### Multiple Databases
        > Support for multiple database connections:
        ```typescript
        const config: AppConfig = {
          database: [
            {
              name: 'primary',
              connection: './data/primary.db',
              schema: './src/schemas/primary.ts'
            },
            {
              name: 'cache',
              connection: './data/cache.db',
              schema: './src/schemas/cache.ts'
            }
          ]
        };

        const app = createApp(config);
        await app.start();

        // Access databases
        const primaryDb = app.databases.get('primary');
        const cacheDb = app.databases.get('cache');
        ```

    - #### Client Building
        > Automatic client bundle generation using Bun:
        ```typescript
        const config: AppConfig = {
          client: {
            entry: './src/client/browser.tsx',
            output: './dist/client',
            minify: true,
            sourcemap: false,
            external: ['@minejsx/runtime']  // Don't bundle, rely on external
          }
        };
        ```

    - #### i18n Integration
        > Built-in internationalization support:
        ```typescript
        const config: AppConfig = {
          i18n: {
            defaultLanguage: 'en',
            supportedLanguages: ['en', 'ar', 'fr'],
            basePath: './src/shared/static/i18n',
            fileExtension: 'json'
          }
        };
        ```

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
