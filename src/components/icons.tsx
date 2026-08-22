// Figma '최종' 시안의 Material Symbols 아이콘(arrow_back 180deg / expand_circle_right)을
// currentColor 기반 인라인 SVG로 옮겨, 다크/라이트 섹션 어디서든 텍스트 색을 그대로 물려받게 한다.
export function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className} aria-hidden="true">
      <path
        d="M11.0595 19.125L19.6039 27.6694L18 29.25L6.75 18L18 6.75L19.6039 8.33063L11.0595 16.875H29.25V19.125H11.0595Z"
        fill="currentColor"
        transform="rotate(180 18 18)"
      />
    </svg>
  );
}

export function ExpandCircleRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M27.032 24L20.777 30.255L21.9435 31.472L29.4155 24L21.9435 16.528L20.777 17.745L27.032 24ZM24.0065 42C21.5175 42 19.1773 41.5277 16.986 40.583C14.795 39.6383 12.889 38.3508 11.268 36.7205C9.647 35.0898 8.36383 33.1842 7.4185 31.0035C6.47283 28.8228 6 26.4905 6 24.0065C6 21.5175 6.47233 19.1773 7.417 16.986C8.36167 14.795 9.64367 12.889 11.263 11.268C12.8823 9.647 14.7867 8.36383 16.976 7.4185C19.165 6.47283 21.5042 6 23.9935 6C26.4825 6 28.817 6.47233 30.997 7.417C33.1773 8.36167 35.0835 9.64367 36.7155 11.263C38.3475 12.8823 39.6362 14.7867 40.5815 16.976C41.5272 19.165 42 21.5042 42 23.9935C42 26.4772 41.5277 28.8105 40.583 30.9935C39.6383 33.1762 38.3508 35.0835 36.7205 36.7155C35.0898 38.3475 33.1855 39.6362 31.0075 40.5815C28.8295 41.5272 26.4958 42 24.0065 42ZM24 40.3075C28.5367 40.3075 32.3888 38.7238 35.5565 35.5565C38.7238 32.3888 40.3075 28.5367 40.3075 24C40.3075 19.458 38.7238 15.6045 35.5565 12.4395C32.3888 9.27483 28.5367 7.6925 24 7.6925C19.458 7.6925 15.6045 9.27483 12.4395 12.4395C9.27483 15.6045 7.6925 19.458 7.6925 24C7.6925 28.5367 9.27483 32.3888 12.4395 35.5565C15.6045 38.7238 19.458 40.3075 24 40.3075Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12.9462 12L8.34625 7.4L9.4 6.34625L15.0538 12L9.4 17.6537L8.34625 16.6L12.9462 12Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function StepCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="12" fill="white" />
      <path
        d="M9.95811 16.7118L5.5127 12.2664L6.40353 11.3753L9.95811 14.9299L17.596 7.29199L18.4869 8.18303L9.95811 16.7118Z"
        fill="#0D0D0D"
      />
    </svg>
  );
}
