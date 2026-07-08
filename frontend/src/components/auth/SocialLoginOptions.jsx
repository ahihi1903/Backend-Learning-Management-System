function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.92.58.11.79-.25.79-.56v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .98-.31 3.18 1.18A11.08 11.08 0 0 1 12 6.02c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.42.36.78 1.07.78 2.16v3.14c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function SsoIcon() {
  return (
    <span className="grid size-5 place-items-center rounded-full border border-slate-300 text-[10px] font-black text-slate-700 dark:border-slate-600 dark:text-slate-200">
      S
    </span>
  );
}

function AuthDivider({ label = "Hoặc" }) {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400">
      <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
    </div>
  );
}

function ProviderButton({ icon, label, onClick, disabled, title }) {
  return (
    <button
      type="button"
      className="group flex min-h-11 w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 text-sm font-black uppercase tracking-[-.01em] text-black transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-950/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-700 dark:bg-zinc-950 dark:text-white dark:hover:border-slate-500 dark:hover:bg-zinc-900"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function SocialLoginOptions({
  onGoogle,
  disabled = false,
  googleDisabled = false,
  action = "Đăng nhập",
}) {
  return (
    <div>
      <AuthDivider />
      <div className="grid gap-4">
        <ProviderButton
          icon={<SsoIcon />}
          label={`${action} bằng SSO`}
          disabled
          title="SSO sẽ được bổ sung khi có backend provider."
        />
        <ProviderButton
          icon={<GoogleIcon />}
          label={`${action} bằng Google`}
          onClick={onGoogle}
          disabled={disabled || googleDisabled}
          title={googleDisabled ? "Chưa cấu hình VITE_GOOGLE_CLIENT_ID" : undefined}
        />
        <ProviderButton
          icon={<GitHubIcon />}
          label={`${action} bằng GitHub`}
          disabled
          title="GitHub login sẽ được bổ sung khi có backend provider."
        />
      </div>
    </div>
  );
}
