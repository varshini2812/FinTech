import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
      <div className="bg-card p-8 rounded-2xl border border-border shadow-2xl text-center max-w-md">
        <div className="mx-auto bg-destructive/10 h-16 w-16 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">404 Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-xl transition-all inline-block">
          Return Home
        </Link>
      </div>
    </div>
  );
}
