import { cn } from '@/app/app/_util/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[#ddc0bd]/25 border border-[#ddc0bd]/30',
        className,
      )}
      {...props}
    />
  );
}
