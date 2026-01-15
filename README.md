<!-- ╔══════════════════════════════ BEG ══════════════════════════════╗ -->

<br>
<div align="center">
    <p>
        <img src="./assets/img/logo.png" alt="logo" style="" height="60" />
    </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/v-0.1.4-black"/>
    <a href="https://github.com/cruxjs-org"><img src="https://img.shields.io/badge/🔥-@cruxjs-black"/></a>
    <br>
    <img src="https://img.shields.io/badge/coverage-~%25-brightgreen" alt="Test Coverage" />
    <img src="https://img.shields.io/github/issues/cruxjs-org/app?style=flat" alt="Github Repo Issues" />
    <img src="https://img.shields.io/github/stars/cruxjs-org/app?style=social" alt="GitHub Repo stars" />
</div>
<br>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ DOC ══════════════════════════════╗ -->

- ## Overview 👀

    - #### Why ?
        > To provide a unified full-stack framework that orchestrates server configuration, client builds, i18n, styling, SPA integration, and plugins in a single declarative configuration with zero boilerplate.

    - #### When ?
        > When you need a production-ready full-stack application with:
        > - Server configuration (port, logging, middleware)
        > - Automatic client bundling with Bun
        > - Style preprocessing (SCSS/Sass)
        > - i18n setup and configuration
        > - SPA plugin integration
        > - Plugin system for extensibility
        > - Unified lifecycle management

        > When you want to build modern full-stack SPAs without framework complexity.

    <br>
    <br>

