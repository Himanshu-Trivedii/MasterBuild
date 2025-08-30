import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

const SidebarProviderWrapper = styled.div`
  display: flex;
  min-height: 100svh;
  width: 100%;

  &:has([data-variant="inset"]) {
    background-color: hsl(var(--sidebar-background));
  }
`;

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open],
    );

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      ],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <SidebarProviderWrapper
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            ref={ref}
            {...props}
          >
            {children}
          </SidebarProviderWrapper>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

const SidebarContainer = styled.div<{
  side: "left" | "right";
  variant: "sidebar" | "floating" | "inset";
  collapsible: "offcanvas" | "icon" | "none";
}>`
  display: flex;
  height: 100%;
  width: var(--sidebar-width);
  flex-direction: column;
  background-color: hsl(var(--sidebar-background));
  color: hsl(var(--sidebar-foreground));
`;

const SidebarDesktopWrapper = styled.div<{
  state: "expanded" | "collapsed";
  collapsible: "offcanvas" | "icon" | "none";
  side: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
}>`
  position: relative;
  height: 100svh;
  width: var(--sidebar-width);
  background-color: transparent;
  transition: width 200ms ease-linear;

  ${({ collapsible, state }) =>
    collapsible === "offcanvas" &&
    state === "collapsed" &&
    css`
      width: 0;
    `}

  ${({ side }) =>
    side === "right" &&
    css`
      transform: rotate(180deg);
    `}

  ${({ collapsible, variant }) =>
    (variant === "floating" || variant === "inset") && collapsible === "icon"
      ? css`
          width: calc(var(--sidebar-width-icon) + 1rem);
        `
      : collapsible === "icon" &&
        css`
          width: var(--sidebar-width-icon);
        `}
`;

const SidebarFixed = styled.div<{
  side: "left" | "right";
  variant: "sidebar" | "floating" | "inset";
  collapsible: "offcanvas" | "icon" | "none";
  state: "expanded" | "collapsed";
}>`
  position: fixed;
  inset-block: 0;
  z-index: 10;
  display: none;
  height: 100svh;
  width: var(--sidebar-width);
  transition:
    left 200ms ease-linear,
    right 200ms ease-linear,
    width 200ms ease-linear;

  @media (min-width: 768px) {
    display: flex;
  }

  ${({ side, collapsible, state }) =>
    side === "left"
      ? css`
          left: 0;
          ${collapsible === "offcanvas" &&
          state === "collapsed" &&
          css`
            left: calc(var(--sidebar-width) * -1);
          `}
        `
      : css`
          right: 0;
          ${collapsible === "offcanvas" &&
          state === "collapsed" &&
          css`
            right: calc(var(--sidebar-width) * -1);
          `}
        `}

  ${({ variant, collapsible, state, side }) =>
    variant === "floating" || variant === "inset"
      ? css`
          padding: 0.5rem;
          ${collapsible === "icon" &&
          state === "collapsed" &&
          css`
            width: calc(var(--sidebar-width-icon) + 1rem + 2px);
          `}
        `
      : css`
          ${collapsible === "icon" &&
          state === "collapsed" &&
          css`
            width: var(--sidebar-width-icon);
          `}
          ${side === "left" &&
          css`
            border-right: 1px solid hsl(var(--sidebar-border));
          `}
          ${side === "right" &&
          css`
            border-left: 1px solid hsl(var(--sidebar-border));
          `}
        `}
`;

const SidebarInner = styled.div<{
  variant: "sidebar" | "floating" | "inset";
}>`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  background-color: hsl(var(--sidebar-background));

  ${({ variant }) =>
    variant === "floating" &&
    css`
      border-radius: calc(var(--radius) + 2px);
      border: 1px solid hsl(var(--sidebar-border));
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
    `}
`;

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <SidebarContainer
          side={side}
          variant={variant}
          collapsible={collapsible}
          ref={ref}
          {...props}
        >
          {children}
        </SidebarContainer>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
                width: "var(--sidebar-width)",
                backgroundColor: "hsl(var(--sidebar-background))",
                padding: 0,
                color: "hsl(var(--sidebar-foreground))",
              } as React.CSSProperties
            }
            side={side}
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                width: "100%",
                flexDirection: "column",
              }}
            >
              {children}
            </div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        style={{ display: "none" }}
        css={css`
          @media (min-width: 768px) {
            display: block;
          }
        `}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        <SidebarDesktopWrapper
          state={state}
          collapsible={collapsible}
          side={side}
        />
        <SidebarFixed
          side={side}
          variant={variant}
          collapsible={collapsible}
          state={state}
          {...props}
        >
          <SidebarInner data-sidebar="sidebar" variant={variant}>
            {children}
          </SidebarInner>
        </SidebarFixed>
      </div>
    );
  },
);
Sidebar.displayName = "Sidebar";

