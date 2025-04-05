'use client';
import '../../../styles.css';
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Text,
  Button,
  Stack,
  Flex,
  Center,
} from '@mantine/core';
import { JSX, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { notifications } from '@mantine/notifications';
import { setCookie } from 'cookies-next';
import { useAuth } from '../../../context/auth.context';

const schema = z
  .object({
    email: z.string(),
    password: z.string(),
  })
  .required();

type FormSchema = z.infer<typeof schema>;

export function Login({ basePath }: { basePath?: string }): JSX.Element {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsSigningIn(true);
      const res = await login(data);
      console.log('res', res);
      if (!res) {
        return;
      }
      if (res.message) {
        notifications.show({
          title: 'Error',
          color: 'red',
          message: 'The email or password you entered is incorrect.',
        });
      }
      setCookie('token', res.access_token);
      setCookie('refreshToken', res.refresh_token);
      window.location.href = `${basePath}`;
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Center>
      <Stack className="md:mt-0 w-1/4 items-center justify-center" gap={4}>
        <Flex align="center" justify="center" mb={10}>
          <Text fw={600} fz={22}>
            Login Here!
          </Text>
        </Flex>
        <TextInput
          error={errors.email?.message}
          label="Email"
          placeholder="Your email"
          {...register('email')}
        />
        <PasswordInput
          error={errors.password?.message}
          label="Password"
          placeholder="**********"
          {...register('password')}
          mt="md"
          className="mb-3"
        />
        <Button fullWidth h={40} loading={isSigningIn} type="submit">
          Login
        </Button>
      </Stack>
      </Center>
    </form>
  );
}
