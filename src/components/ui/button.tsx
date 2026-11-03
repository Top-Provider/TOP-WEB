import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-all duration-150 outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 focus-visible:ring-3 focus-visible:ring-blue-500/20",
        primary:
          "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20 focus-visible:ring-3 focus-visible:ring-blue-500/20",
        emerald:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 focus-visible:ring-3 focus-visible:ring-emerald-500/20",
        secondary:
          "bg-slate-100 text-slate-700 hover:bg-slate-200/80 active:bg-slate-200 focus-visible:ring-3 focus-visible:ring-slate-300",
        outline:
          "border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs focus-visible:ring-3 focus-visible:ring-blue-500/15",
        ghost:
          "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-3 focus-visible:ring-slate-200",
        destructive:
          "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 focus-visible:ring-3 focus-visible:ring-rose-200",
        link: "text-blue-600 underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs sm:text-sm gap-2",
        xs: "h-7 px-2.5 text-xs rounded-lg gap-1.5 [&_svg]:size-3",
        sm: "h-8.5 px-3 text-xs rounded-lg gap-1.5 [&_svg]:size-3.5",
        lg: "h-11 px-5 text-sm sm:text-base rounded-2xl gap-2.5",
        icon: "size-9 rounded-xl",
        "icon-sm": "size-7 rounded-lg",
        "icon-xs": "size-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