- ## Quick Start 🔥

    > install [`hmm`](https://github.com/minejs-org/hmm) first.

    ```bash
    # in your terminal
    hmm i @cruxjs/app
    ```

    <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>

    - #### Setup

        > Create your application configuration in a single file:

        ```typescript
        import { createApp, AppConfig } from '@cruxjs/app';
        import { serverSPA }            from '@cruxjs/spa';

        const appConfig: AppConfig = {
            debug           : true,

            // Server configuration
            server: {
                port        : 3000,
                host        : 'localhost',
                logging: {
                    level   : 'info',
                    pretty  : true
                }
            },

            // Static files
            static: {
                path        : '/static',
                directory   : './src/shared/static',
                maxAge      : 3600
            },

            // Client build configuration
            client: {
                entry       : './src/app/client.ts',
                output      : './src/shared/static/dist/js',
                minify      : true,
                sourcemap   : false
            },

            // i18n configuration
            i18n: {
                defaultLanguage     : 'en',
                supportedLanguages  : ['en', 'ar'],
                basePath            : './src/shared/static/dist/i18n'
            },

            // Style build configuration
            style: {
                entry       : './src/app/ui/style/index.scss',
                output      : './src/shared/static/dist/css/min.css',
                minify      : true
            },

            plugins         : []
        };

        // Create and start app
        const app           = createApp(appConfig);
        app.start();
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>
        <br>

    - #### Usage

        > Add plugins and configure SPA:

        ```typescript
        // Create SPA plugin
        const spaPlugin = serverSPA({
            baseUrl             : 'http://localhost:3000',
            clientEntry         : './src/app/client.ts',
            clientScriptPath    : ['/static/dist/js/client.js'],
            clientStylePath     : ['/static/dist/css/min.css'],

            pages: [
                {
                    title       : 'Home',
                    path        : '/',
                    description : 'Welcome to our app'
                }
            ],

            autoBootstrapClient : true
        }, appConfig);

        // Add plugin to app
        appConfig.plugins.push(spaPlugin);

        // Start app
        const app = createApp(appConfig);
        app.start();
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>

        - #### Server Configuration

            ```typescript
            server: {
                // Port and host
                port            : 3000,
                host            : 'localhost',

                // Logging configuration
                logging: {
                    level       : 'info',      // 'debug' | 'info' | 'warn' | 'error'
                    pretty      : true        // Pretty-print logs
                },

                // CORS configuration (optional)
                cors: {
                    origin      : 'http://localhost:3000',
                    credentials : true
                },

                // Middleware (optional)
                middleware: [
                    // Add custom middleware here
                ]
            }
            ```

        - #### Client Build Configuration

            ```typescript
            client: {
                // Entry file for client bundle
                entry           : './src/app/client.ts',

                // Output directory
                output          : './src/shared/static/dist/js',

                // Build options
                minify          : true,         // Minify bundle
                sourcemap       : false,        // Generate source maps
                target          : 'browser',    // Build target (browser, node, etc.)
                external        : [],           // External dependencies

                // Custom build configuration
                define: {
                    'process.env.VERSION': '"1.0.0"'
                }
            }
            ```

        - #### i18n Configuration

            ```typescript
            i18n: {
                // Default language
                defaultLanguage     : 'en',

                // Supported languages
                supportedLanguages  : ['en', 'ar', 'fr', 'de'],

                // Base path for translation files
                basePath            : './src/shared/static/dist/i18n',

                // Custom storage (optional)
                storage             : 'localStorage'
            }
            ```

        - #### Style Build Configuration

            ```typescript
            style: {
                // Entry SCSS/Sass file
                entry               : './src/app/ui/style/index.scss',

                // Output CSS file
                output              : './src/shared/static/dist/css/min.css',

                // Build options
                minify              : true,     // Minify CSS
                sourcemap           : false,    // Generate source maps

                // Include paths
                includePaths: [
                    './src/app/ui/components'
                ]
            }
            ```

        - #### Middleware

            ```typescript
            // Add custom middleware for request/response handling
            server: {
                middleware: [
                    {
                        path    : '/api/*',
                        handler : async (req, res) => {
                            // Custom API handling
                        }
                    }
                ]
            }
            ```

        - #### Plugins

            ```typescript
            // Create custom plugins
            const myPlugin = {
                name            : 'my-plugin',
                version         : '1.0.0',

                onRegister      : async (app) => {
                    console.log('Plugin registered');
                },

                onAwake         : async (ctx) => {
                    console.log('Plugin awake');
                },

                onStart         : async (ctx) => {
                    console.log('Plugin starting');
                },

                onReady         : async (ctx) => {
                    console.log('Plugin ready');
                }
            };

            appConfig.plugins.push(myPlugin);
            ```

    <br>
    <br>

- ## Complete Example 📑

    - ### src/index.ts

        ```typescript
        import { createApp, AppConfig } from '@cruxjs/app';
        import { serverSPA }            from '@cruxjs/spa';

        import * as HomePage            from './app/ui/pages/home';
        import * as ErrorPage           from './app/ui/pages/error';

        const appConfig: AppConfig = {
            debug: true,

            server: {
                port            : 3000,
                host            : 'localhost',
                logging: {
                    level       : 'info',
                    pretty      : true
                }
            },

            static: {
                path            : '/static',
                directory       : './src/shared/static',
                maxAge          : 3600,
                index           : ['index.html']
            },

            client: {
                entry           : './src/app/client.ts',
                output          : './src/shared/static/dist/js',
                minify          : true,
                sourcemap       : false,
            },

            i18n: {
                defaultLanguage     : 'en',
                supportedLanguages  : ['en', 'ar'],
                basePath            : './src/shared/static/dist/i18n'
            },

            style: {
                entry           : './src/app/ui/style/index.scss',
                output          : './src/shared/static/dist/css/min.css',
                minify          : true,
                sourcemap       : false,
            },

            plugins             : []
        };

        const spaPlugin = serverSPA({
            baseUrl             : 'http://localhost:3000',
            clientEntry         : './src/app/client.ts',
            clientScriptPath    : ['/static/dist/js/client.js'],
            clientStylePath     : ['/static/dist/css/min.css'],

            author              : 'Your Name',
            authorUrl           : 'https://github.com/yourname',
            defaultDescription  : 'My CruxJS Application',
            defaultKeywords     : ['cruxjs', 'framework', 'spa'],

            pages               : [HomePage.meta],
            errorPages          : [ErrorPage.meta],
            enableAutoNotFound  : true,
            autoBootstrapClient : true
        }, appConfig);

        appConfig.plugins.push(spaPlugin);

        const app = createApp(appConfig);
        app.start();
        ```

    - ### Directory Structure

        ```
        src/
        ├── index.ts                    # Main app config & entry
        ├── app/
        │   ├── client.ts               # Client config
        │   └── ui/
        │       ├── pages/
        │       │   ├── home.tsx        # Home page component
        │       │   └── error.tsx       # Error page component
        │       └── style/
        │           └── index.scss      # Global styles
        └── shared/
            └── static/
                ├── img/
                │   └── logo.png
                └── dist/
                    ├── js/             # Client bundle output
                    ├── css/            # Style output
                    └── i18n/           # Translations
        ```

    <br>
    <br>

- ## Lifecycle Hooks 🔄

    ```
    ┌─────────────────────────────────────────────────────────┐
    │                                                         │
    │  createApp(config)                                      │
    │                                                         │
    ├─ INITIALIZE Phase                                       │
    │  ├─ Load configuration                                  │
    │  ├─ Initialize plugins                                  │
    │  └─ Setup server                                        │
    │                                                         │
    ├─ BUILD Phase (in background)                            │
    │  ├─ Build client bundle (Bun)                           │
    │  ├─ Build styles (Sass)                                 │
    │  ├─ Setup i18n system                                   │
    │  └─ Run plugin onRegister hooks                         │
    │                                                         │
    ├─ AWAKE Phase                                            │
    │  ├─ Register routes                                     │
    │  ├─ Run plugin onAwake hooks                            │
    │  └─ Verify configuration                                │
    │                                                         │
    ├─ START Phase                                            │
    │  ├─ Start HTTP server                                   │
    │  ├─ Run plugin onStart hooks                            │
    │  └─ Listen on configured port                           │
    │                                                         │
    └─ READY Phase                                            │
       ├─ Run plugin onReady hooks                            │
       ├─ Server accepting requests                           │
       └─ SPA fully operational                               │
    ```

    <br>
    <br>

- ## API Reference 📚

    - ### AppConfig

        ```typescript
        interface AppConfig {
            // Debug mode
            debug?              : boolean;

            // Server configuration (REQUIRED)
            server: {
                port            : number;
                host            : string;
                logging?: {
                    level       : 'debug' | 'info' | 'warn' | 'error';
                    pretty?     : boolean;
                };
                cors?           : CorsConfig;
                middleware?     : Middleware[];
            };

            // Static files serving
            static?: {
                path            : string;       // URL path for static files
                directory       : string;       // File system directory
                maxAge?         : number;       // Cache duration (seconds)
                index?          : string[];     // Index files to serve
            };

            // Client build configuration
            client?: {
                entry           : string;
                output          : string;
                minify?         : boolean;
                sourcemap?      : boolean;
                target?         : string;
                external?       : string[];
                define?         : Record<string, any>;
            };

            // i18n configuration
            i18n?               : I18nConfig;

            // Style build configuration
            style?: {
                entry           : string;
                output          : string;
                minify?         : boolean;
                sourcemap?      : boolean;
                includePaths?   : string[];
            };

            // Plugins
            plugins?            : CruxPlugin[];

            // Database configuration (optional)
            db?                 : DatabaseConfig;
        }
        ```

        <div align="center"> <img src="./assets/img/line.png" alt="line" style="display: block; margin-top:20px;margin-bottom:20px;width:500px;"/> </div>

    - ### Application Instance

        ```typescript
        const app = createApp(config);

        // Start the application
        app.start();

        // Get configuration
        app.getConfig();

        // Register a plugin
        app.use(plugin);

        // Get a plugin instance
        app.getPlugin('plugin-name');

        // Access logger
        app.logger.info('Message');

        // Access database (if configured)
        app.db?.query('SELECT * FROM users');

        // Access plugin registry
        app.plugins.getAll();
        ```

    - ### Plugin Interface

        ```typescript
        interface CruxPlugin {
            name            : string;
            version         : string;
            routes?         : RouteDefinition[];
            middleware?     : AppMiddleware[];

            onRegister?     : (app: AppInstance) => Promise<void>;
            onAwake?        : (ctx: LifecycleContext) => Promise<void>;
            onStart?        : (ctx: LifecycleContext) => Promise<void>;
            onReady?        : (ctx: LifecycleContext) => Promise<void>;
            onShutdown?     : (ctx: LifecycleContext) => Promise<void>;
        }
        ```

    <br>
    <br>

- ## Best Practices ✨

    - #### Configuration Structure

        ```typescript
        // ✅ DO: Keep configuration centralized
        const appConfig: AppConfig = {
            debug       : process.env.DEBUG === 'true',
            server      : { port: parseInt(process.env.PORT || '3000') },
            // ... rest of config
        };

        // ❌ DON'T: Scatter configuration
        const app = createApp({});
        app.config.server.port = 3000;
        app.config.client.entry = './src/app/client.ts';
        ```

    - #### Plugin Usage

        ```typescript
        // ✅ DO: Define plugins before creating app
        const plugins = [
            spaPlugin,
            authPlugin,
            analyticsPlugin
        ];

        const app = createApp({
            plugins,
            // ... rest of config
        });

        // ❌ DON'T: Add plugins after app creation
        app.use(plugin);
        ```

    - #### Static Files

        ```typescript
        // ✅ DO: Use static configuration
        static: {
            path        : '/static',
            directory   : './src/shared/static',
            maxAge      : 3600
        }

        // ❌ DON'T: Manual middleware setup
        app.use(express.static('./src/shared/static'));
        ```

    - #### Build Configuration

        ```typescript
        // ✅ DO: Configure builds in appConfig
        client: {
            entry       : './src/app/client.ts',
            output      : './dist/js',
            minify      : !config.debug
        }

        // ❌ DON'T: Rely on external build tools
        // Use webpack/vite separately
        ```

    - #### Importing UI Libraries in SCSS

        ```scss
        // app.scss - Main Application Styles
        //
        // Made with ❤️ by Maysara.


        // ╔═══════════════════════════════════════ PACK ═════════════════════════════════════════╗

            // 1. Variables (customize your theme here)
            @use 'variables' as *;

            // 2. Utility Library (MineUI utilities via SCSS)
            @use '../../../../node_modules/@mineui/utils/dist/index.scss' as *;

            // 3. Additional UI libraries (optional)
            // @use '../../../../node_modules/@mineui/components/dist/components.scss' as *;

        // ╚══════════════════════════════════════════════════════════════════════════════════════╝


        // ╔═══════════════════════════════════════ CORE ═════════════════════════════════════════╗

            // Your custom base styles here

        // ╚══════════════════════════════════════════════════════════════════════════════════════╝
        ```

    - #### Error Handling

        ```typescript
        // ✅ DO: Define error pages via SPA plugin
        const spaPlugin = serverSPA({
            errorPages: [
                {
                    statusCode  : 404,
                    title       : 'Not Found',
                    path        : '/*'
                }
            ]
        });

        // ❌ DON'T: Manual error handlers
        app.get('*', (req, res) => {
            res.status(404).send('Not found');
        });
        ```

    <br>
    <br>

- ## Integration with Other CruxJS Libraries 🔗

    > @cruxjs/app integrates seamlessly with:

    - **[@cruxjs/spa](https://github.com/cruxjs-org/spa)**
        > SPA plugin for server-side rendering and routing

    - **[@cruxjs/client](https://github.com/cruxjs-org/client)**
        > Client-side application manager with routing and lifecycle

    - **[@cruxjs/base](https://github.com/cruxjs-org/base)**
        > Base types and plugin system

    - **[@minejs/i18n](https://github.com/minejs-org/i18n)**
        > i18n system (automatic setup)

    - **[@minejs/server](https://github.com/minejs-org/server)**
        > HTTP server (automatic setup)

    - **[@minejs/browser](https://github.com/minejs-org/browser)**
        > Browser utilities

    - **[@mineui/utils](https://github.com/minejs-org/mineui)**
        > UI utilities (import via SCSS in your stylesheet)

    - **Bun**
        > Client bundler (automatic client builds)

    - **Sass**
      >Style preprocessing (automatic style builds)

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->



<!-- ╔══════════════════════════════ END ══════════════════════════════╗ -->

<br>
<br>

---

<div align="center">
    <a href="https://github.com/maysara-elshewehy"><img src="https://img.shields.io/badge/by-Maysara-black"/></a>
</div>

<!-- ╚═════════════════════════════════════════════════════════════════╝ -->
