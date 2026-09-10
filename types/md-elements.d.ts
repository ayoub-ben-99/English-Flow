import type { DetailedHTMLProps, HTMLAttributes } from "react";

type MdElementProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  value?: number | string;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  min?: number;
  max?: number;
  step?: number;
  valueLabel?: string;
  labeled?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-slider": MdElementProps;
      "md-radio": MdElementProps;
      "md-outlined-button": MdElementProps;
      "md-icon-button": MdElementProps;
    }
  }
}

export {};
