"use client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils"; // إذا كان لديك دالة cn، وإلا استخدم classnames

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-full font-semibold transition disabled:opacity-50";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-neutral-100 text-dark hover:bg-neutral-200",
    outline: "border border-primary text-primary hover:bg-primary/10",
    ghost: "text-dark hover:bg-neutral-100",
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}