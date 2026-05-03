#!/usr/bin/env node
import readline from "node:readline";

const MAX_TOOL_LINES = 10;
const MAX_TOOL_CHARS = 1400;

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

function stripAnsi(text) {
  return String(text ?? "").replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "");
}

function cleanLine(line) {
  return stripAnsi(line).replace(/\s+/g, " ").trim();
}

function emit(label, text = "") {
  const clean = stripAnsi(text).trim();
  if (!clean) {
    console.log(label);
    return;
  }

  const lines = clean.split(/\r?\n/).map(cleanLine).filter(Boolean);
  if (lines.length === 0) {
    console.log(label);
    return;
  }

  console.log(`${label} ${lines[0]}`);
  for (const line of lines.slice(1)) {
    console.log(`  ${line}`);
  }
}

function compact(value) {
  if (value == null || value === "") {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}

function summarize(text, maxLines = MAX_TOOL_LINES, maxChars = MAX_TOOL_CHARS) {
  const clean = stripAnsi(text).trim();
  if (!clean) {
    return "";
  }

  const lines = clean.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const selected = lines.slice(0, maxLines).join("\n");
  const truncatedByLines = lines.length > maxLines;
  const truncated =
    selected.length > maxChars ? `${selected.slice(0, maxChars)}...` : selected;

  if (truncatedByLines || selected.length > maxChars) {
    return `${truncated}\n...`;
  }
  return truncated;
}

function firstMatch(text, pattern) {
  return pattern.exec(text)?.[1]?.trim() || "";
}

function summarizeCommandResult(text) {
  const command = firstMatch(text, /^command:\s*(.*)$/m);
  if (!command) {
    return "";
  }

  const returnCode = firstMatch(text, /^returncode:\s*(.*)$/m);
  const stdout = firstMatch(text, /^stdout:\s*([\s\S]*?)\n\s*stderr:/m);
  const stderr = firstMatch(text, /^stderr:\s*([\s\S]*?)\n\s*returncode:/m);
  const output = summarize(stdout || stderr, 2, 240);
  const status = returnCode ? `exit ${returnCode}` : "completed";

  if (!output) {
    return `${status}: ${command}`;
  }
  return `${status}: ${command}\n${output}`;
}

function summarizeFileResult(text) {
  const path = firstMatch(text, /^path:\s*(.*)$/m);
  if (!path) {
    return "";
  }

  const content = firstMatch(text, /^content:\s*([\s\S]*)$/m);
  const firstContentLine = summarize(content, 1, 160);
  if (!firstContentLine) {
    return `read ${path}`;
  }
  return `read ${path}\n${firstContentLine}`;
}

function summarizeToolResult(text) {
  const clean = stripAnsi(text).trim();
  return summarizeCommandResult(clean) || summarizeFileResult(clean) || summarize(clean);
}

function formatArgs(rawArgs) {
  if (!rawArgs) {
    return "";
  }

  try {
    const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;
    if (args.command) {
      return args.command;
    }
    if (args.path) {
      return args.path;
    }
    return JSON.stringify(args);
  } catch {
    return String(rawArgs);
  }
}

function emitToolCalls(toolCalls = []) {
  for (const call of toolCalls) {
    const name = call.function?.name || call.name || "tool";
    const args = call.function?.arguments || call.input;
    const formatted = formatArgs(args);
    emit("[tool]", formatted ? `${name}: ${formatted}` : name);
  }
}

function emitClaudeContent(content = []) {
  for (const part of content) {
    if (part.type === "text") {
      emit("[assistant]", part.text);
    } else if (part.type === "tool_use") {
      emit("[tool]", `${part.name}: ${formatArgs(part.input)}`);
    } else if (part.type === "tool_result") {
      emit("[tool-result]", summarizeToolResult(part.content));
    }
  }
}

function formatClaudeEvent(event) {
  if (event.type === "system" && event.subtype === "init") {
    emit("[agent]", `session started (${event.model || "unknown model"})`);
    return true;
  }

  if (event.type === "assistant" && event.message) {
    emitClaudeContent(event.message.content);
    return true;
  }

  if (event.type === "user" && event.message) {
    emitClaudeContent(event.message.content);
    return true;
  }

  if (event.type === "result") {
    const status = event.subtype || (event.is_error ? "error" : "done");
    const cost = event.total_cost_usd ? `, cost $${event.total_cost_usd}` : "";
    emit("[result]", `${status}${cost}`);
    if (event.result) {
      emit("[assistant]", event.result);
    }
    return true;
  }

  return false;
}

function formatVibeMessage(message) {
  if (message.role === "system" || message.role === "user") {
    return true;
  }

  if (message.reasoning_content) {
    emit("[thinking]", message.reasoning_content);
  }

  if (message.content) {
    const label = message.role === "tool" ? "[tool-result]" : "[assistant]";
    emit(
      label,
      message.role === "tool" ? summarizeToolResult(message.content) : message.content,
    );
  }

  if (message.tool_calls) {
    emitToolCalls(message.tool_calls);
  }

  return Boolean(
    message.role ||
      message.content ||
      message.reasoning_content ||
      message.tool_calls,
  );
}

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) {
    return;
  }

  try {
    const event = JSON.parse(trimmed);
    if (formatClaudeEvent(event) || formatVibeMessage(event)) {
      return;
    }
    emit("[event]", summarize(JSON.stringify(event)));
  } catch {
    console.log(stripAnsi(line));
  }
});
