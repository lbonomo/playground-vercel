import urlSlug from 'url-slug'

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
 * Recover images from bucket.
 */


/**
 * 
 * @param url string
 * @returns string
 */
export function makeKey(uri:string, category:'base'|'snapshot') {
    const uriArray = new URL(uri)
    const slug = url2str(uri)
    let path:string
    switch (category) {
      case 'base':
        path = `${uriArray.host}/base/${slug}.png`
        break;
      case 'snapshot':
        path = `${uriArray.host}/snapshot/${slug}.png`
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