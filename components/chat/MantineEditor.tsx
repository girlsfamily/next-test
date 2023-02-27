import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const RichTextEditor  = dynamic(() => import('@mantine/rte'), {
  // Disable during server side rendering
  ssr: false,
  // Render anything as fallback on server, e.g. loader or html content without editor
  loading: () => null,
})

const people = [
  { id: 1, value: 'Bill Horsefighter' },
  { id: 2, value: 'Amanda Hijacker' },
  { id: 3, value: 'Leo Summerhalter' },
  { id: 4, value: 'Jane Sinkspitter' },
];

const tags = [
  { id: 1, value: 'JavaScript' },
  { id: 2, value: 'TypeScript' },
  { id: 3, value: 'Ruby' },
  { id: 3, value: 'Python' },
];

export default function ChatInput() {
  const [value, onChange] = useState('');
  const mentions = useMemo(
    () => ({
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ['@', '#'],
      // source: (searchTerm, renderList, mentionChar) => {
      //   const list = mentionChar === '@' ? people : tags;
      //   const includesSearchTerm = list.filter((item) =>
      //     item.value.toLowerCase().includes(searchTerm.toLowerCase())
      //   );
      //   renderList(includesSearchTerm);
      // },
    }),
    []
  );

  const modules = useMemo(
    () => ({
      history: { delay: 2500, userOnly: true },
      // syntax: true,
      toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline','strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
    }),
    []
  );

  return (
    <RichTextEditor
      value={value}
      controls={[
        [],
      ]}
      onChange={onChange}
      placeholder=""
      modules={modules}
      mentions={mentions}
    />
  );
}