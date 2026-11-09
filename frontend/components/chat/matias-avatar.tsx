import { Matias } from "@/components/brand/poodle";
import { cn } from "@/lib/cn";

const SHELL: Record<number, string> = {
  32: "size-10",
  36: "size-11",
  40: "size-12",
  48: "size-14",
};

/** Avatar de MATIAS: círculo fijo; no hereda la altura del mensaje (evita la “píldora” estirada). */
export function MatiasAvatar({
  size = 40,
  thinking,
  className,
}: {
  size?: number;
  thinking?: boolean;
  className?: string;
}) {
  const shell = SHELL[size] ?? "size-12";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center self-start rounded-full border border-hairline bg-canvas p-1",
        shell,
        className,
      )}
    >
      <Matias size={size} thinking={thinking} />
    </div>
  );
}
