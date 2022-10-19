import { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3"
import { streamToBuffer, makeKey } from '../../libs/utils';


/**
 * Recover base images from bucket S3.
 */
export default async (req: VercelRequest, res: VercelResponse) => {
    const key = makeKey(req.body.url)
    const s3_region = process.env.S3_region
    const s3_credentials = {
        accessKeyId: process.env.S3_AccessKeyId,
        secretAccessKey: process.env.S3_SecretAccessKey,
    };
    const s3_bucket = process.env.S3_Bucket
    const s3_Client = new S3Client({ region: s3_region, credentials: s3_credentials });    
    const objectParams = {
        Bucket: s3_bucket,
        Key: key,
    };

    try {
        const data = await s3_Client.send(new GetObjectCommand(objectParams))
        const bufferImage = await streamToBuffer(data.Body)
        
        res.statusCode = 200
        res.setHeader("Content-Type", `image/png`)
        res.setHeader('Content-disposition', 'attachment; filename=screenshot.png')
        res.end(bufferImage)
    } catch (err:any) {
        if ( err.Code === 'NoSuchKey') {
            const data = {
                'status': "error",
                'description': "Don't exist base image in Amazon S3"
            }
            res.end(JSON.stringify(data))
        } else {
            const data = {
                'status': "error",
                'description': err.Code
            }
            res.end(JSON.stringify(data))
        }
    }

}



