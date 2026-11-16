import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@workspace/ui/components/drawer"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

/**
 * A dialog on wide screens and a bottom drawer on narrow ones. Crossing the
 * breakpoint while open swaps one for the other and remounts the content, so
 * keep state such as a form's values above it.
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  disablePointerDismissal,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Keeps it open on clicks outside, e.g. while it holds a form. */
  disablePointerDismissal?: boolean
  title: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
}) {
  const desktop = !useIsMobile()

  if (desktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        disablePointerDismissal={disablePointerDismissal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : null}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={disablePointerDismissal}
      showSwipeHandle
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <div className="overflow-y-auto p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
