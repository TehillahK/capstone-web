import { createClient } from '@supabase/supabase-js';
import './style.css';

// Use the publishable key for browser clients. The anon key fallback supports older projects.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://YOUR_PROJECT.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'YOUR_SUPABASE_PUBLISHABLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const eventsContainer = document.querySelector('#events-container');
document.querySelector('#current-year').textContent = new Date().getFullYear();

const formatEventDate = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(timestamp));

const eventDateParts = (timestamp) => {
  const date = new Date(timestamp);
  return {
    day: new Intl.DateTimeFormat(undefined, { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date).toUpperCase(),
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date).toUpperCase(),
    time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
  };
};

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);

const eventCard = (event, index) => {
  const dateParts = eventDateParts(event.when);
  const image = event.photoUrl
    ? `<img src="${escapeHtml(event.photoUrl)}" alt="" class="event-card__image h-full w-full object-cover" loading="lazy" />`
    : `<div class="grid h-full min-h-28 place-items-center bg-secondary text-secondary-content">
        <svg viewBox="0 0 24 24" class="size-12 opacity-80" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="m4 16 5-5 3 3 3-4 5 6" />
          <path d="M4 5h16v14H4zM8 9h.01" />
        </svg>
      </div>`;

  return `
    <article class="event-card card reveal-card overflow-hidden rounded-none border-2 border-neutral bg-base-100 shadow-[6px_6px_0_0] shadow-primary/60" style="--reveal-delay: ${Math.min(index, 8) * 55}ms">
      <figure class="h-28 border-b-2 border-neutral">${image}</figure>
      <div class="card-body gap-4 p-5">
        <div class="flex gap-4">
          <div class="event-card__date min-w-16 pr-4 text-center">
            <p class="text-xs font-extrabold tracking-widest text-secondary">${dateParts.weekday}</p>
            <p class="font-display text-5xl leading-none text-primary">${dateParts.day}</p>
            <p class="mt-1 text-xs font-bold tracking-widest text-base-content/60">${dateParts.month}</p>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase leading-5 tracking-wider text-base-content/55">${escapeHtml(dateParts.time)}</p>
            <h3 class="card-title mt-1 text-xl leading-tight text-primary">${escapeHtml(event.name)}</h3>
          </div>
        </div>
        <div class="border-t border-dashed border-base-content/25 pt-4">
          <p class="line-clamp-3 text-sm leading-6 text-base-content/70">${escapeHtml(event.description)}</p>
        </div>
      </div>
    </article>
  `;
};

const showMessage = (title, message, tone = 'info') => {
  eventsContainer.innerHTML = `
    <div class="alert alert-${tone} col-span-full mx-auto max-w-2xl">
      <span>
        <strong class="block">${escapeHtml(title)}</strong>
        <span class="text-sm">${escapeHtml(message)}</span>
      </span>
    </div>
  `;
};

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('id, name, photoUrl, description, when')
    .gte('when', new Date().toISOString())
    .order('when', { ascending: true });

  if (error) throw error;
  return data ?? [];
};

const revealEvents = () => {
  const revealCards = eventsContainer.querySelectorAll('.reveal-card');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealCards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealCards.forEach((card) => observer.observe(card));
};

const renderEvents = async () => {
  try {
    const events = await fetchEvents();
    if (events.length === 0) {
      showMessage('No events scheduled yet', 'Check back soon for the latest school activities.');
      return;
    }
    eventsContainer.innerHTML = events.map(eventCard).join('');
    revealEvents();
  } catch (error) {
    console.error('Unable to load upcoming events:', error);
    showMessage('Events are taking a quick break', 'We could not load the event list right now. Please try again shortly.', 'warning');
  }
};

renderEvents();
