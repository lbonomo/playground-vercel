// Main interfaces file.

import { S3Client } from "@aws-sdk/client-s3";

// Test interface.
export interface ITest {
    status: string
    config?: IConfig
    s3Client?: S3Client
}

// Input args interface.
export interface IArgs {
    config: string
    base?: boolean
    help?: boolean
}

// Render config
export interface IRender {
    cookie_selector: string | null
    exclude: Array<string> | null
    include: string | null
}


// Config file interface.
export interface IConfigFile {
    project_name: string
    aws: {
        access_key_id: string
        secret_access_key: string
        region: string
        s3_bucket: string
    }
    diff: {
        threshold: number
        compose: boolean
    }
    render: IRender
    
    urls: {
        base: string
        target: string
        paths: string | Array<string>
    }
    
}


// Main config interface.
export interface IConfig extends IConfigFile {
    base: boolean
    timestamp: number
}


export interface IReport {
    info: Array<string>
    paths: Array<string>
}