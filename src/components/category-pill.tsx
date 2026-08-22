import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const TONE: Record<Category, string> = {
  World: "text-foreground",
  Europe: "text-europe",
  Politics: "text-accent",
  Business: "text-foreground",
  Technology: "text-foreground",
  Science: "text-foreground",
  Culture: "text-foreground",
  Sports: "text-foreground",
  Crypto: "text-accent",
  Opinion: "text-foreground",
  India: "text-india",
  USA: "text-accent",
};

export function CategoryPill({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  const t = useTranslations("categories");
  return (
    <span
      className={cn(
        "text-[11px] font-bold uppercase tracking-wider",
        TONE[category],
        className
      )}
    >
      {t(category)}
    </span>
  );
}
