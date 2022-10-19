import { VercelRequest, VercelResponse } from '@vercel/node'
import Jimp from 'jimp';

export default (req: VercelRequest, res: VercelResponse): void => {

    // var bufferMerge
    const imageMerge = new Jimp( 500, 500, 'orange' )
    
    var bufferMerge:any = null
    imageMerge.getBuffer("image/png", (err, b) => bufferMerge = b );
  
    res.statusCode = 200;
    res.setHeader("Content-Type", `image/png`);
    res.setHeader('Content-disposition', 'attachment; filename=screenshot.png');

    // return the file!
    res.end(bufferMerge);
}    