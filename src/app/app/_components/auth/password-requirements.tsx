import { PASSWORD_RULES } from './password-rules';
import { IconMapper } from '@/app/_components/icons/IconMapper';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  if (!password) return null; // don't show until the user starts typing

  return (
    <ul
      className="space-y-1.5 mt-2"
      aria-label="Password requirements"
      aria-live="polite"
      aria-atomic="false"
    >
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.id} className="flex items-center gap-2">
            {/* Icon */}
            <IconMapper
              name={met ? 'check_circle' : 'radio_button_unchecked'}
              className={[
                'flex-shrink-0 transition-colors duration-300 text-[16px]',
                met ? 'text-[#2a7040]' : 'text-[#8a716f]',
              ].join(' ')}
              style={{ fontSize: '16px' }}
            />

            {/* Label */}
            <span
              className={[
                "font-['Hanken_Grotesk'] text-[13px] transition-colors duration-300",
                met ? 'text-[#2a7040]' : 'text-[#8a716f]',
              ].join(' ')}
            >
              {rule.label}
              {/* Screen-reader-only state */}
              <span className="sr-only">{met ? '— satisfied' : '— not satisfied'}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
