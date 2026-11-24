import { initials } from "../utils/format";

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
];

interface AvatarProps {
  name: string;
  /** Used to pick a stable colour per user. */
  id?: number;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-16 h-16 text-xl",
};

function Avatar({ name, id = 0, size = "md" }: AvatarProps) {
  const color = COLORS[Math.abs(id) % COLORS.length];
  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} ${color} inline-flex items-center justify-center rounded-full font-semibold shrink-0`}
    >
      {initials(name)}
    </span>
  );
}

export default Avatar;
