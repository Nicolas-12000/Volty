import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

/** Navegación con la misma apariencia que `<Button>`. */
export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName({ variant, size, fullWidth, className })} {...props}>
      {children}
    </Link>
  );
}

type TextLinkProps = ComponentProps<typeof Link> & {
  className?: string;
  children: ReactNode;
};

/** Enlaces de texto acento (acciones secundarias en paneles). */
export function TextLink({ className, children, ...props }: TextLinkProps) {
  return (
    <Link className={cn("text-sm font-medium text-accent-bright transition-colors hover:text-accent-soft", className)} {...props}>
      {children}
    </Link>
  );
}
