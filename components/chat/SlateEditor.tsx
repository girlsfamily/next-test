import { FC, KeyboardEvent, useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button, createStyles, ScrollArea, Popover, FileButton } from '@mantine/core'
import { Editor, Range, createEditor, Transforms, Descendant } from 'slate'
import { Slate, Editable, withReact, ReactEditor, useSelected, useFocused, useSlateStatic } from 'slate-react'
import { withHistory } from 'slate-history'
import { BsEmojiSmile, BsImage } from 'react-icons/bs'
import { FaRegPaperPlane } from 'react-icons/fa'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { MentionElement, EmojiElement, ImageElement, CustomEditor, ImageData } from './custom-types'
import axios from 'axios'
import PreviewImage from "../PreviewImage";

export interface ChatInterface {
  readOnly?: boolean
}

const Portal = ({ children }: any) => {
  return typeof document === 'object'
    ? createPortal(children, document.body)
    : null
}

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  popover: {
    background: 'transparent',
    padding: 0,
    borderRadius: 10
  },
  emoji: {
    lineHeight: 0,
    fontWeight: 'bold'
  },
  chatInputWrapper: {
    padding: '6px 10px',
    // minHeight: 200,
    fontSize: 15,
    lineHeight: 2,
    position: 'relative',
    outline: 'none',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    overflowWrap: 'break-word',
    height: '100%'
  },
  editor: {
    minHeight: '100%'
  },
  toolbar: {
    height: 35,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    boxShadow: '1px 1px 2px #fafafa'
    // borderBottom: '1px solid #fafafa'
  },
  icon: {
    cursor: 'pointer',
    marginRight: 12,
    color: theme.colors.gray[6]
  },
  sendContainer: {
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12
  },
  sendBtn: {
    width: 100,
    fontWeight: 500,
    boxShadow: 'rgb(0 0 0 / 5%) 0px 1px 3px, rgb(0 0 0 / 5%) 0px 10px 15px -5px, rgb(0 0 0 / 4%) 0px 7px 7px -5px;'
  },
  mentions: {
    position: 'absolute',
    padding: '6px',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 5px rgba(0,0,0,.2)',
    zIndex: 99
  },
  mentionList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  mentionItem: {
    width: 200,
    fontSize: 14,
    height: 32,
    lineHeight: '30px',
    padding: '0 5px',
    cursor: 'pointer',
    borderRadius: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  activeMention: {
    color: '#fff',
    backgroundImage: theme.fn.gradient({ from: theme.colors.main[6], to: theme.colors.main[4], deg: 20 }),
  }
}))