const StyledSidebarTrigger = styled(Button)`
  height: 1.75rem;
  width: 1.75rem;
`;

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <StyledSidebarTrigger
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span
        css={css`
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        `}
      >
        Toggle Sidebar
      </span>
    </StyledSidebarTrigger>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = styled.button<{
  side: "left" | "right";
  state: "expanded" | "collapsed";
  collapsible: "offcanvas" | "icon" | "none";
}>`
  position: absolute;
  inset-block: 0;
  z-index: 20;
  display: none;
  width: 1rem;
  transform: translateX(-50%);
  transition: all 200ms ease-linear;
  background: transparent;
  border: none;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    inset-block: 0;
    left: 50%;
    width: 2px;
  }

  &:hover::after {
    background-color: hsl(var(--sidebar-border));
  }

  ${({ side }) =>
    side === "left"
      ? css`
          right: -1rem;
          cursor: w-resize;
        `
      : css`
          left: 0;
          cursor: e-resize;
        `}

  ${({ side, state }) =>
    side === "left" && state === "collapsed"
      ? css`
          cursor: e-resize;
        `
      : side === "right" &&
        state === "collapsed" &&
        css`
          cursor: w-resize;
        `}

  ${({ collapsible }) =>
    collapsible === "offcanvas" &&
    css`
      transform: translateX(0);
      &::after {
        left: 100%;
      }
      &:hover {
        background-color: hsl(var(--sidebar-background));
      }
    `}

  ${({ side, collapsible }) =>
    side === "left" && collapsible === "offcanvas"
      ? css`
          right: -0.5rem;
        `
      : side === "right" &&
        collapsible === "offcanvas" &&
        css`
          left: -0.5rem;
        `}

  @media (min-width: 640px) {
    display: flex;
  }
`;

const SidebarRailComponent = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ ...props }, ref) => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarRail
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      side="left"
      state={state}
      collapsible="offcanvas"
      {...props}
    />
  );
});
SidebarRailComponent.displayName = "SidebarRail";

const SidebarInset = styled.main`
  position: relative;
  display: flex;
  min-height: 100svh;
  flex: 1;
  flex-direction: column;
  background-color: hsl(var(--background));

  /* Handle inset variant styles */
  @media (min-width: 768px) {
    &[data-variant="inset"] {
      min-height: calc(100svh - 1rem);
      margin: 0.5rem;
      margin-left: 0;
      border-radius: 0.75rem;
      box-shadow:
        0 4px 6px -1px rgb(0 0 0 / 0.1),
        0 2px 4px -2px rgb(0 0 0 / 0.1);
    }

    &[data-state="collapsed"][data-variant="inset"] {
      margin-left: 0.5rem;
    }
  }
`;

const SidebarInsetComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ ...props }, ref) => {
  return <SidebarInset ref={ref} {...props} />;
});
SidebarInsetComponent.displayName = "SidebarInset";

const StyledSidebarInput = styled(Input)`
  height: 2rem;
  width: 100%;
  background-color: hsl(var(--background));
  box-shadow: none;

  &:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--sidebar-ring));
  }
`;

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ ...props }, ref) => {
  return <StyledSidebarInput ref={ref} data-sidebar="input" {...props} />;
});
SidebarInput.displayName = "SidebarInput";

const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`;
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`;
SidebarFooter.displayName = "SidebarFooter";

const StyledSidebarSeparator = styled(Separator)`
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  width: auto;
  background-color: hsl(var(--sidebar-border));
`;

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ ...props }, ref) => {
  return (
    <StyledSidebarSeparator ref={ref} data-sidebar="separator" {...props} />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

const SidebarContent = styled.div<{
  collapsed?: boolean;
}>`
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  overflow: auto;

  ${({ collapsed }) =>
    collapsed &&
    css`
      overflow: hidden;
    `}
`;

const SidebarContentComponent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ ...props }, ref) => {
  const { state } = useSidebar();

  return (
    <SidebarContent
      ref={ref}
      data-sidebar="content"
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarContentComponent.displayName = "SidebarContent";

const SidebarGroup = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  padding: 0.5rem;
`;
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabelStyled = styled.div<{
  collapsed?: boolean;
}>`
  display: flex;
  height: 2rem;
  flex-shrink: 0;
  align-items: center;
  border-radius: calc(var(--radius) - 2px);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: hsl(var(--sidebar-foreground) / 0.7);
  outline: none;
  transition:
    margin 200ms ease-linear,
    opacity 200ms ease-linear;

  &:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--sidebar-ring));
  }

  svg {
    height: 1rem;
    width: 1rem;
    flex-shrink: 0;
  }

  ${({ collapsed }) =>
    collapsed &&
    css`
      margin-top: -2rem;
      opacity: 0;
    `}
