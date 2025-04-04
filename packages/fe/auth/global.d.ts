// Allow TypeScript to import SVG files using Webpack's `svgr` loader.
declare module '*.svg' {
  import type React from 'react';

  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.png' {
  const value: any;
  export = value;
}
