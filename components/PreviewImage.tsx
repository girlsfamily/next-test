import {
  FC,
  ReactNode,
  KeyboardEvent,
  MouseEvent,
  WheelEvent,
  useRef,
  useState,
  Children,
  isValidElement,
  cloneElement,
  useEffect
} from 'react'
import { createPortal } from "react-dom"
import { createStyles, keyframes } from '@mantine/core'
import { useFullscreen } from '@mantine/hooks'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper'
import { BsFullscreen, BsPlayBtn, BsPlusCircle, BsDashCircle, BsChevronLeft, BsChevronRight } from 'react-icons/bs'
import { TbRotate2, TbRotateClockwise2 } from 'react-icons/tb'
import { AiOutlineClose } from 'react-icons/ai'
import 'swiper/css'
import 'swiper/css/autoplay'

const Portal = ({ children }: any) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null
}

export interface PreviewImageProp {
  children: ReactNode
  previewList: string[]
}

export const pop = keyframes({
  'from': { transform: 'scale(.95)' },
  '40%': { transform: 'scale(1.02)' },
  'to': { transform: 'scale(1)' }
});

const useStyles = createStyles((theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, .1)',
    zIndex: 9999,
    userSelect: 'none',
    backdropFilter: 'blur(var(--glass-blur,40px))',
    outline: 'none'
  },
  swiper: {
    height: '100%'
  },
  slide: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBar: {
    position: 'absolute',
    left: '50%',
    bottom: 50,
    transform: 'translateX(-50%)',
    borderRadius: '8px',
    width: 300,
    // padding: '0 55px 0 15px',
    height: 45,
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: 20,
    zIndex: 1,

    backdropFilter: 'blur(var(--glass-blur,40px))',
    boxShadow: '0 0 0 1px rgb(255 255 255/var(--glass-border-opacity,10%)) inset,0 0 0 2px #0000000d',
    textShadow: '0 1px rgb(0 0 0/var(--glass-text-shadow-opacity,5%))',
    backgroundImage: 'linear-gradient(135deg,rgb(255 255 255/var(--glass-opacity,30%)) 0%,rgb(0 0 0/0%) 100%),linear-gradient(var(--glass-reflex-degree,90deg),rgb(255 255 255/var(--glass-reflex-opacity,10%)) 260px,rgb(0 0 0/0%) 25%)',
    // boxShadow:
      // 'rgb(255 255 255) 0px 1px 3px, rgb(255 255 255) 0px 0px 5px -5px, rgb(255 255 255) 0px 0px 7px -5px'
  },
  action: {
    display: 'flex',
    padding: '0 15px 0 5px',
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  icon: {
    cursor: 'pointer',
    color: theme.colors.dark[6],
    animation: `${pop} .25s ease-out`,
    // .btn:active:hover, .btn:active:focus
    ['&:active:focus']: {
      animation: 'none',
      transform: 'scale(.95)'
    },
    ['&:active:hover']: {
      animation: 'none',
      transform: 'scale(.95)'
    },
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    cursor: 'pointer',
    height: '100%',
    width: 40,
    borderRadius: '0 8px 8px 0',
    // background: 'linear-gradient(to right, rgba(255, 255, 255), #bbb)'
    // top: '50%
    // paddingLeft: '15px'
  },
  close: {
    position: 'absolute',
    right: 35,
    top: 25,
    zIndex: 1,
    width: 45,
    height: 45,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    background: 'rgb(255 255 255/var(--glass-opacity,30%))'
  }
}))

