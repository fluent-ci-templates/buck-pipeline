/**
 * @module buck
 * @description This module provides a set of functions to run common tasks with Buck.
 */

import { dag, type Directory } from "../../deps.ts";
import { getDirectory } from "./lib.ts";

export enum Job {
  build = "build",
  test = "test",
}

export const exclude = [".fluentci", ".git", "target", "buck-out"];

/**
 * @function
 * @description Build the project
 * @param {string | Directory} src
 * @returns  {string}
 */
export async function build(
  src: string | Directory | undefined = "."
): Promise<string> {
  const context = await getDirectory(src);
  const ctr = dag
    .pipeline(Job.build)
    .container()
    .from("rust:1.80-bookworm")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "wget", "zstd"])
    .withExec([
      "wget",
      "https://github.com/facebook/buck2/releases/download/latest/buck2-x86_64-unknown-linux-gnu.zst",
    ])
    .withExec(["zstd", "-d", "buck2-x86_64-unknown-linux-gnu.zst"])
    .withExec(["chmod", "+x", "buck2-x86_64-unknown-linux-gnu"])
    .withExec(["mv", "buck2-x86_64-unknown-linux-gnu", "/usr/local/bin/buck2"])
    .withMountedCache("/app/buck-out", dag.cacheVolume("buck-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["buck2", "--version"])
    .withExec(["buck2", "build", "//...", "--show-output", "--verbose", "4"])
    .withExec(["ls", "-la"]);
  const [stdout, stderr] = await Promise.all([ctr.stdout(), ctr.stderr()]);

  console.log(stdout);
  console.error(stderr);

  return stdout + "\n" + stderr;
}

/**
 * @function
 * @description Run tests
 * @param {string | Directory} src
 * @returns {string}
 */
export async function test(
  src: string | Directory | undefined = "."
): Promise<string> {
  const context = await getDirectory(src);
  const ctr = dag
    .pipeline(Job.test)
    .container()
    .from("rust:1.80-bookworm")
    .withExec(["apt-get", "update"])
    .withExec(["apt-get", "install", "-y", "wget", "zstd"])
    .withExec([
      "wget",
      "https://github.com/facebook/buck2/releases/download/latest/buck2-x86_64-unknown-linux-gnu.zst",
    ])
    .withExec(["zstd", "-d", "buck2-x86_64-unknown-linux-gnu.zst"])
    .withExec(["chmod", "+x", "buck2-x86_64-unknown-linux-gnu"])
    .withExec(["mv", "buck2-x86_64-unknown-linux-gnu", "/usr/local/bin/buck2"])
    .withMountedCache("/app/buck-out", dag.cacheVolume("buck-cache"))
    .withDirectory("/app", context, { exclude })
    .withWorkdir("/app")
    .withExec(["buck2", "--version"])
    .withExec(["buck", "test", "//..."])
    .withExec(["ls", "-la"]);

  const [stdout, stderr] = await Promise.all([ctr.stdout(), ctr.stderr()]);

  console.log(stdout);
  console.error(stderr);

  return stdout + "\n" + stderr;
}

export type JobExec = (src: string | Directory | undefined) => Promise<string>;

export const runnableJobs: Record<Job, JobExec> = {
  [Job.build]: build,
  [Job.test]: test,
};

export const jobDescriptions: Record<Job, string> = {
  [Job.build]: "Build the project",
  [Job.test]: "Run tests",
};
