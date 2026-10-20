"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductDetailsToolInvocation } from "@/lib/agent";

interface AgentProductCardProps {
  invocation: ProductDetailsToolInvocation;
}

export function AgentProductCard({ invocation }: AgentProductCardProps) {
  const [activeImage, setActiveImage] = useState(0);

  if (
    invocation.state === "input-streaming" ||
    invocation.state === "input-available"
  ) {
    const id = invocation.input?.productId;
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Looking up{id ? ` "${id}"` : ""}…
      </div>
    );
  }

  if (invocation.state !== "output-available") return null;

  const output = invocation.output;

  if (!output) return null;

  if ("error" in output) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {output.error as string}
      </div>
    );
  }

  const images = output.image ?? [];
  const mainImage = images[activeImage] ?? images[0];
  const { stock } = output;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {mainImage && (
        <div className="relative aspect-4/3 bg-secondary">
          <Image
            src={mainImage}
            alt={output.name}
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
          />
        </div>
      )}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-border p-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveImage(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === activeImage}
              className={cn(
                "relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary ring-offset-2 ring-offset-card transition",
                i === activeImage ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight">
              {output.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {formatPrice(output.price, output.currency)}
            </p>
          </div>
          <StockBadge stock={stock} />
        </div>
        <p className="text-sm text-muted-foreground">{output.description}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="text-muted-foreground">Category</dt>
          <dd>
            <Link
              href={`/search?category=${encodeURIComponent(output.category)}`}
              className="capitalize underline-offset-4 hover:underline"
            >
              {output.category}
            </Link>
          </dd>
          <dt className="text-muted-foreground">Stock</dt>
          <dd>{stock.stock} available</dd>
          <dt className="text-muted-foreground">Slug</dt>
          <dd className="truncate font-mono">{output.slug}</dd>
          <dt className="text-muted-foreground">ID</dt>
          <dd className="truncate font-mono">{output.id}</dd>
        </dl>
        <Link
          href={`/products/${output.slug}`}
          className="inline-flex text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          View product →
        </Link>
      </div>
    </div>
  );
}

function StockBadge({
  stock,
}: {
  stock: { stock: number; inStock: boolean; lowStock: boolean };
}) {
  const label = !stock.inStock
    ? "Out of stock"
    : stock.lowStock
      ? `Only ${stock.stock} left`
      : "In stock";

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        !stock.inStock && "bg-destructive/10 text-destructive",
        stock.inStock && stock.lowStock && "bg-amber-500/15 text-amber-700 dark:text-amber-400",
        stock.inStock && !stock.lowStock && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {label}
    </span>
  );
}
