import Link from "next/link";
import "./Card.css";
import Image from "next/image";

type IconProps = {
  url: string;
  size: number;
};

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  href: string;
  icon: IconProps;
}
const Card = ({ ...props }: CardProps) => {
  return (
    <Link
      className={`bg-white hover:bg-slate-200 
        px-6 h-40 place-content-center rounded-md 
        hover:scale-105 ease-in-out duration-100 
        text-balance text-primary-800 font-semibold
        shadow-sm shadow-dark_primary-900
        border-b-8 border-primary-400 hover:border-primary-800
        ${props.className}`}
      href={props.href}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">{props.children}</div>
        <Image
          src={props.icon.url}
          alt={props.icon.url}
          height={props.icon.size}
          width={props.icon.size}
        />
      </div>
    </Link>
  );
};

export default Card;
