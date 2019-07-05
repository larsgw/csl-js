global.logger = console.Console
  ? new console.Console(process.stderr, process.stderr)
  : console
