import chalk, { type ChalkInstance } from "chalk";

export enum LogLevel {
  STARTUP = "STARTUP",
  INFO = "INFO",
  DEBUG = "DEBUG",
  WARN = "WARN",
  ERROR = "ERROR",
}

export default class Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  private log(message: string, level: LogLevel, func: ChalkInstance) {
    if (this.shouldLog(level))
      console.log(chalk.white(`[${func(level)}]`), chalk.gray(message));
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevel !== LogLevel.ERROR || level === LogLevel.ERROR;
  }

  public startup(message: string) {
    this.log(message, LogLevel.STARTUP, chalk.blue);
  }

  public info(message: string) {
    this.log(message, LogLevel.INFO, chalk.green);
  }

  public debug(message: string) {
    this.log(message, LogLevel.DEBUG, chalk.cyan);
  }

  public warn(message: string) {
    this.log(message, LogLevel.WARN, chalk.yellow);
  }

  public error(message: string) {
    this.log(message, LogLevel.ERROR, chalk.red);
  }
}
