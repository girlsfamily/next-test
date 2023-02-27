import { Container, Grid, Space, Card, createStyles } from '@mantine/core'

import { Swiper, SwiperSlide } from 'swiper/react'
import Image from 'next/image'

const useStyles = createStyles((theme) => ({
  container: {
    width: '100%',
    background: theme.colors.gray[0],
    overflow: 'hidden',
    minHeight: '100%', // 'calc(100vh - 80px)'
    paddingTop: 80
  },
  wrapper: {
    padding: '50px 20px',
    margin: '0 auto'
  },
  category: {
    marginBottom: 50,
    display: 'flex',
    justifyContent: 'space-around'
  },
  categoryCon: {
    flex: 1,
    background: 'linear-gradient(105deg, rgb(18, 184, 134) 0%, rgb(130, 201, 30) 100%)',
    borderRadius: 10
  },
  categoryItem: {
    paddingBottom: '35%',
    position: 'relative'
  },
  categoryItemName: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  previewItem: {
    paddingBottom: '150%'
  },
  image: {
    objectFit: 'cover'
  }
}))

export default function Stock () {
  const { classes } = useStyles()
  const banners = [
    'https://images.unsplash.com/photo-1655431607113-67b05d2368a9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1501820416958-4d71836959c7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8NzIwKjM2MHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1514625895778-692f4e00ec41?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fDcyMCozNjB8ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60',
    'https://images.unsplash.com/photo-1540299904114-dc12087c0db2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTh8fDcyMCozNjB8ZW58MHx8MHx8&auto=format&fit=crop&w=600&q=60'
  ]
  const categoryList = ['T-shirt', 'Sweatpants', 'Running shoes', 'Jacket']
  const previewList = ['t1', 't2', 't3', 't4', 't5', 't6']

  return <div className={classes.container}>
    <Swiper
      onSlideChange={() => console.log('slide change')}
      onSwiper={(swiper) => console.log(swiper)}
    >
      {banners.map(item => (<SwiperSlide key={item} style={{height: 500, backgroundImage: 'linear-gradient(105deg, rgb(18, 184, 134) 0%, rgb(130, 201, 30) 100%)'}}>
        {/*<Image priority className={classes.image} layout="fill" src={item} alt='banner' />*/}
      </SwiperSlide>))}
    </Swiper>
    <section className={classes.wrapper}>
      <div className={classes.category}>
        {categoryList.map((item, index) => {
          return <>
            <div key={`${item}_item`} className={classes.categoryCon}>
              <div className={classes.categoryItem}>
                <div className={classes.categoryItemName}>{item}</div>
              </div>
            </div>
            {index < categoryList.length-1 ? <Space key={`${item}_space`} w="lg"></Space> : null}
          </>
        })}
      </div>
      <div className={classes.category}>
        {previewList.map((item, index) => {
          return <>
            <div key={`${item}_item`} className={classes.categoryCon}>
              <div className={`${classes.categoryItem} ${classes.previewItem}`}>
                <div className={classes.categoryItemName}>{item}</div>
              </div>
            </div>
            {index < previewList.length-1 ? <Space key={`${item}_space`} w="lg"></Space> : null}
          </>
        })}
      </div>
    </section>
  </div>
}