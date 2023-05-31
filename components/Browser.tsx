import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useFloating,
  autoUpdate,
  flip,
  offset,
  shift,
  useRole,
  useDismiss,
  useInteractions,
  useListNavigation,
  useTypeahead,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay
} from "@floating-ui/react";

export const MenuItem = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  disabled?: boolean;
  reload?: boolean
  reset?: boolean
}
>(function MenuItem ({ children, disabled, ...props }, ref) {
  return (
    <button
      {...props}
      data-disabled={disabled}
      className="w-full group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none hover:bg-violet9 hover:text-violet1"
      ref={ref}
      role="menuitem"
      disabled={disabled}
    >
      {children}
    </button>
  );
});

// export const MenuItem = ({children, ...props }: {children: React.ReactNode}) => {
//   return <div ref={ref} role="menuitem" {...props}
//   className="group text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] px-[5px] relative pl-[25px] select-none outline-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1">
//     {children}
//   </div>
// }

interface Props {
  label?: string;
  nested?: boolean;
}
const Menu = forwardRef<
  HTMLButtonElement,
  Props & React.HTMLProps<HTMLButtonElement>
>(function Menu ({ children }, forwardedRef) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('')
  const [url, setUrl] = useState('about:blank')

  const listItemsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const listContentRef = useRef(
    Children.map(children, (child) =>
      isValidElement(child) ? child.props.label : null
    ) as Array<string | null>
  );
  const allowMouseUpCloseRef = useRef(false);
  const frame = useRef<HTMLIFrameElement>(null)
  const browser = useRef<HTMLDivElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({ mainAxis: 5, alignmentAxis: 4 }),
      flip({
        fallbackPlacements: ["left-start"]
      }),
      shift({ padding: 10 })
    ],
    placement: "right-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate
  });

  const role = useRole(context, { role: "menu" });
  const dismiss = useDismiss(context);
  const listNavigation = useListNavigation(context, {
    listRef: listItemsRef,
    onNavigate: setActiveIndex,
    activeIndex
  });
  const typeahead = useTypeahead(context, {
    enabled: isOpen,
    listRef: listContentRef,
    onMatch: setActiveIndex,
    activeIndex
  });

  const { getFloatingProps, getItemProps } = useInteractions([
    role,
    dismiss,
    listNavigation,
    typeahead
  ]);

  useEffect(() => {
    let timeout: number;

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();

      let rect = {
        x: 0, y: 0, top: 0, left: 0
      }
      if (browser && browser.current) {
        rect = browser.current.getBoundingClientRect()
      }
      const {top, left, x, y} = rect
      refs.setPositionReference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: e.clientX+x,
            y: e.clientY+y,
            top: e.clientY+top,
            right: e.clientX,
            bottom: e.clientY,
            left: e.clientX+left
          };
        }
      });

      setIsOpen(true);
      clearTimeout(timeout);

      allowMouseUpCloseRef.current = false;
      timeout = window.setTimeout(() => {
        allowMouseUpCloseRef.current = true;
      }, 300);
    }

    function onMouseUp() {
      if (allowMouseUpCloseRef.current) {
        setIsOpen(false);
      }
    }

    const bindMenu = (doc: Window) => {
      doc.addEventListener("contextmenu", onContextMenu);
      doc.addEventListener("mouseup", onMouseUp);
    }

    if (frame.current && frame.current.contentWindow) {
      const doc = frame.current.contentWindow
      frame.current.addEventListener('load', () => {
        bindMenu(doc)
      })
      bindMenu(doc)
      return () => {
        doc.removeEventListener("contextmenu", onContextMenu);
        doc.removeEventListener("mouseup", onMouseUp);
        clearTimeout(timeout);
      };
    }
  }, [refs, frame]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setUrl(value+'?x=;_&y=%3Cscript%3Ealert(1)%3C/script%3E')
      setIsOpen(false)
    }
  }

  const reload = () => {
    frame?.current?.contentWindow.location.reload()
  }

  return (
    <div ref={browser} className="browser">
      <iframe
        ref={frame}
        width="100%"
        height="100%"
        src={url}>
      </iframe>
      <FloatingPortal>
        {isOpen && (
          <FloatingOverlay lockScroll>
            <FloatingFocusManager context={context} initialFocus={refs.floating}>
              <div
                className="flex flex-col space-y-2 outline-none min-w-[220px] bg-white rounded-md overflow-hidden px-[8px] py-[10px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
                ref={refs.setFloating}
                style={floatingStyles}
              >
                {/*{...getFloatingProps()}*/}
                <fieldset className="outline-none flex gap-5 items-center">
                  {/*<label className="text-[13px] text-violet11 w-[75px]" htmlFor="width">*/}
                  {/*  Width*/}
                  {/*</label>*/}
                  <input
                    className="w-full inline-flex items-center justify-center flex-1 rounded px-2.5 text-[13px] leading-none text-violet11 shadow-[0_0_0_1px] shadow-violet7 h-[25px] focus:shadow-[0_0_0_2px] focus:shadow-violet8 outline-none"
                    value={value}
                    onChange={onChange}
                    onKeyUp={onKeyUp}
                  />
                </fieldset>
                {Children.map(
                  children,
                  (child, index) =>
                    isValidElement(child) &&
                    cloneElement(
                      child,
                      getItemProps({
                        tabIndex: activeIndex === index ? 0 : -1,
                        ref(node: HTMLButtonElement) {
                          listItemsRef.current[index] = node;
                        },
                        onClick() {
                          child.props.onClick?.();
                          setIsOpen(false);
                        },
                        onMouseUp() {
                          if (child.props.reload) {
                            reload()
                          }
                          if (child.props.reset) {
                            setUrl('about:blank')
                          }
                          child.props.onClick?.();
                          setIsOpen(false);
                        }
                      })
                    )
                )}
              </div>
            </FloatingFocusManager>
          </FloatingOverlay>
        )}
      </FloatingPortal>
    </div>
  );
});

export const Browser = ({ max, min, reset }: {max: () => void, min: () => void, reset: () => void}) => {
  return <Menu>
    <MenuItem reload>Reload{' '}</MenuItem>
    <MenuItem reset>Reset Page{' '}</MenuItem>
    <MenuItem onClick={() => max()}>Max{' '}</MenuItem>
    <MenuItem onClick={() => min()}>Min{' '}</MenuItem>
    <MenuItem onClick={() => reset()}>Reset Layout{' '}</MenuItem>
  </Menu>
}

export default Browser
