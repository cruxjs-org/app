<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.0.6-black"/>
    <img src="https://img.shields.io/badge/🔥-@cruxjs-black"/>
    <br>
    <img src="https://img.shields.io/github/issues/cruxjs-org/app?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/cruxjs-org/app?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Quick Start 🔥

    > **_CruxJS is a full-stack framework orchestrator built on [@minejs](https://github.com/minejs-org) that empowers developers to build modern web applications with **zero configuration**. It orchestrates without dictating—providing a plugin-based architecture where you control the flow._**

    - ### Setup

        > First, install [`hmm`](https://github.com/minejs-org/hmm) — the package manager for the CruxJS ecosystem.

        ```bash
        # Install CruxJS App
        hmm i @cruxjs/app

        # Or install with plugins
        hmm i @cruxjs/app @cruxplug/spa
        ```

    - ### Basic Usage

        ```typescript
        import { createApp, type AppConfig } from '@cruxjs/app';

        const config: AppConfig = {
          debug: true,

          // Server configuration
          server: {
            port: 3000,
            host: 'localhost'
          },

          // Client build configuration (bundles with Bun)
          client: {
            entry: './src/client/browser.tsx',
            output: './src/shared/static/dist/js',
            minify: true,
            sourcemap: false
          },

          // UI library (installs from npm and exports min.css)
          ui: {
            package: '@mineui/core',
            output: './src/shared/static/dist/css'
          },

          // Custom styles (compiles SCSS/CSS)
          style: {
            entry: './src/client/ui/style/index.scss',
            output: './src/shared/static/dist/css/extra.css',
            minify: true,
            sourcemap: false
          },

          // Static files serving
          static: {
            path: '/static',
            directory: './src/shared/static',
            maxAge: 3600
          },

          // Plugins (SPA, API routes, databases, etc.)
          plugins: [/* your plugins */]
        };

        // Create and run the app
        const app = createApp(config);
        await app.start();
        ```

    <br>

- ## Complete Example 📖

    ### Directory Structure

    ```
    src/
    ├── index.ts                 # Entry point (app config + setup)
    ├── client/
    │   ├── browser.tsx          # Client entry
    │   └── ui/
    │       ├── App.tsx
    │       ├── pages/           # Page components
    │       └── style/
    │           └── index.scss   # Custom styles
    ├── server/
    │   ├── api/
    │   │   └── index.ts         # API routes
    │   └── schema.ts            # Database schemas
    └── shared/
        └── static/              # Static assets (generated files here)
    ```

    ### 1. Server Entry Point

    **src/index.ts**
    ```typescript
    import { createApp, type AppConfig } from '@cruxjs/app';
    import { serverSPA } from '@cruxplug/spa';

    const spaPlugin = serverSPA({
      baseUrl: 'http://localhost:3000',
      clientEntry: './src/client/browser.tsx',
      clientScriptPath: ['/static/dist/js/browser.js'],
      clientStylePath: ['/static/dist/css/min.css', '/static/dist/css/extra.css'],

      // SEO & E-E-A-T configuration
      author: 'Your Team',
      authorUrl: 'https://example.com/about',
      defaultDescription: 'Your app description',
      defaultKeywords: ['key', 'words'],

      enableAutoNotFound: true,
      pages: [
        {
          title: 'Home',
          path: '/',
          description: 'Welcome',
          keywords: ['home']
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
      debug: true,

      server: {
        port: 3000,
        host: 'localhost',
        logging: { level: 'info', pretty: true }
      },

      // Build configuration
      client: {
        entry: './src/client/browser.tsx',
        output: './src/shared/static/dist/js',
        minify: true
      },

      ui: {
        package: '@mineui/core',
        output: './src/shared/static/dist/css'
      },

      style: {
        entry: './src/client/ui/style/index.scss',
        output: './src/shared/static/dist/css/extra.css',
        minify: true
      },

      static: {
        path: '/static',
        directory: './src/shared/static',
        maxAge: 3600
      },

      plugins: [spaPlugin]
    };

    const app = createApp(config);
    await app.start();
    ```

    ### 2. Client Entry Point

    **src/client/browser.tsx**
    ```typescript
    import { mount } from '@minejs/jsx';
    import { App } from './ui/App';
    import { ClientManager } from '@cruxjs/client';
    import { HomePage } from './ui/pages/HomePage';
    import { NotFoundPage } from './ui/pages/NotFoundPage';

    const clientManager = new ClientManager({
      debug: true,
      routes: {
        '/': HomePage,
        '/about': AboutPage,
        // ...more routes
      },
      notFoundComponent: NotFoundPage,
      errorComponent: ErrorPage
    });

    (async () => {
      await clientManager.boot();
      mount(<App />, '#app');
      await clientManager.ready('#app-main');
    })();
    ```

    ### 3. Define API Routes

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
          return ctx.json({ created: true }, { status: 201 });
        }
      }
    ];
    ```

    ### 4. Add Custom Styles

    **src/client/ui/style/index.scss**
    ```scss
    // Import UI library variables (if available)
    @import '@mineui/core/scss/variables';

    // Custom styles
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
    }

    .app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    // More custom styles...
    ```

- ## How It Works 🏗️

    CruxJS orchestrates your full-stack application through **4 lifecycle phases**:

    - #### **Phase 0: REGISTER**
        Plugins register and declare their capabilities (routes, schemas, middleware).

    - #### **Phase 1: AWAKE**
        - Client is built using Bun's bundler
        - UI library (e.g., @mineui/core) is installed and CSS is extracted
        - Custom SCSS/CSS is compiled using Dart Sass
        - Databases are initialized with plugin schemas
        - i18n is set up

        **Output structure:**
        ```
        src/shared/static/dist/
        ├── js/
        │   └── browser.js          (bundled client)
        └── css/
            ├── min.css             (UI library CSS)
            └── extra.css           (compiled custom styles)
        ```

    - #### **Phase 2: START**
        - Server is created with @minejs/server
        - Routes are merged (user routes + plugin routes)
        - Middleware stack is built
        - Static files handler is configured

    - #### **Phase 3: READY**
        - Server is listening and ready to handle requests
        - Plugins are fully operational

    <br>

- ## Building Your App 🛠️

    ### Client Build (JavaScript)
    ```typescript
    client: {
      entry: './src/client/browser.tsx',
      output: './src/shared/static/dist/js',
      target: 'browser',  // or 'bun'
      minify: true,       // Minify in production
      sourcemap: false,   // Source maps in development
      external: []        // Dependencies to exclude
    }
    ```
    Uses Bun's bundler to create optimized JavaScript bundles.

    ### UI Library Build (CSS from npm)
    ```typescript
    ui: {
      package: '@mineui/core',  // Any npm package
      output: './src/shared/static/dist/css'
    }
    ```
    - Installs the UI package from npm
    - Extracts `dist/mineui.css` and copies it as `min.css`
    - Perfect for pre-built component libraries

    ### Styles Build (SCSS to CSS)
    ```typescript
    style: {
      entry: './src/client/ui/style/index.scss',
      output: './src/shared/static/dist/css/extra.css',
      minify: true,
      sourcemap: false
    }
    ```
    - Compiles SCSS/CSS using Dart Sass (pure CSS output)
    - Minifies output in production
    - No JavaScript wrappers—just clean CSS files

    ### All Together
    The SPA plugin links everything:
    ```typescript
    import { serverSPA } from '@cruxplug/spa';

    const spaPlugin = serverSPA({
      baseUrl: 'http://localhost:3000',
      clientEntry: './src/client/browser.tsx',
      clientScriptPath: ['/static/dist/js/browser.js'],
      clientStylePath: [
        '/static/dist/css/min.css',      // UI library
        '/static/dist/css/extra.css'     // Custom styles
      ],
      // ...SEO/E-E-A-T configuration
    });
    ```

    <br>

- ## Lifecycle Hooks 🔄

    Control your application at each phase:

    ```typescript
    createApp(config, {
      onAwake: async (ctx) => {
        // Databases ready, client built, plugins initialized
        // Perfect for: seed data, cache warming
        const db = ctx.databases.get('default');
        await db.query('INSERT INTO ...');
      },

      onStart: async (ctx) => {
        // Server created, routes merged, middleware ready
        // Perfect for: logging setup, route inspection
        console.log(`${ctx.routes.length} routes registered`);
      },

      onReady: async (ctx) => {
        // Server listening and ready
        // Perfect for: external service notifications
        const url = `http://${ctx.config.server.host}:${ctx.config.server.port}`;
        console.log(`🚀 Live at ${url}`);
      },

      onFinish: async (ctx) => {
        // Graceful shutdown
        // Perfect for: cleanup, connection closing
      },

      onError: async (ctx, phase, error) => {
        // Error handling across all phases
        console.error(`Error in ${phase}:`, error);
      }
    });
    ```

    <br>

- ## Plugins 🔌

    Extend CruxJS with plugins. They integrate seamlessly into the lifecycle:

    ```typescript
    import type { CruxPlugin } from '@cruxjs/base';

    const myPlugin: CruxPlugin = {
      name: 'my-plugin',
      version: '1.0.0',

      // Provide routes
      routes: [
        {
          method: 'GET',
          path: '/plugin/status',
          handler: async (ctx) => ctx.json({ status: 'ok' })
        }
      ],

      // Define database schemas
      schemas: [
        {
          name: 'my_table',
          columns: [
            { name: 'id', type: 'INTEGER PRIMARY KEY' },
            { name: 'data', type: 'TEXT' }
          ]
        }
      ],

      // Register middleware
      middleware: {
        'my-middleware': async (ctx, next) => {
          console.log('Before request');
          const result = await next();
          console.log('After request');
          return result;
        }
      },

      // Hook into lifecycle
      hooks: {
        onAwake: async (ctx) => console.log('Plugin awake'),
        onStart: async (ctx) => console.log('Plugin start'),
        onReady: async (ctx) => console.log('Plugin ready'),
        onShutdown: async (ctx) => console.log('Plugin shutdown')
      }
    };

    // Use in config
    const config: AppConfig = {
      plugins: [myPlugin]
    };
    ```

    **Popular Plugins:**
    - [@cruxplug/spa](https://github.com/cruxplug-org/spa) — Single Page Application with SEO/E-E-A-T
    - More coming soon...

    <br>

- ## Database Support 📊

    Configure one or multiple databases:

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

    // Access in lifecycle hooks or plugins
    const app = createApp(config);
    const primaryDb = app.getContext().databases.get('primary');
    const cacheDb = app.getContext().databases.get('cache');
    ```

    <br>

