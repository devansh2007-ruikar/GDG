import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, RotateCcw, Sparkles, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';
import { EventCard } from '../components/EventCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useToast } from '../context/ToastContext';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch unique categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/events/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch paginated & filtered events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          upcoming: upcomingOnly ? 'true' : 'false',
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedCategory) params.category = selectedCategory;
        if (fromDate) params.from = fromDate;
        if (toDate) params.to = toDate;

        const res = await api.get('/events', { params });
        if (res.data.success) {
          setEvents(res.data.data);
          if (res.data.meta) {
            setMeta(res.data.meta);
          }
        }
      } catch (err) {
        error(err.response?.data?.error?.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedSearch, selectedCategory, fromDate, toDate, upcomingOnly, page, error]);

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
    <div className="container" style={{ paddingTop: 'clamp(1.5rem, 5vw, 3rem)', paddingBottom: '5rem' }}>
      {/* Neo-Brutalist Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(1.75rem, 4vw, 3rem)' }}>
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: 'var(--yellow)', 
            color: '#000000', 
            border: '2px solid var(--border)', 
            boxShadow: 'var(--shadow-sm)', 
            padding: '0.35rem 0.95rem', 
            borderRadius: 'var(--radius-pill)', 
            fontFamily: 'var(--font-mono)',
            fontWeight: 800, 
            fontSize: '0.75rem', 
            letterSpacing: '0.08em', 
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={14} /> GDG RBU • EVENTS
        </div>

        <h1 
          className="hero-title"
          style={{ 
            letterSpacing: '-0.02em', 
            marginBottom: '0.65rem',
          }}
        >
          DISCOVER EVENTS
        </h1>

        <p 
          style={{ 
            fontFamily: 'var(--font-mono)', 
            color: 'var(--muted)', 
            fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', 
            maxWidth: 680, 
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Explore upcoming workshops, hackathons, and tech talks. Reserve your seat with atomic concurrency safety.
        </p>
      </div>

      {/* Filter Card */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '2rem', 
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          border: '2px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
        }}
      >
        {/* Category Domain Tabs with Horizontal Scroll on Mobile */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div 
            style={{ 
              fontSize: '0.75rem', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 800, 
              color: 'var(--muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              marginBottom: '0.5rem' 
            }}
          >
            SELECT DOMAIN / CATEGORY:
          </div>

          <div className="category-scroll-container">
            {domainTabs.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat || 'all'}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.45rem 0.95rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: isSelected ? 'none' : 'var(--shadow-sm)',
                    transform: isSelected ? 'translate(2px, 2px)' : 'none',
                    backgroundColor: isSelected ? 'var(--blue)' : 'var(--surface)',
                    color: isSelected ? '#000000' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat || 'ALL EVENTS'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input Bar (Always full width) */}
        <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Search size={14} /> SEARCH KEYWORDS
            </label>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input"
                placeholder="Search by title, venue, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 'min(100%, 260px)' }}
              />
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className="btn btn-outline"
                style={{ minHeight: 44, padding: '0 1rem' }}
                aria-label="Toggle Advanced Date Filters"
              >
                <Filter size={16} />
                <span>Filters</span>
                {(fromDate || toDate || !upcomingOnly) && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }} />
                )}
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {hasActiveFilters && (
                <button 
                  type="button" 
                  onClick={handleResetFilters} 
                  className="btn btn-outline"
                  title="Reset all filters"
                  style={{ minHeight: 44 }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Expandable Advanced Filters (Date Range & Upcoming Only) */}
          {showFilters && (
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                alignItems: 'flex-end',
                paddingTop: '0.75rem',
                borderTop: '1px dashed var(--border)',
                marginTop: '0.75rem',
              }}
            >
              {/* From Date */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CalendarIcon size={14} /> FROM DATE
                </label>
                <input
                  type="date"
                  className="input"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* To Date */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CalendarIcon size={14} /> TO DATE
                </label>
                <input
                  type="date"
                  className="input"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Upcoming Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', minHeight: '44px' }}>
                <label 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem', 
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
                      width: 20, 
                      height: 20, 
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
            padding: '3.5rem 1.25rem', 
            margin: '2rem 0',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👾</div>
          <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.1 }}>
            No Events Found
          </h2>
          <p 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--muted)', 
              maxWidth: 480, 
              margin: '0 auto 1.5rem',
              fontSize: '0.95rem',
            }}
          >
            No events match your filter criteria. Try selecting another domain or clearing keywords.
          </p>
          <button type="button" onClick={handleResetFilters} className="btn btn-yellow" style={{ minHeight: 44 }}>
            CLEAR ALL FILTERS
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3">
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
                marginTop: '3rem',
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
