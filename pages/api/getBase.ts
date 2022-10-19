import { VercelRequest, VercelResponse } from '@vercel/node'
import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3"
import { streamToBuffer, makeKey } from '../../libs/utils';
import Jimp from 'jimp';

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
        res.setHeader('Content-disposition', 'attachment; filename=base.png')
        res.end(bufferImage)
    } catch (err:any) {
        // If don't exist base image make a blank image.
        if ( err.Code === 'NoSuchKey') {
            
            // width: 1280, height: 720 the same size of screenshot.
            const blankImage = new Jimp( 1280, 720, '#f96e62' )

            var bufferBlank:any = null
            blankImage.getBuffer("image/png", (err, b) => bufferBlank = b );
          
            res.statusCode = 200;
            res.setHeader("Content-Type", `image/png`);
            res.setHeader('Content-disposition', 'attachment; filename=blank.png');
        
            // return the file!
            res.end(bufferBlank);
        } else {
            const data = {
                'status': "error",
                'description': err.Code
            }
            res.end(JSON.stringify(data))
        }
    }

}