const PreviewImage: FC<PreviewImageProp> = ({ children, previewList= [] }) => {
  const { classes } = useStyles()
  const [visible, setVisible] = useState(false)
  const [move, setMove] = useState(false)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [cx, setCX] = useState(0)
  const [cy, setCY] = useState(0)
  const [rotate, setRotate] = useState(0)
  const [scale, setScale] = useState(1)
  const [swiper, setSwiper] = useState<any>(null)
  const focusRef = useRef<HTMLDivElement>(null)
  const activeImg = useRef<HTMLImageElement>(null)
  const { ref, toggle, fullscreen } = useFullscreen()

  useEffect(() => {
    if (!visible) {
      reset()
    } else {
      if (focusRef.current) {
        ref(focusRef.current)
        focusRef.current.focus()
      }
    }
  }, [visible, ref, focusRef])

  useEffect(() => {
    if (swiper && !swiper.destroyed) {
      if (fullscreen && !swiper.autoplay.running) {
        swiper.autoplay.stop()
        swiper.autoplay.start()
      } else {
        swiper.autoplay.stop()
      }
    }
  }, [fullscreen, swiper])

  const wheelFunc = (event: WheelEvent<HTMLDivElement>) => {
    let s = scale + event.deltaY * -0.001;
    restrictScale(s)
  }

  const zoom = (zoomIn: boolean = false) => {
    let s = zoomIn ? scale+0.2 : scale-0.2
    restrictScale(s)
  }

  const restrictScale = (s: number) => {
    if (fullscreen) return
    return setScale(Math.min(Math.max(.2, s), 2.5))
  }

  const reset = () => {
    setMove(false)
    setScale(1)
    setRotate(0)
    setX(0)
    setY(0)
    setCX(0)
    setCY(0)
  }

  const setFullScreen = () => {
    reset()
    toggle()
  }

  const mouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (fullscreen) return
    let { clientX, clientY } = e
    setMove(true)
    setCX(clientX)
    setCY(clientY)
  }

  const mouseMove = (e: MouseEvent<HTMLImageElement>) => {
    let { clientX, clientY } = e
    if (move) {
      setX(x + clientX - cx)
      setY(y + clientY - cy)
      setCX(clientX)
      setCY(clientY)
    }
  }

  const mouseUp = () => {
    setMove(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setVisible(false)
    }
  }

  const childrenWithProps = Children.map(children, child => {
    if (isValidElement(child)) {
      return cloneElement(child, { onClick: () => setVisible(true) });
    }
    return child;
  });

  return <>
    {childrenWithProps}
    {visible && previewList.length && <Portal>
      <div tabIndex={-1} ref={focusRef} className={classes.container} onWheel={wheelFunc} onKeyUp={onKeyDown}>
        <Swiper
          modules={[Autoplay]}
          allowTouchMove={false}
          loop={true}
          // autoplay={fullscreen}
          className={classes.swiper}
          onSwiper={(s) => setSwiper(s)}
          // onSlideChange={() => console.log('slide change')}
        >
          {previewList.map(item => <SwiperSlide className={classes.slide} key={item} >
            {({ isActive }) => (
              <img
                draggable={false}
                ref={isActive ? activeImg : null}
                src={item}
                alt="img"
                style={{
                  display: isActive ? 'block' : 'none',
                  transform: `scale(${scale}) rotate(${rotate}deg) translate(${x}px, ${y}px)`
                }}
                className={fullscreen ? 'fullscreen-img' : ''}
                onMouseMove={mouseMove}
                onMouseDown={mouseDown}
                onMouseUp={mouseUp}
              />
            )}
          </SwiperSlide>)}
        </Swiper>
        {
          !fullscreen && <>
            <div className={classes.actionBar}>
              <div className={classes.action}>
                <BsChevronLeft className={classes.icon} onClick={() => { swiper.slidePrev(); reset() } } />
                <BsChevronRight className={classes.icon} onClick={() => { swiper.slideNext(); reset() }} />
                <TbRotate2 size={23} className={classes.icon} onClick={() => setRotate(rotate-90)} />
                <TbRotateClockwise2 size={23} className={classes.icon} onClick={() => setRotate(rotate+90)} />
                <BsDashCircle className={classes.icon} onClick={() => zoom()} />
                <BsPlusCircle className={classes.icon} onClick={() => zoom(true)} />
              </div>
              <div className={classes.right} onClick={setFullScreen}>
                <BsPlayBtn className={classes.icon} />
              </div>
            </div>
            <span className={classes.close} onClick={() => setVisible(false)}>
              <AiOutlineClose size={25} color="rgba(0, 0, 0, .5)" className={classes.icon} />
            </span>
          </>
        }
      </div>
    </Portal>}
  </>
}

export default PreviewImage