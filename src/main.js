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

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[character]);

const eventCard = (event, index) => {
  const image = event.photoUrl
    ? `<img src="${escapeHtml(event.photoUrl)}" alt="" class="h-full w-full object-cover" loading="lazy" />`
    : `<div class="grid h-full min-h-52 place-items-center bg-secondary text-secondary-content">
        <svg viewBox="0 0 24 24" class="size-14 opacity-80" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M8 14h2M14 14h2M8 18h2" />
        </svg>
      </div>`;

  return `
    <article class="card event-card overflow-hidden border border-base-300 bg-base-100 shadow-sm hover:shadow-xl">
      <figure class="h-52">${image}</figure>
      <div class="card-body gap-3 p-6">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          </svg>
          ${escapeHtml(formatEventDate(event.when))}
        </div>
        <h3 class="card-title text-xl text-primary">${escapeHtml(event.name)}</h3>
        <p class="line-clamp-3 text-sm leading-6 text-base-content/65">${escapeHtml(event.description)}</p>
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

const renderEvents = async () => {
  try {
    const events = await fetchEvents();
    if (events.length === 0) {
      showMessage('No events scheduled yet', 'Check back soon for the latest school activities.');
      return;
    }
    eventsContainer.innerHTML = events.map(eventCard).join('');
  } catch (error) {
    console.error('Unable to load upcoming events:', error);
    showMessage('Events are taking a quick break', 'We could not load the event list right now. Please try again shortly.', 'warning');
  }
};

renderEvents();
