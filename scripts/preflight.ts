import { execFileSync } from "node:child_process";

const commands: Array<[string, string[]]> = [
  ["pnpm", ["test"]],
  ["pnpm", ["check"]],
  ["pnpm", ["seed:verify", "--", "--fixtures-only"]],
];
for (const [command, args] of commands)
  execFileSync(command, args, { stdio: "inherit", env: process.env });
console.log(
  "Preflight passed: tests, static checks, and golden fixture verification.",
);
