'use client'

import React, {useState} from 'react'
import Split from 'react-split-grid'
import Browser from '@/components/Browser'

export default function Home() {
  const [gridTemplateColumns, setColumns] = useState('1fr 1px 1fr')
  const [gridTemplateRows, setRows] = useState('1fr 1px 1fr')
  const [prev, setPrev] = useState(['1fr 1px 1fr', '1fr 1px 1fr'])

  const handleDrag = (direction: string, track: number, style: string) => {
    if (direction === 'column') {
      setColumns(style)
      setPrev([style, gridTemplateRows])
    } else {
      setRows(style)
      setPrev([gridTemplateColumns, style])
    }
  }

  const max = (index: number) => {
    switch (index) {
      case 0:
        setColumns('2fr 1px 0fr')
        setRows('4fr 1px 0fr')
        return
      case 1:
        setColumns('0fr 1px 2fr')
        setRows('4fr 1px 0fr')
        return
      case 2:
        setColumns('2fr 1px 0fr')
        setRows('0fr 1px 4fr')
        return
      case 3:
        setColumns('0fr 1px 2fr')
        setRows('0fr 1px 4fr')
        return
    }
  }

  const min = () => {
    setColumns(prev[0])
    setRows(prev[1])
    // reset()
  }

  const reset = () => {
    setColumns('1fr 1px 1fr')
    setRows('1fr 1px 1fr')
  }

  return (
    <div className="app">
      <Split
        gridTemplateColumns={gridTemplateColumns}
        gridTemplateRows={gridTemplateRows}
        onDrag={handleDrag}
        // @ts-ignore
        render={({getGridProps, getGutterProps}) => {
          return (
            <div className="grid" {...getGridProps()}>
              <Browser max={() => max(0)} min={min} reset={reset} />
              <div className="gutter-col gutter-col-1" {...getGutterProps('column', 1)} />
              <Browser max={() => max(1)} min={min} reset={reset} />
              <Browser max={() => max(2)} min={min} reset={reset} />
              <div className="gutter-row gutter-row-1" {...getGutterProps('row', 1)} />
              <Browser max={() => max(3)} min={min} reset={reset} />
            </div>
          )
        }}
      />
    </div>
  )
}
