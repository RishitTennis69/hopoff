import { useEffect, useRef, useState } from 'react';
import { AppText } from './AppText';
import { colors } from '@/theme';
import type { ComponentProps } from 'react';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*!?';

function scrambleChar(target: string): string {
  if (target === ' ' || target === '\n') return target;
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

type Props = Omit<ComponentProps<typeof AppText>, 'children'> & {
  text: string;
  /** Ms until fully revealed. */
  duration?: number;
  /** Stagger start (ms). */
  delay?: number;
};

/** Aceternity-style decrypt: gibberish resolves into the real string left-to-right. */
export function EncryptedText({
  text,
  duration = 1600,
  delay = 0,
  variant = 'title',
  color = colors.text,
  center,
  style,
  ...rest
}: Props) {
  const [display, setDisplay] = useState(() => text.split('').map(scrambleChar).join(''));
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
    setDisplay(text.split('').map(scrambleChar).join(''));

    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      const len = text.length;
      if (len === 0) return;

      const tickMs = 36;
      const totalTicks = Math.max(Math.ceil(duration / tickMs), len);
      let tick = 0;

      interval = setInterval(() => {
        tick += 1;
        const revealed = Math.min(len, Math.floor((tick / totalTicks) * len));
        const target = textRef.current;
        const next = target
          .split('')
          .map((char, i) => (i < revealed ? char : scrambleChar(char)))
          .join('');
        setDisplay(next);

        if (tick >= totalTicks) {
          setDisplay(target);
          if (interval) clearInterval(interval);
        }
      }, tickMs);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, duration, delay]);

  return (
    <AppText variant={variant} color={color} center={center} style={style} {...rest}>
      {display}
    </AppText>
  );
}
