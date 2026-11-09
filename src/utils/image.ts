/* Las URLs de Mongo traen la foto original: una miniatura de 100 px llegaba a pedir 3000.
   ponytail: solo Cloudinary y Unsplash cambian de tamano por URL. Una foto pesada de otro
   host se arregla subiendola a Cloudinary. */
export function sized(url: string | undefined, width: number) {
  if (url?.includes('res.cloudinary.com')) return url.replace('/upload/', `/upload/c_limit,w_${width},f_auto,q_auto/`);
  if (url?.includes('images.unsplash.com')) return url.replace(/([?&]w=)\d+/, (_, key) => key + width);
  return url;
}
