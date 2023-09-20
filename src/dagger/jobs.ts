import Client from "../../deps.ts";

export enum Job {
  build = "build",
  test = "test",
}

export const exclude = [".fluentci", ".git", "target", "buck-out"];

export const build = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.build)
    .container()
    .from("ghcr.io/fluent-ci-templates/buck:latest")
    .withExec(["rustup", "toolchain", "install", "stable"])
    .withExec(["rustup", "default", "stable"])
    .withMountedCache("/app/buck-out", client.cacheVolume("buck-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["buck2", "build", "//...", "--show-output"])
    .withExec(["ls", "-la"]);

  const result = await ctr.stdout();

  console.log(result);
};

export const test = async (client: Client, src = ".") => {
  const context = client.host().directory(src);
  const ctr = client
    .pipeline(Job.test)
    .container()
    .from("ghcr.io/fluent-ci-templates/buck:latest")
    .withExec(["rustup", "toolchain", "install", "stable"])
    .withExec(["rustup", "default", "stable"])
    .withMountedCache("/app/buck-out", client.cacheVolume("buck-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["buck", "test", "//..."])
    .withExec(["ls", "-la"]);

  const result = await ctr.stdout();

  console.log(result);
};

export type JobExec = (
  client: Client,
  src?: string
) =>
  | Promise<void>
  | ((
      client: Client,
      src?: string,
      options?: {
        ignore: string[];
      }
    ) => Promise<void>);

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};
