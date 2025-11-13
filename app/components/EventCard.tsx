import Image from "next/image";
import Link from "next/link";
import Pin from "@/public/icons/pin.svg";
import Calendar from "@/public/icons/calendar.svg";
import Clock from "@/public/icons/clock.svg";

interface EventCardProps {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}
const EventCard = ({
  title,
  image,
  slug,
  location,
  date,
  time,
}: EventCardProps) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <Image
        src={image}
        alt={title}
        width={410}
        height={410}
        className="poster"
      />
      <div className="flex flex-row gap-2">
        <Image src={Pin} alt="arrow-down" width={14} height={14} />
        <p>{location}</p>
      </div>
      <p className="title">{title}</p>
      <div className="flex flex-row gap-2">
        <Image src={Calendar} alt="date" width={14} height={14} />
        <p>{date}</p>
        |
        <Image src={Clock} alt="time" width={14} height={14} />
        <p>{time}</p>
      </div>
    </Link>
  );
};

export default EventCard;
