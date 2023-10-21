import Client, { connect } from "../../deps.ts";

export enum Job {
  build = "build",
  test = "test",
}

export const exclude = [".fluentci", ".git", "target", "buck-out"];

export const build = async (src = ".") => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.build)
      .container()
      .from("ghcr.io/fluentci-io/pkgx:latest")
      .withExec(["pkgx", "install", "zstd", "wget"])
      .withExec([
        "wget",
        "https://github.com/facebook/buck2/releases/download/latest/buck2-x86_64-unknown-linux-gnu.zst",
      ])
      .withExec(["zstd", "-d", "buck2-x86_64-unknown-linux-gnu.zst"])
      .withExec(["chmod", "+x", "buck2-x86_64-unknown-linux-gnu"])
      .withExec([
        "mv",
        "buck2-x86_64-unknown-linux-gnu",
        "/usr/local/bin/buck2",
      ])
      .withMountedCache("/app/buck-out", client.cacheVolume("buck-cache"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["buck2", "build", "//...", "--show-output"])
      .withExec(["ls", "-la"])
      .withExec(["sh", "-c", "mkdir -p output && cp -r buck-out output"]);

    const result = await ctr.stdout();
    console.log(result);

    await ctr.directory("/app/output").export("output");
  });
  return "Done";
};

export const test = async (src = ".") => {
  await connect(async (client: Client) => {
    const context = client.host().directory(src);
    const ctr = client
      .pipeline(Job.test)
      .container()
      .from("ghcr.io/fluentci-io/pkgx:latest")
      .withExec(["pkgx", "install", "zstd", "wget"])
      .withExec([
        "wget",
        "https://github.com/facebook/buck2/releases/download/latest/buck2-x86_64-unknown-linux-gnu.zst",
      ])
      .withExec(["zstd", "-d", "buck2-x86_64-unknown-linux-gnu.zst"])
      .withExec(["chmod", "+x", "buck2-x86_64-unknown-linux-gnu"])
      .withExec([
        "mv",
        "buck2-x86_64-unknown-linux-gnu",
        "/usr/local/bin/buck2",
      ])
      .withMountedCache("/app/buck-out", client.cacheVolume("buck-cache"))
      .withDirectory("/app", context, { exclude })
      .withWorkdir("/app")
      .withExec(["buck2", "test", "//..."])
      .withExec(["ls", "-la"]);

    const result = await ctr.stdout();

    console.log(result);
  });
  return "Done";
};

export type JobExec = (src?: string) =>
  | Promise<string>
  | ((
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<string>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};
