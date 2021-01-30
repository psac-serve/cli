<h1 align="center">PSAC Ban-server client</h1>
<p align="center">A client to manage Minecraft's ban records with extendable parallel module resolutions.</p>

[![Version](https://img.shields.io/npm/v/ban-client.svg)](https://npmjs.org/package/ban-client)
[![Codecov](https://codecov.io/gh/psac-serve/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/psac-serve/cli)
[![Downloads/week](https://img.shields.io/npm/dw/ban-client.svg)](https://npmjs.org/package/ban-client)
[![License](https://img.shields.io/npm/l/ban-client.svg)](https://github.com/psac-serve/cli/blob/master/package.json)

<!-- toc -->

<!-- tocstop -->

## Usage

<!-- usage -->
```sh-session
$ npm install -g ban-client
$ psac COMMAND
running command...
$ psac (-v|--version|version)
ban-client/0.0.0 linux-x64 node-v15.7.0
$ psac --help [COMMAND]
USAGE
  $ psac COMMAND
...
```
<!-- usagestop -->

## Commands

<!-- commands -->
* [`psac autocomplete [SHELL]`](#psac-autocomplete-shell)
* [`psac help [COMMAND]`](#psac-help-command)
* [`psac plugins`](#psac-plugins)
* [`psac plugins:install PLUGIN...`](#psac-pluginsinstall-plugin)
* [`psac plugins:link PLUGIN`](#psac-pluginslink-plugin)
* [`psac plugins:uninstall PLUGIN...`](#psac-pluginsuninstall-plugin)
* [`psac plugins:update`](#psac-pluginsupdate)
* [`psac update [CHANNEL]`](#psac-update-channel)

## `psac autocomplete [SHELL]`

display autocomplete installation instructions

```
USAGE
  $ psac autocomplete [SHELL]

ARGUMENTS
  SHELL  shell type

OPTIONS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

EXAMPLES
  $ psac autocomplete
  $ psac autocomplete bash
  $ psac autocomplete zsh
  $ psac autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v0.3.0/src/commands/autocomplete/index.ts)_

## `psac help [COMMAND]`

display help for psac

```
USAGE
  $ psac help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `psac plugins`

list installed plugins

```
USAGE
  $ psac plugins

OPTIONS
  --core  show core plugins

EXAMPLE
  $ psac plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/index.ts)_

## `psac plugins:install PLUGIN...`

installs a plugin into the CLI

```
USAGE
  $ psac plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  plugin to install

OPTIONS
  -f, --force    yarn install with force flag
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command 
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in 
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ psac plugins:add

EXAMPLES
  $ psac plugins:install myplugin 
  $ psac plugins:install https://github.com/someuser/someplugin
  $ psac plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/install.ts)_

## `psac plugins:link PLUGIN`

links a plugin into the CLI for development

```
USAGE
  $ psac plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

DESCRIPTION
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello' 
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLE
  $ psac plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/link.ts)_

## `psac plugins:uninstall PLUGIN...`

removes a plugin from the CLI

```
USAGE
  $ psac plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

OPTIONS
  -h, --help     show CLI help
  -v, --verbose

ALIASES
  $ psac plugins:unlink
  $ psac plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/uninstall.ts)_

## `psac plugins:update`

update installed plugins

```
USAGE
  $ psac plugins:update

OPTIONS
  -h, --help     show CLI help
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v1.9.5/src/commands/plugins/update.ts)_

## `psac update [CHANNEL]`

update the psac CLI

```
USAGE
  $ psac update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_
<!-- commandsstop -->
