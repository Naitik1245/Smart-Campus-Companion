"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, Home, Calendar, Settings, Users, LogOut } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const { data: session } = useSession();
  const { setTheme, theme } = useTheme();

  const userRole = (session?.user as any)?.role || "STUDENT";

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">Smart Campus</span>
        </Link>

        <div className="ml-8 flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="flex items-center text-sm font-medium transition-colors hover:text-primary"
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>

          {userRole === "STUDENT" && (
            <>
              <Link
                href="/counselor-booking"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Counselor
              </Link>
            </>
          )}

          {(userRole === "MENTOR" || userRole === "ADMIN") && (
            <Link
              href="/admin"
              className="flex items-center text-sm font-medium transition-colors hover:text-primary"
            >
              <Users className="mr-2 h-4 w-4" />
              Student Overview
            </Link>
          )}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      {userRole.toLowerCase()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