const ChatInput: FC<ChatInterface> = ({ readOnly }) => {
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [
        {
          text: ''
        }
      ]
    }
  ]

  const viewport = useRef<HTMLDivElement>(null)
  const mentionItem = useRef<HTMLLIElement>(null)
  const mentionRef = useRef<HTMLDivElement>(null)
  const [shouldMove, setShouldMove] = useState(false)
  const [target, setTarget] = useState<Range | undefined | null>()
  const [index, setIndex] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [search, setSearch] = useState('')
  const editor = useMemo(() => withImages(withMentions(withEmoji(withReact(withHistory(createEditor()))))), [])
  const [value, setValue] = useState<Descendant[]>(initialValue)
  const [opened, setOpened] = useState(false)
  const renderElement = useCallback((props: any) => <Element {...props} shouldMove={shouldMove} />, [shouldMove])

  const { classes } = useStyles()

  const chars = CHARACTERS.filter(c =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 18)

  useEffect(() => {
    if (shouldMove) {
      setShouldMove(false)
    }
  }, [shouldMove])

  useEffect(() => {
    if (target && chars.length > 0) {
      const el = mentionRef.current
      const domRange = ReactEditor.toDOMRange(editor, target)
      const rect = domRange.getBoundingClientRect()
      if (el) {
        // el.style.top = `${rect.top + window.scrollY - 24}px`
        el.style.bottom = `${document.body.clientHeight - rect.top}px`
        el.style.left = `${rect.left + window.scrollX + 15}px`
      }
    }
  }, [chars.length, editor, index, search, target])

  useEffect(() => {
    if (viewport.current && mentionItem.current) {
      const { clientHeight } = viewport.current
      const { offsetHeight } = mentionItem.current
      const offsetTop = index * offsetHeight
      if (offsetTop + 1 >= scrollTop + clientHeight) {
        const top = offsetTop - clientHeight + offsetHeight // (index + 1 - viewCount) * offsetHeight
        setScrollTop(top)
        viewport.current.scrollTo({ top, behavior: 'auto' }) // scrollTop + offsetHeight
      } else if (scrollTop > offsetTop) {
        setScrollTop(offsetTop)
        viewport.current.scrollTo({ top: offsetTop, behavior: 'auto' }) // scrollTop - offsetHeight
      }
      // console.log(scrollTop, offsetTop, scrollTop + clientHeight);
    }
  }, [index, scrollTop, mentionItem, viewport])

  const selectEmoji = (emoji: any) => {
    setOpened(false)
    insertEmoji(editor, emoji.id)
  }

  const selectMention = (i: number = index) => {
    target && Transforms.select(editor, target)
    insertMention(editor, chars[i])
    setTarget(null)
  }

  const selectImage = (file: File) => {
    uploadImage(editor, file)
  }

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    const { key, ctrlKey } = e
    if (['Backspace','Delete'].includes(key)) {
      e.preventDefault()
      setShouldMove(true)
    } else if (key === 'Enter' && ctrlKey) {

    }
  }

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (target) {
        const controlKeys = ['ArrowDown', 'ArrowUp', 'Tab', 'Enter', 'Escape']
        if (controlKeys.includes(e.key)) {
          e.preventDefault()
        }
        switch (e.key) {
          case 'ArrowDown':
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1
            setIndex(prevIndex)
            break
          case 'ArrowUp':
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1
            setIndex(nextIndex)
            break
          case 'Tab':
          case 'Enter':
            selectMention()
            break
          case 'Escape':
            setTarget(null)
            break
        }
      }
    },
    [index, search, target, viewport]
  )

  return <div className={classes.container}>
    <Slate
      editor={editor}
      value={value}
      onChange={value => {
        console.log(value);
        setValue(value)
        const { selection } = editor

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection)
          const cBefore = start && Editor.before(editor, start)
          const current = cBefore && Editor.range(editor, cBefore, start)
          const cStr = current && Editor.string(editor, current)

          const wordBefore = Editor.before(editor, start, { unit: 'word' })
          const before = wordBefore && Editor.before(editor, wordBefore)
          const beforeRange = before && Editor.range(editor, before, start)
          const beforeText = beforeRange && Editor.string(editor, beforeRange)
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/)
          const after = Editor.after(editor, start)
          const afterRange = Editor.range(editor, start, after)
          const afterText = Editor.string(editor, afterRange)
          const afterMatch = afterText.match(/^(\s|$)/)

          if (cStr === '@') {
            setTarget(current)
            setSearch('')
            setIndex(0)
            return
          }
          if (beforeMatch && afterMatch) {
            setTarget(beforeRange)
            setSearch(beforeMatch[1])
            setIndex(0)
            return
          }
        }

        setTarget(null)
      }}
    >
      {readOnly ? <Editable readOnly renderElement={renderElement} /> : <>
        <div className={classes.toolbar}>
          <Popover
            classNames={{
              dropdown: classes.popover,
            }}
            position="top-start"
            opened={opened}
            onChange={setOpened}
          >
            <Popover.Target>
              <span className={classes.emoji} onMouseDown={
                () => {
                  setOpened(true)
                }
              }>
                <BsEmojiSmile className={classes.icon} size="16" />
              </span>
            </Popover.Target>
            <Popover.Dropdown>
              <Picker
                data={data}
                locale="zh"
                onEmojiSelect={selectEmoji}
                previewPosition="none" />
            </Popover.Dropdown>
          </Popover>
          <FileButton onChange={selectImage} accept="image/png,image/jpeg">
            {(props: any) => <BsImage {...props} className={classes.icon} size="16" />}
          </FileButton>
        </div>

        <ScrollArea className="editor-scroll-wrapper" style={{ flex: 1 }}>
          <div className={classes.chatInputWrapper}>
            <Editable className={classes.editor} onKeyUp={onKeyUp} onKeyDown={onKeyDown} renderElement={renderElement} />
          </div>
        </ScrollArea>

        <div className={classes.sendContainer}>
          <Button leftIcon={<FaRegPaperPlane size={16} />} className={classes.sendBtn} variant="white">Send</Button>
        </div>

        {target && chars.length > 0 && (
          <Portal>
            <div
              ref={mentionRef}
              className={classes.mentions}
              data-cy="mentions-portal"
            >
              <ScrollArea.Autosize maxHeight={192} scrollbarSize={5} viewportRef={viewport}>
                <ul className={classes.mentionList}>
                  {chars.map((char, i) => (
                    <li
                      onClick={() => { selectMention(i) }}
                      // onMouseOver={() => { setIndex(i) }}
                      ref={i === index ? mentionItem : null}
                      key={char}
                      className={`${classes.mentionItem} ${i === index && classes.activeMention}`}>
                      {char}
                    </li>
                  ))}
                </ul>
              </ScrollArea.Autosize>
            </div>
          </Portal>
        )}
      </>
      }
    </Slate>
  </div>
}

