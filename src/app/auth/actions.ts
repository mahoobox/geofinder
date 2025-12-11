
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export async function login(credentials: z.infer<typeof loginSchema>): Promise<{ success: boolean, error?: string }> {
  const parsedCredentials = loginSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return { success: false, error: 'Datos de entrada inválidos.' };
  }

  const { username, password } = parsedCredentials.data;

  const defaultUser = process.env.DEFAULT_USER;
  const defaultPass = process.env.DEFAULT_PASS;

  if (!defaultUser || !defaultPass) {
    console.error("Las variables de entorno DEFAULT_USER y DEFAULT_PASS no están configuradas.");
    return { success: false, error: 'La autenticación no está configurada en el servidor.' };
  }

  if (username === defaultUser && password === defaultPass) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    cookies().set('session', 'authenticated', { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return { success: true };
  }

  return { success: false, error: 'Usuario o contraseña incorrectos.' };
}

export async function logout() {
  cookies().set('session', '', { expires: new Date(0) });
  redirect('/');
}
