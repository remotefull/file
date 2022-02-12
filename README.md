<center>
<h2>remotefull/file</h2>
File managing on remote servers made easy.
</center>

<hr>

## Getting started

There are 2 available file remotes right now:

- FtpFileRemote
- SftpFileRemotes

All file remotes extend BaseFileRemote. Feel free to implement your own.

## Usage

1. Install the `@remotefull/file` package using Yarn or NPM
2. Import your desired file remote:

```ts
// Require
const { FtpFileRemote } = require("@remotefull/file");

// ES6
import { FtpFileRemote } from "@remotefull/file";
```

3. Use the file remote:

```
const config = {
    host: "",
    port: 21,
    username: "",
    password: ""
}

const remote = new FtpFileRemote(config)

await remote.connect();
await remote.createFile("hello", "world");
await remote.disconnect();
```

## Example

This package really shines in the abstraction it creates. It provides functions that are the same no matter the remote. This means that you can implement your application logic without caring about the different remotes. For example

```ts
import * as Remotes from "@remotefull/file";

// The application logic itself doesn't need to worry
// about what remote is used.
class YourApp {
  constructor(private remote: Remotes.BaseFileRemote) {}

  public run() {
    if (!(await remote.exists("hello"))) {
      await remote.createFile("hello", "world");
    }
  }
}

// This is just a placeholder for credentials config
const config = {
  // ...
};

const remote = new Remotes.FtpFileRemote(config);
const app = new YourApp(remote);
```
