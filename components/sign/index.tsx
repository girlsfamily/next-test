import {useState} from "react"
import {TextInput, PasswordInput, Button, Group, Box, Title, createStyles} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router'
import Image from 'next/image'
import bg from 'assets/bg.jpg'
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import CheckStatusIcon from "./CheckStatusIcon"
import axios from 'axios'

const useStyles = createStyles((theme) => ({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'url(/assets/bg.jpg)'
  },
  formContainer: {
    width: 350,
    position: 'relative',
    color: '#fff',
    padding: '20px 30px',
    boxSizing: 'content-box',
    borderRadius: 10,
    background: 'rgba(0, 0, 0, .3)',
    backdropFilter: 'blur(5px)'
  },
  mt: {
    marginTop: 35
  },
  sBtn: {
    width: 85,
    height: 30,
    fontWeight: 'normal'
  },
  label: {
    color: '#fff'
  }
}))

interface SignType {
  signup?: boolean
}

export default function Index({ signup = false }: SignType) {
  const router = useRouter()
  const { classes } = useStyles()
  const { register, watch, handleSubmit, formState: { errors } } = useForm()
  const [ nameCheckStatus, setCheckStatus ] = useState(0)
  const watchPassword = watch('password', '')
  const watchUsername = watch('username', '')
  const onSubmit = (params:any) => {
    console.log(params);
    axios.post('http://localhost:8080/signup', {
      ...params,
    }).then((res) => {
      console.log(res);
    })
    // console.log(data)
  };
  const submitTxt = signup ? 'Complete sign up' : 'Sign in'
  const tipTxt = signup ? 'Already have an account?' : 'Need an account?'
  const signTxt = (flag: boolean) => flag ? 'Sign in' : 'Sign up'

  const toggle = () => {
    router.push(signup ? '/signin' : 'signup')
  }

  const checkStatus = () => {
    axios.get('http://localhost:8080/verifyUsername', {
      params: { username: watchUsername }
    }).then((res) => {
      console.log(res);
    })
    setCheckStatus(2)
  }

  return (
    <div className={classes.container}>
      <Image src={bg} layout="fill" style={{objectFit: 'cover'}}></Image>
      <Box className={classes.formContainer}>
        <Title align="center" order={2}>{signTxt(!signup)}</Title>
        <form onSubmit={handleSubmit(onSubmit)}>
          {signup ? <>
            <TextInput
              mt="md"
              size="md"
              label="Email"
              classNames={{label: classes.label}}
              placeholder="your@email.com"
              error={errors.email && errors.email.message as string}
              {...register("email", {
                required: 'Required',
                maxLength : {
                  value: 320,
                  message: 'Exceed 320 characters'
                },
                validate: value => isEmail(value) || 'Does not match the email format'
              })}
            />
            <TextInput
              mt="md"
              size="md"
              label="Nickname"
              classNames={{label: classes.label}}
              placeholder="Nickname"
              rightSection={<CheckStatusIcon onClick={checkStatus} status={nameCheckStatus} />}
              error={errors.username && errors.username.message as string}
              {...register("username", {
                onChange: () => { setCheckStatus(0) },
                required: 'Required',
                maxLength: {
                  value: 50,
                  message: 'Exceed 50 characters'
                },
                pattern: {
                  value: /^([a-zA-Z0-9_\u4e00-\u9fa5]{1,50})$/,
                  message: 'Only alphanumeric Chinese characters and underscores are supported'
                }
              })}
            />
          </> : <>
            <TextInput
              mt="md"
              size="md"
              label="Email/Nickname"
              classNames={{label: classes.label}}
              placeholder="Email/Nickname"
              error={errors.username && errors.username.message as string}
              {...register("username", {
                required: 'Required',
                maxLength: {
                  value: 320,
                  message: 'Exceed 320 characters'
                },
                validate: value => isEmail(value) || /^([a-zA-Z0-9_\u4e00-\u9fa5]{1,50})$/.test(value) || 'Wrong format'
              })}
            />
          </>}
          <PasswordInput
            size="md"
            mt="md"
            label="Password"
            classNames={{label: classes.label}}
            placeholder="Password"
            error={errors.password && errors.password.message as string}
            {...register("password", {
              required: 'Required',
              maxLength : {
                value: 50,
                message: 'Please enter no more than 50 characters'
              },
              validate: value => isStrongPassword(value) || 'At least eight characters, at least one number, lowercase and uppercase letters, and special characters'
            })}
          />
          {signup ? <PasswordInput
            size="md"
            mt="md"
            label="Confirm password"
            classNames={{label: classes.label}}
            placeholder="Confirm password"
            error={errors.confirmPassword && errors.confirmPassword.message as string}
            {...register("confirmPassword", {
              required: 'Required',
              validate: value => watchPassword === value || 'The two entries are inconsistent'
            })}
          /> : <></>}

          <Button uppercase className={classes.mt} fullWidth size="md" type="submit">{submitTxt}</Button>

          <Group className={classes.mt} position="center">
            <span>{tipTxt}</span> <Button className={classes.sBtn} variant="white" onClick={toggle}>{signTxt(signup)}</Button>
          </Group>

          {signup ? <></> : <Group className={classes.mt} position="center">
            Forgot your password? Reset it
          </Group>}

        </form>
      </Box>
    </div>
  );
}