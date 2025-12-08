declare module 'next/link' {
  import type * as React from 'react';
  import type { UrlObject } from 'url';
  export interface LinkProps {
    href: string | UrlObject;
    as?: string | UrlObject;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    children?: React.ReactNode;
  }
  const Link: React.FC<LinkProps>;
  export default Link;
}
