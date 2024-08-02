# Buck Pipeline

[![fluentci pipeline](https://shield.fluentci.io/x/buck)](https://pkg.fluentci.io/buck)
![deno compatibility](https://shield.deno.dev/deno/^1.41)
[![](https://jsr.io/badges/@fluentci/buck)](https://jsr.io/@fluentci/buck)
[![](https://img.shields.io/codecov/c/gh/fluent-ci-templates/buck-pipeline)](https://codecov.io/gh/fluent-ci-templates/buck-pipeline)

A ready-to-use Pipeline for [Buck](https://buck2.build/) projects.

## 🚀 Usage

Run the following command in your project:

```bash
fluentci run buck
```

Or, if you want to use it as a template:

```bash
fluentci init -t buck
```

This will create a `.fluentci` folder in your project.

Now you can run the pipeline with:

```bash
fluentci run .
```

## 🧩 Dagger Module

Use as a [Dagger](https://dagger.io) module:

```bash
dagger install github.com/fluent-ci-templates/buck-pipeline@main
```

Call functions from the module:

```bash
dagger call -m github.com/fluent-ci-templates/buck-pipeline@main build --src .
```

## Jobs

| Job       | Description   |
| --------- | ------------- |
| build     | Build project |
| test      | Run tests     |

## Programmatic usage

You can also use this pipeline programmatically:

```ts
import { test, build } from "jsr:@fluentci/buck";

await test(".");
await build(".");
```
