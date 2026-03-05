'use client';

import { usePathname } from 'next/navigation';
import Header from '@/green-yeild/Header';

const showHeader = ['/dashboard', '/profile', '/plans', '/withdraw'];

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (!showHeader.includes(pathname)) return null;
  return <Header />;
}
