import { MatiasAvatar } from "@/components/chat/matias-avatar";

/** Indicador breve tipo WhatsApp mientras MATIAS responde. */
export function MatiasTypingIndicator() {
  return (
    <div className="flex items-start gap-3" role="status" aria-live="polite">
      <MatiasAvatar size={36} thinking />
      <div className="rounded-xl rounded-tl-sm border border-hairline bg-canvas px-4 py-3.5">
        <span className="sr-only">MATIAS escribe</span>
        <span className="flex h-4.5 items-center gap-1.5" aria-hidden="true">
          <span className="typing-dot size-1.5 rounded-full bg-ink-muted" />
          <span className="typing-dot size-1.5 rounded-full bg-ink-muted" />
          <span className="typing-dot size-1.5 rounded-full bg-ink-muted" />
        </span>
      </div>
    </div>
  );
}
