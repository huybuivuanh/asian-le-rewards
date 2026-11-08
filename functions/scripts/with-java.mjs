// Runs a command with Java 21 for the Firebase emulators, without changing the
// machine's default Java (Android builds stay on Java 17).
// Usage: node scripts/with-java.mjs <command> [args...]
// Java folder: JAVA21_HOME if set, otherwise D:\JDK21.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const javaHome = process.env.JAVA21_HOME ?? "D:\\JDK21";
const javaBin = path.join(javaHome, "bin");

if (!existsSync(javaBin)) {
  console.error(`Java 21 not found at ${javaHome}. Set JAVA21_HOME to its folder.`);
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error("Usage: node scripts/with-java.mjs <command> [args...]");
  process.exit(1);
}

// One command string (the shell is needed to find `firebase` on Windows); quote
// arguments with spaces so "vitest run" stays one argument.
const quote = (a) => (/\s/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const commandLine = [command, ...args].map(quote).join(" ");

const child = spawn(commandLine, {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${javaBin}${path.delimiter}${process.env.PATH ?? ""}`,
  },
});
child.on("exit", (code) => process.exit(code ?? 1));
