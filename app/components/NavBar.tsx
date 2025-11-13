import Link from "next/link";
import React from "react";
import Logo from "@/public/icons/logo.png";
import Image from "next/image";
const NavBar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <p>Dev Event</p>
          <Image src={Logo} alt="logo" width={24} height={24} />
        </Link>
        <ul>
          <Link href="/">Home</Link>
          <Link href="/">Events</Link>
          <Link href="/">Create Event</Link>
        </ul>
      </nav>
    </header>
  );
};

export default NavBar;
