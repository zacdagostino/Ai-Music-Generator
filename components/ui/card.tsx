import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-stone-200/70 bg-white/70 p-6 shadow-[0_30px_70px_-45px_rgba(70,55,45,0.42)] backdrop-blur-sm md:p-10",
        className,
      )}
      {...props}
    />
  );
}
