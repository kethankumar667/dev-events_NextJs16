"use client";

import Image from "next/image";
import ArrowDown from "@/public/icons/arrow-down.svg";
const ExploreBtn = () => {
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={() => {}}
    >
      <a href="#">
        Explore Events
        <Image src={ArrowDown} alt="arrow-down" width={24} height={24} />
      </a>
    </button>
  );
};

export default ExploreBtn;