`;

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  const { state } = useSidebar();

  return (
    <Comp
      as={SidebarGroupLabelStyled}
      ref={ref}
      data-sidebar="group-label"
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupActionStyled = styled.button<{
  collapsed?: boolean;
}>`
  position: absolute;
  right: 0.75rem;
  top: 0.875rem;
  display: flex;
  aspect-ratio: 1;
  width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius) - 2px);
  padding: 0;
  background: transparent;
  border: none;
  color: hsl(var(--sidebar-foreground));
  outline: none;
  transition: transform 150ms ease;
  cursor: pointer;

  &:hover {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--sidebar-ring));
  }

  svg {
    height: 1rem;
    width: 1rem;
    flex-shrink: 0;
  }

  &::after {
    content: "";
    position: absolute;
    inset: -0.5rem;
  }

  @media (min-width: 768px) {
    &::after {
      display: none;
    }
  }

  ${({ collapsed }) =>
    collapsed &&
    css`
      display: none;
    `}
`;

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state } = useSidebar();

  return (
    <Comp
      as={SidebarGroupActionStyled}
      ref={ref}
      data-sidebar="group-action"
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";

const SidebarGroupContent = styled.div`
  width: 100%;
  font-size: 0.875rem;
`;
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = styled.ul`
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = styled.li`
  position: relative;
`;
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  isActive?: boolean;
  collapsed?: boolean;
}