export default ChatInput

const editorFocus = (editor: CustomEditor) => {
  // ReactEditor.focus(editor)
  // const section = editor.selection
  // console.log(section);
  // section && Transforms.select(editor, section) // Editor.end(editor, [])
  // Transforms.select(editor, Editor.end(editor, []))
}

const Element = (props: any) => {
  const { attributes, children, element, shouldMove } = props
  const insertType = ['image', 'mention', 'emoji']
  if (insertType.includes(element.type)) {
    const editor = useSlateStatic()
    const selected = useSelected()
    if (selected && shouldMove) {
      Transforms.move(editor)
    }
  }
  switch (element.type) {
    case 'image':
      return <Image {...props} />
    case 'mention':
      return <Mention {...props} />
    case 'emoji':
      return <Emoji {...props} />
    default:
      return <p {...attributes}>{children}</p>
  }
}

const withEmoji = (editor: CustomEditor) => {
  const { isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'emoji' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'emoji' ? true : isVoid(element)
  }

  return editor
}

const withMentions = (editor: CustomEditor) => {
  const { isInline, isVoid } = editor

  editor.isInline = element => {
    return element.type === 'mention' ? true : isInline(element)
  }

  editor.isVoid = element => {
    return element.type === 'mention' ? true : isVoid(element)
  }

  return editor
}

const withImages = (editor: CustomEditor) => {
  const { insertData, isVoid, isInline } = editor

  editor.isVoid = element => {
    return element.type === 'image' ? true : isVoid(element)
  }

  editor.isInline = element => {
    return element.type === 'image' ? true : isInline(element)
  }

  editor.insertData = data => {
    const { files } = data

    if (files && files.length > 0) {
      // @ts-ignore
      for (const file of files) {
        const [mime] = file.type.split('/')

        if (mime === 'image') {
          uploadImage(editor, file)
        }
      }
    } else {
      insertData(data)
    }
  }

  return editor
}

const insertEmoji = (editor: CustomEditor, emojiId: string) => {
  const emojiElement: EmojiElement = {
    type: 'emoji',
    emojiId,
    children: [{text: ''}]
  }
  Transforms.insertNodes(editor, emojiElement)
  editorFocus(editor)
}

const insertMention = (editor: CustomEditor, character: string) => {
  const mention: MentionElement = {
    type: 'mention',
    character,
    children: [{ text: '' }],
  }
  Transforms.insertNodes(editor, mention)
  editorFocus(editor)
  // Transforms.move(editor)
}

const insertImage = (editor: CustomEditor, imageData: ImageData) => {
  const image: ImageElement = {
    type: 'image',
    imageData,
    children: [{ text: '' }]
  }
  Transforms.insertNodes(editor, image)
  Transforms.move(editor)
  editorFocus(editor)
  return Editor.previous(editor)
}

const Emoji = ({ attributes, children, element }: any) => {
  return <span
    contentEditable={false}
    {...attributes}
  >
      {children}
    {/*@ts-ignore*/}
    <em-emoji id={element.emojiId} size="1em" />
  </span>
}

