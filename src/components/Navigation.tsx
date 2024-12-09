import React from 'react';
import Link from 'next/link';

export const Navigation = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex space-x-6">
        <Link href="/link-creator" className="text-white hover:text-gray-300">
          Link Creator
        </Link>
        <Link href="/dashboard" className="text-white hover:text-gray-300">
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
