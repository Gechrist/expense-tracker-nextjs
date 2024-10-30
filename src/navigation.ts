import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { localePrefix, locales } from './localeConfig';

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
