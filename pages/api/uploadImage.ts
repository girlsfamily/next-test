// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import axios from "axios";
import FormData from 'form-data'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(1111);
  const form = new FormData();
  form.append('image', req.body.image);
  const response = await axios.post('https://api.imgbb.com/1/upload?key=4acff23864414f395717e9c9ca624a19',
    form
  )
  res.status(200).json(response.data)
  // res.status(200).json({name: 1})
}
