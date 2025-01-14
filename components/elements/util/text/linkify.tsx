import ReactLinkify from "react-linkify";
import React, {ReactNode} from "react";

interface Props {
  children: ReactNode
}

export function Linkify({children}: Props) {
  return (
    <ReactLinkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a
          href={decoratedHref}
          key={key}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          {decoratedText}
        </a>
      )}
    >
      {children}
    </ReactLinkify>
  )
}