const Mention = ({ attributes, children, element }: any) => {
  const selected = useSelected()
  const focused = useFocused()
  return (
    <span
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character.replace(' ', '-')}`}
      style={{
        padding: '3px 3px 2px',
        margin: '0 1px',
        verticalAlign: 'baseline',
        display: 'inline-block',
        fontSize: '0.9em',
        // borderRadius: '4px',
        // backgroundColor: '#eee',
        // boxShadow: selected && focused ? '0 0 0 2px #B4D5FF' : 'none',
      }}
    >
      {children}@{element.character}
    </span>
  )
}

const Image = ({ attributes, children, element }: any) => {
  const editor = useSlateStatic()
  // const path = ReactEditor.findPath(editor, element)
  // Transforms.removeNodes(editor, { at: path })
  const selected = useSelected()
  const focused = useFocused()
  return (
    <>
      <span
        {...attributes}
        contentEditable={false}
        style={{
          position: 'relative'
        }}
      >
        {children}
        <PreviewImage previewList={[
          'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
          'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
          'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
          'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
          'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
          'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
          'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg',
        ]}>
        <img
          alt="image"
          src={element.imageData.url}
          style={{
            display: 'inline-block',
            width: '15em',
            height: '8em',
            padding: '3px',
            boxShadow: `${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'}`
          }}
        />
      </PreviewImage>
      </span>
    </>
  )
}

const uploadImage = (editor: CustomEditor, file: File) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    const { result } = reader
    const image = (result as string).split('base64,')[1]
    const node = insertImage(editor, { url: result })
    axios.post('/api/uploadImage', { image }).then(res => {
      node && Transforms.setNodes(editor, {
        imageData: res.data.data
      }, { at: node[1] })
    })
  })

  reader.readAsDataURL(file)
  // reader.readAsBinaryString(image)
}