- ## Internationalization (i18n) 🌍

    Built-in multi-language support:

    ```typescript
    const config: AppConfig = {
      i18n: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'ar', 'fr', 'es'],
        basePath: './src/shared/static/i18n',
        fileExtension: 'json'
      }
    };
    ```

    **Directory structure:**
    ```
    src/shared/static/i18n/
    ├── en.json
    ├── ar.json
    ├── fr.json
    └── es.json
    ```

    <br>

- ## Configuration 🔥

    ### AppConfig Interface

    ```typescript
    interface AppConfig {
      // Enable debug mode (affects minification, sourcemaps)
      debug?: boolean;

      // Server configuration
      server?: {
        port?: number;              // Default: 3000
        host?: string;              // Default: 'localhost'
        logging?: {
          level?: 'debug' | 'info' | 'warn' | 'error';
          pretty?: boolean;
        };
      };

      // Client build (Bun bundler)
      client?: {
        entry: string;              // Entry point (e.g., './src/client/browser.tsx')
        output: string;             // Output directory
        target?: 'browser' | 'bun';
        minify?: boolean;           // Default: !debug
        sourcemap?: boolean;        // Default: debug
        external?: string[];        // Don't bundle these
      };

      // UI Library (npm package)
      ui?: {
        package: string;            // Package name (e.g., '@mineui/core')
        output: string;             // CSS output directory
      };

      // Custom styles (SCSS/CSS)
      style?: {
        entry: string;              // Entry SCSS/CSS file
        output: string;             // CSS output file (e.g., 'extra.css')
        minify?: boolean;           // Default: !debug
        sourcemap?: boolean;        // Default: debug
      };

      // Static files
      static?: {
        path: string;               // Web path (e.g., '/static')
        directory: string;          // Disk directory
        maxAge?: number;            // Cache duration in seconds
        index?: string[];           // Default files
      };

      // Database configuration
      database?: DatabaseConfig | DatabaseConfig[];

      // Internationalization
      i18n?: {
        defaultLanguage: string;
        supportedLanguages: string[];
        basePath?: string;
        fileExtension?: string;     // Default: 'json'
      };

      // Inline routes
      routes?: RouteDefinition[];

      // Plugins
      plugins?: CruxPlugin[];

      // Custom middleware
      middlewares?: Record<string, AppMiddleware>;
    }
    ```

    <br>

    <br>

- ## API Reference 🔥

    ### Core Function

    ```typescript
    import { createApp, type AppConfig } from '@cruxjs/app';

    const app = createApp(config, {
      onAwake: async (ctx) => { /* ... */ },
      onStart: async (ctx) => { /* ... */ },
      onReady: async (ctx) => { /* ... */ },
      onFinish: async (ctx) => { /* ... */ },
      onError: async (ctx, phase, error) => { /* ... */ }
    });

    await app.start();
    ```

    ### AppInstance Methods

    - `app.start()` — Start through all lifecycle phases
    - `app.stop()` — Stop server and cleanup
    - `app.restart()` — Restart the application
    - `app.getContext()` — Get current lifecycle context

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
