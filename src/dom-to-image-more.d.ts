declare module 'dom-to-image-more' {
  interface Options {
    quality?: number
    pixelRatio?: number
    width?: number
    height?: number
    bgcolor?: string
    style?: Record<string, string>
    filter?: (el: Element) => boolean
    cacheBust?: boolean
    imagePlaceholder?: string
    useCredentials?: boolean
    httpTimeout?: number
    scale?: number
  }

  export function toSvg(node: Node, options?: Options): Promise<string>
  export function toPng(node: Node, options?: Options): Promise<string>
  export function toJpeg(node: Node, options?: Options): Promise<string>
  export function toBlob(node: Node, options?: Options): Promise<Blob>
  export function toPixelData(node: Node, options?: Options): Promise<number[]>
  export function toCanvas(node: Node, options?: Options): Promise<HTMLCanvasElement>
  export default { toSvg, toPng, toJpeg, toBlob, toPixelData, toCanvas }
}
