import pino, { multistream } from 'pino';
import fs from 'node:fs';
// import { createStream } from 'rotating-file-stream';
import { GraphQLFormattedError } from 'graphql/error/GraphQLError';
import { SecurityEvent } from '../models/security-event';



const {
    LOG_FILE_DIRECTORY,
    LOG_TO_STD_OUT,
    LOG_LEVEL
} = process.env;

const ALLOWED_LOG_LEVELS = ["info", "error", "warn", "debug", "trace", "fatal", "silent"];

const logDirectoryDefined: boolean = LOG_FILE_DIRECTORY ? true : false;
const logToStdOut: boolean = LOG_TO_STD_OUT && LOG_TO_STD_OUT === "true" ? true : false;
const logLevel: string = LOG_LEVEL && ALLOWED_LOG_LEVELS.includes(LOG_LEVEL) ? LOG_LEVEL : "info";

export interface LogAttributes {
    [key: string]: string | number | boolean | GraphQLFormattedError | SecurityEvent | Array<string> | null;
}

export interface LogRecord {
    timestamp: number 
    severityText: string,
    body: string,
    attributes?: LogAttributes,
    resource?: Record<string, string>,
    instrumentationScope?: {
        name: string,
        version?: string
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const streams: Array<any> = [];
if(logDirectoryDefined){
    streams.push({
        stream: fs.createWriteStream(`${LOG_FILE_DIRECTORY}/app.log`)
    });

    // Rotate when file > 50MB, keep 10 compressed archives
    // const rotateStream = createStream("/app.log", {
    //     size: '50M',                    // rotate every 50 MB  
    //     compress: 'gzip',               // compress rotated files
    //     maxFiles: 10,                  // keep only 10 log files
    //     path: LOG_FILE_DIRECTORY       // store logs in configured directory
    // });

    // streams.push({stream: rotateStream});
}

if(logToStdOut === true){
    streams.push({stream: process.stdout});
}

const logger = pino(
    {
        base: null, // don’t include pid/hostname unless you want them
        timestamp: () => `,"timestamp":${Date.now()}`,
        formatters: {
            level(label) {
                return { severityText: label.toUpperCase() };
            },
        },
        messageKey: 'body', // maps Pino's msg -> opentelemetry "body",
        level: logLevel
    },
    multistream(streams)
);

// Helper for adding attributes/resources
export function logWithDetails(
    severity: "info" | "error" | "warn" | "debug" | "trace" | "fatal" | "silent",
    body: string,
    attributes?: LogAttributes
) {
    logger[severity]({ attributes }, body);
}