import React from 'react';

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-3xl bg-white/60 border border-white/70 shadow-soft ${className}`}>{children}</div>
  );
}

export function Button({
  className = '',
  variant = 'primary',
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition shadow-soft';
  const styles =
    variant === 'primary'
      ? 'bg-white/80 hover:bg-white shadow-3d text-slate-900'
      : variant === 'danger'
        ? 'bg-rose-50/80 hover:bg-rose-100/60 text-rose-800 border border-rose-100'
        : 'bg-white/40 hover:bg-white/60 text-slate-800 border border-white/60';

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-2xl border border-white/70 bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-4 focus:ring-sky-100 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full min-h-[120px] rounded-3xl border border-white/70 bg-slate-100 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-100 ${className}`}
      {...props}
    />
  );
}

export function Label({ className = '', children }) {
  return <div className={`text-xs text-slate-600 mb-1 ${className}`}>{children}</div>;
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <div className="text-lg font-semibold  text-black   ">{title}</div>
      {subtitle ? <div className="text-sm text-slate-600 mt-1 ">{subtitle}</div> : null}
    </div>
  );
}

