import { dag, type Directory } from "../../deps.ts";
import { getDirectory } from "./lib.ts";

export enum Job {
  build = "build",
  test = "test",
}

export const exclude = [".fluentci", ".git", "target", "buck-out"];

export const build = async (
  src: string | Directory | undefined = "."
): Promise<string> => {
  const context = await getDirectory(src);
  const ctr = dag
    .pipeline(Job.build)
    .container()
    .from("ghcr.io/fluent-ci-templates/buck:latest")
    .withMountedCache("/app/buck-out", dag.cacheVolume("buck-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["buck2", "build", "//...", "--show-output"])
    .withExec(["ls", "-la"]);

  return ctr.stdout();
};

export const test = async (
  src: string | Directory | undefined = "."
): Promise<string> => {
  const context = await getDirectory(src);
  const ctr = dag
    .pipeline(Job.test)
    .container()
    .from("ghcr.io/fluent-ci-templates/buck:latest")
    .withMountedCache("/app/buck-out", dag.cacheVolume("buck-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["buck", "test", "//..."])
    .withExec(["ls", "-la"]);

  return ctr.stdout();
};

export type JobExec = (src: string | Directory | undefined) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};