const CHARACTERS = [
  'Aayla Securassssssssssssssssssss',
  'Adi Gallia',
  'Admiral Dodd Rancit',
  'Admiral Firmus Piett',
  'Admiral Gial Ackbar',
  'Admiral Ozzel',
  'Admiral Raddus',
  'Admiral Terrinald Screed',
  'Admiral Trench',
  'Admiral U.O. Statura',
  'Agen Kolar',
  'Agent Kallus',
  'Aiolin and Morit Astarte',
  'Aks Moe',
  'Almec',
  'Alton Kastle',
  'Amee',
  'AP-5',
  'Armitage Hux',
  'Artoo',
  'Arvel Crynyd',
  'Asajj Ventress',
  'Aurra Sing',
  'AZI-3',
  'Bala-Tik',
  'Barada',
  'Bargwill Tomder',
  'Baron Papanoida',
  'Barriss Offee',
  'Baze Malbus',
  'Bazine Netal',
  'BB-8',
  'BB-9E',
  'Ben Quadinaros',
  'Berch Teller',
  'Beru Lars',
  'Bib Fortuna',
  'Biggs Darklighter',
  'Black Krrsantan',
  'Bo-Katan Kryze',
  'Boba Fett',
  'Bobbajo',
  'Bodhi Rook',
  'Borvo the Hutt',
  'Boss Nass',
  'Bossk',
  'Breha Antilles-Organa',
  'Bren Derlin',
  'Brendol Hux',
  'BT-1',
  'C-3PO',
  'C1-10P',
  'Cad Bane',
  'Caluan Ematt',
  'Captain Gregor',
  'Captain Phasma',
  'Captain Quarsh Panaka',
  'Captain Rex',
  'Carlist Rieekan',
  'Casca Panzoro',
  'Cassian Andor',
  'Cassio Tagge',
  'Cham Syndulla',
  'Che Amanwe Papanoida',
  'Chewbacca',
  'Chi Eekway Papanoida',
  'Chief Chirpa',
  'Chirrut Îmwe',
  'Ciena Ree',
  'Cin Drallig',
  'Clegg Holdfast',
  'Cliegg Lars',
  'Coleman Kcaj',
  'Coleman Trebor',
  'Colonel Kaplan',
  'Commander Bly',
  'Commander Cody (CC-2224)',
  'Commander Fil (CC-3714)',
  'Commander Fox',
  'Commander Gree',
  'Commander Jet',
  'Commander Wolffe',
  'Conan Antonio Motti',
  'Conder Kyl',
  'Constable Zuvio',
  'Cordé',
  'Cpatain Typho',
  'Crix Madine',
  'Cut Lawquane',
  'Dak Ralter',
  'Dapp',
  'Darth Bane',
  'Darth Maul',
  'Darth Tyranus',
  'Daultay Dofine',
  'Del Meeko',
  'Delian Mors',
  'Dengar',
  'Depa Billaba',
  'Derek Klivian',
  'Dexter Jettster',
  'Dineé Ellberger',
  'DJ',
  'Doctor Aphra',
  'Doctor Evazan',
  'Dogma',
  'Dormé',
  'Dr. Cylo',
  'Droidbait',
  'Droopy McCool',
  'Dryden Vos',
  'Dud Bolt',
  'Ebe E. Endocott',
  'Echuu Shen-Jon',
  'Eeth Koth',
  'Eighth Brother',
  'Eirtaé',
  'Eli Vanto',
  'Ellé',
  'Ello Asty',
  'Embo',
  'Eneb Ray',
  'Enfys Nest',
  'EV-9D9',
  'Evaan Verlaine',
  'Even Piell',
  'Ezra Bridger',
  'Faro Argyus',
  'Feral',
  'Fifth Brother',
  'Finis Valorum',
  'Finn',
  'Fives',
  'FN-1824',
  'FN-2003',
  'Fodesinbeed Annodue',
  'Fulcrum',
  'FX-7',
  'GA-97',
  'Galen Erso',
  'Gallius Rax',
  'Garazeb "Zeb" Orrelios',
  'Gardulla the Hutt',
  'Garrick Versio',
  'Garven Dreis',
  'Gavyn Sykes',
  'Gideon Hask',
  'Gizor Dellso',
  'Gonk droid',
  'Grand Inquisitor',
  'Greeata Jendowanian',
  'Greedo',
  'Greer Sonnel',
  'Grievous',
  'Grummgar',
  'Gungi',
  'Hammerhead',
  'Han Solo',
  'Harter Kalonia',
  'Has Obbit',
  'Hera Syndulla',
  'Hevy',
  'Hondo Ohnaka',
  'Huyang',
  'Iden Versio',
  'IG-88',
  'Ima-Gun Di',
  'Inquisitors',
  'Inspector Thanoth',
  'Jabba',
  'Jacen Syndulla',
  'Jan Dodonna',
  'Jango Fett',
  'Janus Greejatus',
  'Jar Jar Binks',
  'Jas Emari',
  'Jaxxon',
  'Jek Tono Porkins',
  'Jeremoch Colton',
  'Jira',
  'Jobal Naberrie',
  'Jocasta Nu',
  'Joclad Danva',
  'Joh Yowza',
  'Jom Barell',
  'Joph Seastriker',
  'Jova Tarkin',
  'Jubnuk',
  'Jyn Erso',
  'K-2SO',
  'Kanan Jarrus',
  'Karbin',
  'Karina the Great',
  'Kes Dameron',
  'Ketsu Onyo',
  'Ki-Adi-Mundi',
  'King Katuunko',
  'Kit Fisto',
  'Kitster Banai',
  'Klaatu',
  'Klik-Klak',
  'Korr Sella',
  'Kylo Ren',
  'L3-37',
  'Lama Su',
  'Lando Calrissian',
  'Lanever Villecham',
  'Leia Organa',
  'Letta Turmond',
  'Lieutenant Kaydel Ko Connix',
  'Lieutenant Thire',
  'Lobot',
  'Logray',
  'Lok Durd',
  'Longo Two-Guns',
  'Lor San Tekka',
  'Lorth Needa',
  'Lott Dod',
  'Luke Skywalker',
  'Lumat',
  'Luminara Unduli',
  'Lux Bonteri',
  'Lyn Me',
  'Lyra Erso',
  'Mace Windu',
  'Malakili',
  'Mama the Hutt',
  'Mars Guo',
  'Mas Amedda',
  'Mawhonic',
  'Max Rebo',
  'Maximilian Veers',
  'Maz Kanata',
  'ME-8D9',
  'Meena Tills',
  'Mercurial Swift',
  'Mina Bonteri',
  'Miraj Scintel',
  'Mister Bones',
  'Mod Terrik',
  'Moden Canady',
  'Mon Mothma',
  'Moradmin Bast',
  'Moralo Eval',
  'Morley',
  'Mother Talzin',
  'Nahdar Vebb',
  'Nahdonnis Praji',
  'Nien Nunb',
  'Niima the Hutt',
  'Nines',
  'Norra Wexley',
  'Nute Gunray',
  'Nuvo Vindi',
  'Obi-Wan Kenobi',
  'Odd Ball',
  'Ody Mandrell',
  'Omi',
  'Onaconda Farr',
  'Oola',
  'OOM-9',
  'Oppo Rancisis',
  'Orn Free Taa',
  'Oro Dassyne',
  'Orrimarko',
  'Osi Sobeck',
  'Owen Lars',
  'Pablo-Jill',
  'Padmé Amidala',
  'Pagetti Rook',
  'Paige Tico',
  'Paploo',
  'Petty Officer Thanisson',
  'Pharl McQuarrie',
  'Plo Koon',
  'Po Nudo',
  'Poe Dameron',
  'Poggle the Lesser',
  'Pong Krell',
  'Pooja Naberrie',
  'PZ-4CO',
  'Quarrie',
  'Quay Tolsite',
  'Queen Apailana',
  'Queen Jamillia',
  'Queen Neeyutnee',
  'Qui-Gon Jinn',
  'Quiggold',
  'Quinlan Vos',
  'R2-D2',
  'R2-KT',
  'R3-S6',
  'R4-P17',
  'R5-D4',
  'RA-7',
  'Rabé',
  'Rako Hardeen',
  'Ransolm Casterfo',
  'Rappertunie',
  'Ratts Tyerell',
  'Raymus Antilles',
  'Ree-Yees',
  'Reeve Panzoro',
  'Rey',
  'Ric Olié',
  'Riff Tamson',
  'Riley',
  'Rinnriyin Di',
  'Rio Durant',
  'Rogue Squadron',
  'Romba',
  'Roos Tarpals',
  'Rose Tico',
  'Rotta the Hutt',
  'Rukh',
  'Rune Haako',
  'Rush Clovis',
  'Ruwee Naberrie',
  'Ryoo Naberrie',
  'Sabé',
  'Sabine Wren',
  'Saché',
  'Saelt-Marae',
  'Saesee Tiin',
  'Salacious B. Crumb',
  'San Hill',
  'Sana Starros',
  'Sarco Plank',
  'Sarkli',
  'Satine Kryze',
  'Savage Opress',
  'Sebulba',
  'Senator Organa',
  'Sergeant Kreel',
  'Seventh Sister',
  'Shaak Ti',
  'Shara Bey',
  'Shmi Skywalker',
  'Shu Mai',
  'Sidon Ithano',
  'Sifo-Dyas',
  'Sim Aloo',
  'Siniir Rath Velus',
  'Sio Bibble',
  'Sixth Brother',
  'Slowen Lo',
  'Sly Moore',
  'Snaggletooth',
  'Snap Wexley',
  'Snoke',
  'Sola Naberrie',
  'Sora Bulq',
  'Strono Tuggs',
  'Sy Snootles',
  'Tallissan Lintra',
  'Tarfful',
  'Tasu Leech',
  'Taun We',
  'TC-14',
  'Tee Watt Kaa',
  'Teebo',
  'Teedo',
  'Teemto Pagalies',
  'Temiri Blagg',
  'Tessek',
  'Tey How',
  'Thane Kyrell',
  'The Bendu',
  'The Smuggler',
  'Thrawn',
  'Tiaan Jerjerrod',
  'Tion Medon',
  'Tobias Beckett',
  'Tulon Voidgazer',
  'Tup',
  'U9-C4',
  'Unkar Plutt',
  'Val Beckett',
  'Vanden Willard',
  'Vice Admiral Amilyn Holdo',
  'Vober Dand',
  'WAC-47',
  'Wag Too',
  'Wald',
  'Walrus Man',
  'Warok',
  'Wat Tambor',
  'Watto',
  'Wedge Antilles',
  'Wes Janson',
  'Wicket W. Warrick',
  'Wilhuff Tarkin',
  'Wollivan',
  'Wuher',
  'Wullf Yularen',
  'Xamuel Lennox',
  'Yaddle',
  'Yarael Poof',
  'Yoda',
  'Zam Wesell',
  'Zev Senesca',
  'Ziro the Hutt',
  'Zuckuss',
]