# Juando con AWS CloudFront + Vercel
El objetivo de este pequeño ejemplo es documentar el uso de CloudFront como chache de aplicaciones Verser
## En Vercel
En Vercel solo montamo un *Hola mundo* hecho con `Express`.

Como dato importante, Vercel no esta pensado para ejecutar aplicaciones Node de forma nativa, por lo que es necesario agregar un archivo `vercel.json` en el directorio raiz del proyecto.

## CloudFront
Uno de los objetivos principales del ejempo es obtener la IP del cliente que visita nuetra pagina del lado de Vercel y no la IP propia del CloudFront (que es lo que pasa por defecto), para esto es necesario configurar el parametro `CloudFront-Viewer-Address` en CloudFront.
