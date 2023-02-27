import styles from 'styles/chat.module.css'
import dynamic from 'next/dynamic'
import Dialogue from 'components/chat/Dialogue'
import { Suspense } from 'react'

const DynamicChatInput = dynamic(() => import('components/chat/SlateEditor'), {
  suspense: true
})

export default function Chat () {
  return <div className={styles.container}>
    <div className={styles.chatContainer}>
      <div className={styles.peopleList}>
        {new Array(10).fill(null).map((item, index) => {
          return <Dialogue key={index} />
        })}
      </div>
      <div className={styles.chatWrapper}>
        <div className={styles.contentBox}></div>
        <div className={styles.inputBox}>
          <Suspense fallback={`Loading...`}>
           <DynamicChatInput />
          </Suspense>
        </div>
      </div>
    </div>
  </div>
}