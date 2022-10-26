import { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client } from "@aws-sdk/client-s3"
import { bufferToBucket } from '../../../libs/utils';

/**
 * Recover base images from bucket S3.
 */
export default async (req: VercelRequest, res: VercelResponse) => {
    console.log("Save image to S3")
    console.log(req.body.key)
    const file = req.body.file;
    const key = req.body.key 

    if (! key ) {
        return false
    }
    const s3_bucket = process.env.S3_Bucket
    const s3_region = process.env.S3_region
    const s3_credentials = {
        accessKeyId: process.env.S3_AccessKeyId,
        secretAccessKey: process.env.S3_SecretAccessKey,
    };
    const s3_Client = new S3Client({ region: s3_region, credentials: s3_credentials });
    

    try {
        await bufferToBucket(s3_Client, file, key)
        return true   
    } catch (err) {
        console.log(err)
        return false
    }
}



