export function AppFooter({ businessName }: { businessName: string | null }) {
  return (
    <footer className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
      © {new Date().getFullYear()} {businessName ?? "Quote & Invoice Builder"}
    </footer>
  );
}
