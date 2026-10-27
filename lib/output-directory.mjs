import { lstat, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

async function inspect(candidate) {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

export async function planOutputDirectory({ repositoryRoot, requestedOutput = "dist" }) {
  const root = path.resolve(repositoryRoot);
  const output = path.resolve(root, requestedOutput || "dist");
  const generatedOutput = path.join(root, "dist");
  const outputState = await inspect(output);

  if (output !== generatedOutput && (output === root || isInside(root, output) || isInside(output, root))) {
    throw new Error(`Refusing SITE_OUTPUT_DIR ${output}: custom output must be outside the repository and cannot contain it.`);
  }

  if (outputState?.isSymbolicLink()) {
    throw new Error(`Refusing SITE_OUTPUT_DIR ${output}: symbolic-link output directories are not supported.`);
  }
  if (outputState && !outputState.isDirectory()) {
    throw new Error(`Refusing SITE_OUTPUT_DIR ${output}: the output path is not a directory.`);
  }

  if (output === generatedOutput) {
    return { output, replace: true };
  }

  if (outputState && (await readdir(output)).length > 0) {
    throw new Error(`Refusing SITE_OUTPUT_DIR ${output}: a custom output directory must be new or empty.`);
  }

  return { output, replace: false };
}

export async function prepareOutputDirectory(plan) {
  if (plan.replace) await rm(plan.output, { recursive: true, force: true });
  await mkdir(plan.output, { recursive: true });
}
