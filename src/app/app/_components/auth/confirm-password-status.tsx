import { IconMapper } from '@/app/_components/icons/IconMapper';
interface ConfirmPasswordStatusProps {
  password: string;
  confirmPassword: string;
}

export function ConfirmPasswordStatus({ password, confirmPassword }: ConfirmPasswordStatusProps) {
  // Don't render until the user has typed something in confirm field
  if (!confirmPassword) return null;

  const match = password === confirmPassword;

  return (
    <p
      className={[
        "flex items-center gap-1.5 font-['Hanken_Grotesk'] text-[13px] mt-1.5 transition-colors duration-300",
        match ? 'text-[#2a7040]' : 'text-[#ba1a1a]',
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <IconMapper
        name={match ? 'check_circle' : 'cancel'}
        style={{
          fontSize: '15px',
          fontVariationSettings: match ? "'FILL' 1" : "'FILL' 0",
        }}
        aria-hidden="true"
      />
      {match ? 'Passwords match' : 'Passwords do not match'}
    </p>
  );
}
