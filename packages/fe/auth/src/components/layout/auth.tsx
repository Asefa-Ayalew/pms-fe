'use client';
import { Login } from '../auth/login/login';
import { JSX } from 'react';

interface Config {
  basePath?: string;
}

const defaultConfig = {
  basePath: '/',
};

export function Auth({
  config,
}: {
  path: string;
  config: Config;
}): JSX.Element {
  const options = { ...defaultConfig, ...config };

  return (
      <Login basePath={options.basePath} />
  );
}
