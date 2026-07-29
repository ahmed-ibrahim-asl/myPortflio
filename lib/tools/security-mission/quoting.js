export function quoteShellArgument(value, shell) {
  const str = String(value);
  if (shell === "bash") {
    return "'" + str.replaceAll("'", "'\"'\"'") + "'";
  }
  if (shell === "powershell") {
    return `'${str.replaceAll("'", "''")}'`;
  }
  if (shell === "cmd") {
    if (/[%!\r\n\0]/.test(str)) {
      throw new Error("CMD expansion characters are not supported in user values.");
    }
    return `"${str.replaceAll('"', '""')}"`;
  }
  throw new Error(`Unknown shell: ${shell}`);
}
