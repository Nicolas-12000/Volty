import Link from "next/link";
import { loginHref } from "@/lib/access";
import { cn } from "@/lib/cn";

type SignInPromptProps = {
  title: string;
  description: string;
  nextPath: string;
  compact?: boolean;
};

export function SignInPrompt({ title, description, nextPath, compact }: SignInPromptProps) {
  return (
    <div
      className={
        compact
          ? "rounded-lg border border-dashed border-hairline-strong bg-surface-2 px-5 py-6"
          : "rounded-xl border border-hairline bg-surface-1 p-6 shadow-lift sm:p-8"
      }
    >
      <p className="type-label text-ink-dimmed">Tu hogar</p>
      <h2 className="type-heading mt-2 text-ink">{title}</h2>
      <p className="type-body-sm mt-2 max-w-xl text-ink-muted">{description}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={loginHref(nextPath)}
          className={cn(
            "type-button inline-flex h-12 items-center justify-center rounded-pill bg-accent px-6 text-white",
            "transition-all hover:bg-accent-dim",
          )}
        >
          Entrar en Volty
        </Link>
        <Link
          href="/"
          className="type-body-sm inline-flex h-12 items-center rounded-md px-4 text-ink-muted hover:text-ink"
        >
          Seguir viendo el mercado
        </Link>
      </div>
    </div>
  );
}
