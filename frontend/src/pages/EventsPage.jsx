import React, { useState, useEffect } from 'react';
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

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
          Explore GDG Community Events
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          Connect with industry experts, attend hands-on workshops, and build the future with Google technologies.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Search Keywords</label>
            <input
              type="text"
              className="input"
              placeholder="Search title, venue, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">From Date</label>
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

          <div>
            <label className="form-label">To Date</label>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '42px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(e) => {
                  setUpcomingOnly(e.target.checked);
                  setPage(1);
                }}
                style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              Future only
            </label>

            {(search || selectedCategory || fromDate || toDate || !upcomingOnly) && (
              <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', margin: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No events found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 450, margin: '0 auto 1.5rem auto', fontSize: '0.925rem' }}>
            We couldn't find any events matching your selected criteria. Try resetting filters or searching for different keywords.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Page <strong style={{ color: 'var(--text-main)' }}>{meta.page}</strong> of{' '}
                <strong style={{ color: 'var(--text-main)' }}>{meta.totalPages}</strong> ({meta.total} total)
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
