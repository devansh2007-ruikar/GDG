import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar as CalendarIcon, RotateCcw, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { EventCard } from '../components/EventCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useToast } from '../context/ToastContext';

// Global in-memory cache for stale-while-revalidate and instant scroll restoration
const eventsCache = new Map();
let cachedCategories = null;

export const EventsPage = () => {
  const [categories, setCategories] = useState(() => cachedCategories || []);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });

  // Initial check: if cached events exist for initial state, load immediately
  const initialCacheKey = JSON.stringify({ page: 1, limit: 9, upcoming: 'true' });
  const initialCached = eventsCache.get(initialCacheKey);

  const [events, setEvents] = useState(() => initialCached?.events || []);
  const [loading, setLoading] = useState(() => !initialCached);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const { error } = useToast();

  const restoredScrollRef = useRef(false);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch unique categories once on mount
  useEffect(() => {
    if (cachedCategories && cachedCategories.length > 0) return;

    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await api.get('/events/categories');
        if (res.data.success && isMounted) {
          cachedCategories = res.data.data;
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch paginated & filtered events with stale-while-revalidate
  useEffect(() => {
    let isMounted = true;

    const fetchEvents = async () => {
      const params = {
        page,
        limit: 9,
        upcoming: upcomingOnly ? 'true' : 'false',
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const cacheKey = JSON.stringify(params);
      const cached = eventsCache.get(cacheKey);

      // Stale-while-revalidate: if cache hit, present cached data instantly
      if (cached) {
        setEvents(cached.events);
        if (cached.meta) setMeta(cached.meta);
        setLoading(false);
        setIsRevalidating(true);
      } else if (events.length === 0) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }

      try {
        const res = await api.get('/events', { params });
        if (res.data.success && isMounted) {
          const freshEvents = res.data.data || [];
          const freshMeta = res.data.meta || { page, limit: 9, total: freshEvents.length, totalPages: 1 };

          // Update cache
          eventsCache.set(cacheKey, { events: freshEvents, meta: freshMeta });

          setEvents(freshEvents);
          setMeta(freshMeta);
        }
      } catch (err) {
        if (isMounted) {
          error(err.response?.data?.error?.message || 'Failed to load events');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsRevalidating(false);
        }
      }
    };

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedCategory, fromDate, toDate, upcomingOnly, page, error]);

  // Restore scroll position when returning from event details page
  useEffect(() => {
    if (events.length > 0 && !restoredScrollRef.current) {
      const saved = sessionStorage.getItem('scroll_/events');
      if (saved) {
        const savedY = parseInt(saved, 10);
        if (!isNaN(savedY) && savedY > 0) {
          restoredScrollRef.current = true;
          requestAnimationFrame(() => {
            window.scrollTo({ top: savedY, left: 0, behavior: 'instant' });
          });
        }
      }
    }
  }, [events]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setFromDate('');
    setToDate('');
    setUpcomingOnly(true);
    setPage(1);
  };

  const domainTabs = ['', ...categories];
  const hasActiveFilters = Boolean(search || selectedCategory || fromDate || toDate || !upcomingOnly);

  return (
    <div className="container events-page-container" style={{ paddingBottom: '5rem' }}>
      {/* Compact Neo-Brutalist Hero Header (Mobile-optimized) */}
      <div className="hero-section" style={{ textAlign: 'center' }}>
        <div 
          className="hero-badge"
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            backgroundColor: 'var(--yellow)', 
            color: '#000000', 
            border: '2px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: 'var(--radius-pill)', 
            fontFamily: 'var(--font-mono)',
            fontWeight: 800, 
            fontSize: '0.725rem', 
            letterSpacing: '0.06em', 
            marginBottom: '0.4rem',
          }}
        >
          <Sparkles size={13} /> GDG RBU • EVENTS
        </div>

        <h1 
          className="hero-title"
          style={{ 
            letterSpacing: '-0.02em', 
            marginBottom: '0.35rem',
            lineHeight: 1.1,
          }}
        >
          DISCOVER EVENTS
        </h1>

        <p 
          className="hero-subtitle"
          style={{ 
            fontFamily: 'var(--font-mono)', 
            color: 'var(--muted)', 
            maxWidth: 640, 
            margin: '0 auto',
            lineHeight: 1.45,
          }}
        >
          Workshops, hackathons & tech talks at RBU with atomic seat reservation.
        </p>
      </div>

      {/* Sticky Search & Filter Control Bar */}
      <div className="sticky-filter-bar">
        {/* Compact Search Row: Search input + Filters toggle button on ONE line */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="search"
              className="input search-input-compact"
              placeholder="Search title, venue, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search events"
              style={{ paddingLeft: '2.25rem' }}
            />
            <Search 
              size={15} 
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} 
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className={`btn btn-outline ${showFilters ? 'btn-active' : ''}`}
            style={{ 
              minHeight: 44, 
              padding: '0 0.85rem', 
              fontSize: '0.85rem', 
              fontFamily: 'var(--font-mono)',
              flexShrink: 0,
              gap: '0.35rem',
            }}
            aria-label="Toggle Advanced Filters"
            aria-expanded={showFilters}
          >
            <Filter size={15} />
            <span>Filters</span>
            {(fromDate || toDate || !upcomingOnly) && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }} />
            )}
            {showFilters ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {hasActiveFilters && (
            <button 
              type="button" 
              onClick={handleResetFilters} 
              className="btn btn-outline"
              title="Reset all filters"
              style={{ minHeight: 44, padding: '0 0.75rem', flexShrink: 0 }}
              aria-label="Reset filters"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Category Pills in one horizontally scrollable row */}
        <div 
          className="category-scroll-container" 
          role="tablist" 
          aria-label="Event category filters"
          style={{ marginTop: '0.5rem' }}
        >
          {domainTabs.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat || 'all'}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`category-pill-btn ${isSelected ? 'selected' : ''}`}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.785rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '0.4rem 0.85rem',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: isSelected ? 'none' : '2px 2px 0 var(--border)',
                  transform: isSelected ? 'translate(2px, 2px)' : 'none',
                  backgroundColor: isSelected ? 'var(--blue)' : 'var(--surface)',
                  color: isSelected ? '#000000' : 'var(--text)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  touchAction: 'manipulation',
                  transition: 'background-color 0.15s ease, color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {cat || 'ALL EVENTS'}
              </button>
            );
          })}
        </div>

        {/* Expandable Advanced Date Filters Drawer */}
        {showFilters && (
          <div 
            className="advanced-filter-drawer"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '0.75rem', 
              alignItems: 'flex-end',
              paddingTop: '0.75rem',
              marginTop: '0.5rem',
              borderTop: '2px dashed var(--border)',
            }}
          >
            {/* From Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <CalendarIcon size={13} /> FROM DATE
              </label>
              <input
                type="date"
                className="input"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                style={{ minHeight: 40, padding: '0.45rem 0.65rem' }}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
                <CalendarIcon size={13} /> TO DATE
              </label>
              <input
                type="date"
                className="input"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                style={{ minHeight: 40, padding: '0.45rem 0.65rem' }}
              />
            </div>

            {/* Upcoming Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '40px' }}>
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.45rem', 
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem', 
                  fontWeight: 700,
                  color: 'var(--text)', 
                  cursor: 'pointer' 
                }}
              >
                <input
                  type="checkbox"
                  checked={upcomingOnly}
                  onChange={(e) => {
                    setUpcomingOnly(e.target.checked);
                    setPage(1);
                  }}
                  style={{ 
                    width: 18, 
                    height: 18, 
                    cursor: 'pointer', 
                    accentColor: 'var(--blue)',
                  }}
                />
                UPCOMING ONLY
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="grid grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '3rem 1.25rem', 
            margin: '1.5rem 0',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👾</div>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.1 }}>
            No Events Found
          </h2>
          <p 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--muted)', 
              maxWidth: 440, 
              margin: '0 auto 1.25rem',
              fontSize: '0.9rem',
            }}
          >
            No events match your filter criteria. Try choosing another domain or clearing keywords.
          </p>
          <button type="button" onClick={handleResetFilters} className="btn btn-yellow" style={{ minHeight: 44 }}>
            CLEAR ALL FILTERS
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3" style={{ opacity: isRevalidating ? 0.85 : 1, transition: 'opacity 0.15s ease' }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Brutalist Pagination Bar */}
          {meta.totalPages > 1 && (
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginTop: '2.5rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                style={{ minHeight: 44, padding: '0 1rem' }}
                aria-label="Previous Page"
              >
                ← PREV
              </button>

              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  fontSize: '0.85rem',
                  padding: '0.45rem 0.85rem',
                  border: '2px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-btn)',
                  minHeight: 44,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                PAGE <span style={{ color: 'var(--blue)', margin: '0 0.35rem' }}>{meta.page}</span> / {meta.totalPages}
              </div>

              <button
                className="btn btn-outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
                style={{ minHeight: 44, padding: '0 1rem' }}
                aria-label="Next Page"
              >
                NEXT →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
