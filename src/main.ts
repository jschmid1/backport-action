import * as core from "@actions/core";
import { Backport, Config } from "./backport";
import { Github } from "./github";
import { Git } from "./git";
import { execa } from "execa";

/**
 * Called from the action.yml.
 *
 * Is separated from backport for testing purposes
 */
async function run(): Promise<void> {
  const token = core.getInput("github_token", { required: true });
  const pwd = core.getInput("github_workspace", { required: true });
  const pattern = core.getInput("label_pattern");
  const description = core.getInput("pull_description");
  const title = core.getInput("pull_title");
  const copy_labels_pattern = core.getInput("copy_labels_pattern");
  const target_branches = core.getInput("target_branches");
  const merge_commits = core.getInput("merge_commits");
  const copy_assignees = core.getInput("copy_assignees");
  const copy_milestone = core.getInput("copy_milestone");
  const copy_requested_reviewers = core.getInput("copy_requested_reviewers");
  const upstream_repo = core.getInput("upstream_repo");

  if (merge_commits != "fail" && merge_commits != "skip") {
    const message = `Expected input 'merge_commits' to be either 'fail' or 'skip', but was '${merge_commits}'`;
    console.error(message);
    core.setFailed(message);
    return;
  }

  const github = new Github(token);
  const git = new Git(execa, token);
  const config: Config = {
    pwd,
    labels: { pattern: pattern === "" ? undefined : new RegExp(pattern) },
    pull: { description, title },
    copy_labels_pattern:
      copy_labels_pattern === "" ? undefined : new RegExp(copy_labels_pattern),
    target_branches: target_branches === "" ? undefined : target_branches,
    commits: { merge_commits },
    copy_assignees: copy_assignees === "true",
    copy_milestone: copy_milestone === "true",
    copy_requested_reviewers: copy_requested_reviewers === "true",
    upstream_repo: upstream_repo !== "" ? upstream_repo : undefined!,
  };
  const backport = new Backport(github, config, git);

  return backport.run();
}

// this would be executed on import in a test file
run();
