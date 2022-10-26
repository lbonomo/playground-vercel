import urlSlug from 'url-slug'
import { PutObjectCommand } from "@aws-sdk/client-s3"
import Jimp from 'jimp';

/**
 * SteamToBuffer.
 * 
 * @param stream 
 * @returns 
 */
 export const streamToBuffer = (stream:any) =>
 new Promise((resolve, reject) => {
   const chunks:any[] = [];
   stream.on("data", (chunk:any) => chunks.push(chunk));
   stream.on("error", reject);
   stream.on("end", () => resolve(Buffer.concat(chunks)));
 });

/**
 * 
 * @param url string
 * @returns string
 */
export function makeKey(uri:string, time:string, category:'base'|'snapshot'|'diff') {
    const uriArray = new URL(uri)
    const slug = url2str(uri)
    let path:string
    switch (category) {
      case 'base':
        path = `${uriArray.host}/base/${slug}.png`
        break;
      case 'snapshot':
        path = `${uriArray.host}/${time}/snapshot/${slug}.png`
        break;
      case 'diff':
          path = `${uriArray.host}/${time}/diff/${slug}.png`
          break;        
      default:
        path = `${uriArray.host}/base/${slug}.png`
    }
    return path
}

/**
 * Convert URL to string
 * 
 * @param url 
 * @returns string
 */
export function url2str(url:string) {
    const uri = new URL(url)
    const slug = (uri.pathname === '/') ? 'root' : urlSlug(`${uri.pathname}-${uri.search}`)
    return slug
}


/**
 * Compare two images buffers.
 * 
 * @param {Buffer} bufferBase 
 * @param {Buffer} bufferCurrent 
 * @returns {{ diffBuffer, number }}
 */
 export async function compareBuffer(bufferBase:Buffer, bufferCurrent:Buffer) {
  
  const image1 = await Jimp.read(bufferBase);
  const image2 = await Jimp.read(bufferCurrent);

  var diff = Jimp.diff(image1, image2, 0.1);

  var diffBuffer:any = null
   
  diff.image.getBuffer("image/png", (err, b) => {
      diffBuffer = b
  });

  return {diffBuffer, diffPercent: diff.percent}

}


/*** AWS S3 ***/

/**
 * Get the URL for an element.
 * 
 * @param key File key
 * @returns AWS S3 element URL
 */
function getUrlFromKey(key:string){
  // Ex:
  // https://[images-for-automated-testing].s3[].amazonaws.com/[google.com/snapshot/root.png]
  const regionString = process.env.S3_region.includes('us-east-1') ?'':('-' + process.env.S3_region)
  return `https://${process.env.S3_Bucket}.s3${regionString}.amazonaws.com/${key}`
};

/**
 * Save buffer in bucket.
 * 
 * @param client 
 * @param buffer 
 * @returns 
 */
 export async function bufferToBucket(client, buffer, key) {

  const s3_bucket = process.env.S3_Bucket

  // If we want to use the image directly to the S3 we need to make this image public.
  // ACL: 'public-read'
  const uploadParams = {
    Bucket: s3_bucket,
    Key: key,
    Body: buffer
  }

  try {
    await client.send(new PutObjectCommand( uploadParams ));
    await client.send(new PutObjectCommand( uploadParams ));
    return { 
      'status': 'successful',
      'url': getUrlFromKey(key)
    }
  } catch (err) {
    return { 
      'status': 'fail',
      'description': err
    }
  }
}
