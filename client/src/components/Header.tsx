import { useAuth } from "@/hooks/use-auth";
import { Bell, Wallet, Search, User } from "lucide-react";

export function Header({ title }: { title: string }) {
  const { user } = useAuth();
  
  // Format balance as currency
  const balance = user?.balance ? Number(user.balance) : 0;
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balance);

  return (
    <header className="h-20 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">{title}</h1>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 bg-card/50 border border-white/5 rounded-full px-4 py-2">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-medium text-white">{formattedBalance}</span>
          <span className="text-xs text-muted-foreground font-medium">AVAILABLE</span>
        </div>

        <div className="h-8 w-[1px] bg-border hidden md:block" />

        <div className="flex items-center gap-4">
          <button className="h-10 w-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors relative">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>
          </button>
          
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20 ring-2 ring-background">
            <span className="font-bold text-primary-foreground text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
