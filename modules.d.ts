declare module '*.sql' {
  const content: string;
  export default content;
}

// Side-effect CSS import consumed by NativeWind.
declare module '*.css';
