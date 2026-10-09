import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, RotateCcw, Sparkles } from 'lucide-react';
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

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem' }}>
      {/* Neo-Brutalist Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
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
            fontSize: '0.785rem', 
            letterSpacing: '0.08em', 
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={14} /> GDG RBU • EVENTS
        </div>

        <h1 
          className="hero-title"
          style={{ 
            fontSize: '3.2rem', 
            fontWeight: 700, 
            letterSpacing: '-0.02em', 
            marginBottom: '0.75rem',
            lineHeight: 1.1,
          }}
        >
          DISCOVER EVENTS
        </h1>

        <p 
          style={{ 
            fontFamily: 'var(--font-mono)', 
            color: 'var(--muted)', 
            fontSize: '1.05rem', 
            maxWidth: 680, 
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Explore upcoming workshops, hackathons, and tech talks. Reserve your seat with atomic concurrency safety.
        </p>
      </div>

      {/* Filter Bar with Neo-Brutalist Domain Tabs */}
      <div 
        className="card" 
        style={{ 
          marginBottom: '2.5rem', 
          padding: '1.5rem',
          border: '2px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 0,
        }}
      >
        {/* Category Domain Tabs */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div 
            style={{ 
              fontSize: '0.785rem', 
              fontFamily: 'var(--font-mono)', 
              fontWeight: 700, 
              color: 'var(--muted)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              marginBottom: '0.65rem' 
            }}
          >
            SELECT DOMAIN / CATEGORY:
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.45rem 1rem',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: isSelected ? 'none' : '3px 3px 0 var(--border)',
                    transform: isSelected ? 'translate(2px, 2px)' : 'none',
                    backgroundColor: isSelected ? 'var(--blue)' : 'var(--surface)',
                    color: isSelected ? '#000000' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat || 'ALL EVENTS'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Date Controls Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1rem', 
            alignItems: 'flex-end',
            borderTop: '2px solid var(--border)',
            paddingTop: '1.25rem',
          }}
        >
          {/* Keyword Search */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Search size={14} /> SEARCH KEYWORDS
            </label>
            <input
              type="text"
              className="input"
              placeholder="Search by title, venue, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

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

          {/* Upcoming Toggle & Reset Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', minHeight: '44px' }}>
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
                  width: 18, 
                  height: 18, 
                  cursor: 'pointer', 
                  accentColor: 'var(--blue)',
                }}
              />
              UPCOMING ONLY
            </label>

            {(search || selectedCategory || fromDate || toDate || !upcomingOnly) && (
              <button 
                type="button" 
                onClick={handleResetFilters} 
                className="btn btn-outline btn-sm"
                title="Reset all filters"
              >
                <RotateCcw size={14} /> Reset
              </button>
            )}
          </div>
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
            padding: '4rem 1.5rem', 
            margin: '2rem 0',
            border: '2px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 0,
          }}
        >
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👾</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.1 }}>
            No Events Found
          </h2>
          <p 
            style={{ 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--muted)', 
              maxWidth: 480, 
              margin: '0 auto 1.5rem',
            }}
          >
            No events match your current filter criteria. Try selecting another domain or clearing keywords.
          </p>
          <button type="button" onClick={handleResetFilters} className="btn btn-yellow">
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
                gap: '1rem', 
                marginTop: '3.5rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                ← PREVIOUS
              </button>

              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 700, 
                  fontSize: '0.9rem',
                  padding: '0.45rem 1rem',
                  border: '2px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  boxShadow: 'var(--shadow-sm)',
                  borderRadius: 'var(--radius-btn)',
                }}
              >
                PAGE <span style={{ color: 'var(--blue)' }}>{meta.page}</span> OF {meta.totalPages} ({meta.total} TOTAL)
              </div>

              <button
                className="btn btn-outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
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
