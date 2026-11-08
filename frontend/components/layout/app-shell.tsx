"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { UserMenu } from "./user-menu";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  showHeading?: boolean;
}

export function AppShell({ children, className, title, subtitle, actions, showHeading = true }: AppShellProps) {
  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar />

      <main
        className={cn(
          "flex min-h-dvh flex-col",
          "min-[1025px]:ml-58",
          "max-[1024px]:pb-[calc(3.5rem+env(safe-area-inset-bottom))]",
          className,
        )}
      >
        {showHeading && title ? (
          <TopBar title={title}>
            <>
              {actions}
              <UserMenu compact />
            </>
          </TopBar>
        ) : (
          <header
            className="flex h-14 items-center justify-between px-4 bg-canvas min-[1025px]:hidden"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <span className="type-heading lowercase text-ink">volty</span>
            <UserMenu compact />
          </header>
        )}
        <div className="flex-1 overflow-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          {title && showHeading ? (
            <div className="mb-8 hidden min-[1025px]:block">
              <div className="flex items-end justify-between gap-6">
                <div>
                  <h1 className="type-display-lg text-ink">{title}</h1>
                  {subtitle ? <p className="type-body mt-1 text-ink-muted">{subtitle}</p> : null}
                </div>
                {actions}
              </div>
            </div>
          ) : null}
          {subtitle && showHeading ? (
            <p className="type-body-sm mb-4 text-ink-muted min-[1025px]:hidden">{subtitle}</p>
          ) : null}
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