const SidebarMenuButtonStyled = styled.button<SidebarMenuButtonProps>`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  border-radius: calc(var(--radius) - 2px);
  padding: 0.5rem;
  text-align: left;
  font-size: 0.875rem;
  outline: none;
  transition: all 150ms ease;
  background: transparent;
  border: none;
  cursor: pointer;
  color: hsl(var(--sidebar-foreground));

  &:hover {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--sidebar-ring));
  }

  &:active {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.5;
  }

  &[data-active="true"] {
    background-color: hsl(var(--sidebar-accent));
    font-weight: 500;
    color: hsl(var(--sidebar-accent-foreground));
  }

  &[data-state="open"]:hover {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  ${({ collapsed }) =>
    collapsed &&
    css`
      height: 2rem !important;
      width: 2rem !important;
      padding: 0.5rem !important;
    `}

  span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    height: 1rem;
    width: 1rem;
    flex-shrink: 0;
  }

  ${({ variant }) =>
    variant === "outline" &&
    css`
      background-color: hsl(var(--background));
      box-shadow: 0 0 0 1px hsl(var(--sidebar-border));

      &:hover {
        background-color: hsl(var(--sidebar-accent));
        color: hsl(var(--sidebar-accent-foreground));
        box-shadow: 0 0 0 1px hsl(var(--sidebar-accent));
      }
    `}

  ${({ size }) =>
    size === "sm" &&
    css`
      height: 1.75rem;
      font-size: 0.75rem;
    `}

  ${({ size }) =>
    size === "lg" &&
    css`
      height: 3rem;
      font-size: 0.875rem;
    `}

  ${({ size, collapsed }) =>
    size === "lg" &&
    collapsed &&
    css`
      padding: 0 !important;
    `}
`;

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    variant?: "default" | "outline";
    size?: "default" | "sm" | "lg";
  }
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();

    const button = (
      <Comp
        as={SidebarMenuButtonStyled}
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        variant={variant}
        size={size}
        isActive={isActive}
        collapsed={state === "collapsed"}
        {...props}
      />
    );

    if (!tooltip) {
      return button;
    }

    if (typeof tooltip === "string") {
      tooltip = {
        children: tooltip,
      };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          hidden={state !== "collapsed" || isMobile}
          {...tooltip}
        />
      </Tooltip>
    );
  },
);
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarMenuActionStyled = styled.button<{
  showOnHover?: boolean;
  size?: "default" | "sm" | "lg";
  collapsed?: boolean;
}>`
  position: absolute;
  right: 0.25rem;
  top: 0.375rem;
  display: flex;
  aspect-ratio: 1;
  width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius) - 2px);
  padding: 0;
  background: transparent;
  border: none;
  color: hsl(var(--sidebar-foreground));
  outline: none;
  transition: transform 150ms ease;
  cursor: pointer;

  &:hover {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--sidebar-ring));
  }

  svg {
    height: 1rem;
    width: 1rem;
    flex-shrink: 0;
  }

  &::after {
    content: "";
    position: absolute;
    inset: -0.5rem;
  }

  @media (min-width: 768px) {
    &::after {
      display: none;
    }
  }

  ${({ size }) =>
    size === "sm" &&
    css`
      top: 0.25rem;
    `}

  ${({ size }) =>
    size === "lg" &&
    css`
      top: 0.625rem;
    `}

  ${({ collapsed }) =>
    collapsed &&
    css`
      display: none;
    `}

  ${({ showOnHover }) =>
    showOnHover &&
    css`
      @media (min-width: 768px) {
        opacity: 0;
      }

      .group:focus-within &,
      .group:hover &,
      &[data-state="open"] {
        opacity: 1;
      }
    `}
`;

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(({ asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { state } = useSidebar();

  return (
    <Comp
      as={SidebarMenuActionStyled}
      ref={ref}
      data-sidebar="menu-action"
      showOnHover={showOnHover}
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";

const SidebarMenuBadgeStyled = styled.div<{
  size?: "default" | "sm" | "lg";
  collapsed?: boolean;
}>`
  position: absolute;
  right: 0.25rem;
  display: flex;
  height: 1.25rem;
  min-width: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--radius) - 2px);
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: hsl(var(--sidebar-foreground));
  user-select: none;
  pointer-events: none;

  ${({ size }) =>
    size === "sm" &&
    css`
      top: 0.25rem;
    `}

  ${({ size }) =>
    size === "default" &&
    css`
      top: 0.375rem;
    `}

  ${({ size }) =>
    size === "lg" &&
    css`
      top: 0.625rem;
    `}

  ${({ collapsed }) =>
    collapsed &&
    css`
      display: none;
    `}
`;

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ ...props }, ref) => {
  const { state } = useSidebar();

  return (
    <SidebarMenuBadgeStyled
      ref={ref}
      data-sidebar="menu-badge"
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarMenuBadge.displayName = "SidebarMenuBadge";

const SidebarMenuSkeletonStyled = styled.div`
  display: flex;
  height: 2rem;
  border-radius: calc(var(--radius) - 2px);
  gap: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  align-items: center;
`;

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean;
  }
>(({ showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <SidebarMenuSkeletonStyled
      ref={ref}
      data-sidebar="menu-skeleton"
      {...props}
    >
      {showIcon && (
        <Skeleton
          css={css`
            height: 1rem;
            width: 1rem;
            border-radius: calc(var(--radius) - 2px);
          `}
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        css={css`
          height: 1rem;
          flex: 1;
          max-width: ${width};
        `}
        data-sidebar="menu-skeleton-text"
      />
    </SidebarMenuSkeletonStyled>
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";

const SidebarMenuSub = styled.ul<{
  collapsed?: boolean;
}>`
  margin-left: 0.875rem;
  margin-right: 0.875rem;
  display: flex;
  min-width: 0;
  transform: translateX(1px);
  flex-direction: column;
  gap: 0.25rem;
  border-left: 1px solid hsl(var(--sidebar-border));
  padding-left: 0.625rem;
  padding-right: 0.625rem;
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
  list-style: none;
  margin-top: 0;
  margin-bottom: 0;

  ${({ collapsed }) =>
    collapsed &&
    css`
      display: none;
    `}
`;

const SidebarMenuSubComponent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ ...props }, ref) => {
  const { state } = useSidebar();

  return (
    <SidebarMenuSub
      ref={ref}
      data-sidebar="menu-sub"
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarMenuSubComponent.displayName = "SidebarMenuSub";

const SidebarMenuSubItem = styled.li``;
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";

const SidebarMenuSubButtonStyled = styled.a<{
  size?: "sm" | "md";
  isActive?: boolean;
  collapsed?: boolean;
}>`
  display: flex;
  height: 1.75rem;
  min-width: 0;
  transform: translateX(-1px);
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
  border-radius: calc(var(--radius) - 2px);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  color: hsl(var(--sidebar-foreground));
  outline: none;
  text-decoration: none;
  transition: all 150ms ease;

  &:hover {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--sidebar-ring));
  }

  &:active {
    background-color: hsl(var(--sidebar-accent));
    color: hsl(var(--sidebar-accent-foreground));
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.5;
  }

  span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  svg {
    height: 1rem;
    width: 1rem;
    flex-shrink: 0;
    color: hsl(var(--sidebar-accent-foreground));
  }

  ${({ isActive }) =>
    isActive &&
    css`
      background-color: hsl(var(--sidebar-accent));
      color: hsl(var(--sidebar-accent-foreground));
    `}

  ${({ size }) =>
    size === "sm" &&
    css`
      font-size: 0.75rem;
    `}

  ${({ size }) =>
    size === "md" &&
    css`
      font-size: 0.875rem;
    `}

  ${({ collapsed }) =>
    collapsed &&
    css`
      display: none;
    `}
`;

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(({ asChild = false, size = "md", isActive, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  const { state } = useSidebar();

  return (
    <Comp
      as={SidebarMenuSubButtonStyled}
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      size={size}
      isActive={isActive}
      collapsed={state === "collapsed"}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";

export {
  Sidebar,
  SidebarContentComponent as SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInsetComponent as SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSubComponent as SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRailComponent as SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
