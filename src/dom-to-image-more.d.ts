declare module 'dom-to-image-more' {
  export function toPng(node: HTMLElement, options?: Record<string, unknown>): Promise<string>
}
