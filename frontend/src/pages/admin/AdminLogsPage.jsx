import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, RefreshCw, AlertTriangle, Info, Search, ShieldAlert, Cpu } from 'lucide-react';
import api from '../../lib/axios';

const AdminLogsPage = () => {
  const [logType, setLogType] = useState('combined');
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-logs', logType, limit],
    queryFn: async () => {
      const res = await api.get(`/admin/logs?type=${logType}&limit=${limit}`);
      return res.data.data;
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds for live tailing
  });

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'error': return 'var(--accent-red)';
      case 'warn': return 'var(--accent-amber)';
      case 'info': return 'var(--accent-blue)';
      case 'debug': return 'var(--accent-purple)';
      default: return 'var(--text-secondary)';
    }
  };

  const filteredLogs = (logs || []).filter(log => 
    !search || 
    log.message?.toLowerCase().includes(search.toLowerCase()) || 
    log.level?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal color="var(--accent-blue)" /> System Logs
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Live streaming diagnostic logs and server events.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
            <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text" 
              placeholder="Grep logs..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', width: 140 }}
            />
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="btn btn-outline" 
            style={{ padding: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={isFetching ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button 
            onClick={() => setLogType('combined')}
            style={{ 
              padding: '0.6rem 1.25rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500,
              background: logType === 'combined' ? 'var(--accent-blue)' : 'transparent',
              color: logType === 'combined' ? '#fff' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <Info size={16} /> All Events
          </button>
          <button 
            onClick={() => setLogType('error')}
            style={{ 
              padding: '0.6rem 1.25rem', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 500,
              background: logType === 'error' ? 'var(--accent-red)' : 'transparent',
              color: logType === 'error' ? '#fff' : 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s'
            }}
          >
            <AlertTriangle size={16} /> Exceptions Only
          </button>
        </div>

        <select 
          value={limit} 
          onChange={(e) => setLimit(Number(e.target.value))}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '0 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', outline: 'none' }}
        >
          <option value={50}>Last 50 lines</option>
          <option value={100}>Last 100 lines</option>
          <option value={200}>Last 200 lines</option>
          <option value={500}>Last 500 lines</option>
        </select>
      </div>

      {/* Terminal View */}
      <div style={{ 
        background: '#0d0d12', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        height: '70vh'
      }}>
        {/* Fake Window Header */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-red)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-amber)' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent-green)' }} />
          <p style={{ marginLeft: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
            robomart@server:~/{logType === 'error' ? 'error.log' : 'combined.log'} — tail -n {limit}
          </p>
        </div>

        {/* Scrollable Output */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', lineHeight: 1.6 }}>
          {isLoading ? (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <Cpu size={32} className="pulse" />
             </div>
          ) : filteredLogs.length === 0 ? (
             <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <ShieldAlert size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No log patterns detected.</p>
             </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredLogs.map((log, i) => (
                <motion.div 
                  key={`${log.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', gap: '1rem', marginBottom: '0.25rem', borderBottom: '1px dashed rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', width: 150 }}>
                    {log.timestamp ? log.timestamp.split(' ')[1] || log.timestamp : 'Unknown'}
                  </span>
                  <span style={{ color: getLevelColor(log.level), fontWeight: 700, width: 60, textTransform: 'uppercase' }}>
                    [{log.level || 'SYS'}]
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.85)', flex: 1, wordBreak: 'break-all' }}>
                    {log.message}
                    {log.stack && (
                      <pre style={{ margin: '0.5rem 0 0 0', padding: '1rem', background: 'rgba(255,0,0,0.05)', borderRadius: 4, color: 'var(--accent-red)', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                        {log.stack}
                      </pre>
                    )}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AdminLogsPage;
