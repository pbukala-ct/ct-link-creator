// src/app/page.tsx
import { LinkCreator } from '@/components/LinkCreator';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center justify-center mb-8">
        {/* Commercetools Logo */}
        <div className="mb-4">
          <Image
            src="/images/commercetools-logo.png"
            alt="Commercetools Logo"
            width={300}
            height={108}
            priority
          />
        </div>
      </div>
      <LinkCreator />
    </div>
  );
}