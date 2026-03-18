import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => (
  <footer style={{ background:'var(--bg-secondary)', borderTop:'1px solid var(--border)', marginTop:'auto', paddingBlock:'3rem 2rem' }}>
    <div className="container">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'2rem', marginBottom:'2rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem' }}>
            <div style={{ width:32, height:32, background:'linear-gradient(135deg, var(--accent-blue), var(--accent-amber))', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={16} color="#0A0A0F" fill="#0A0A0F" />
            </div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.2rem' }}>
              <span className="gradient-text">Robo</span><span style={{ color:'var(--text-primary)' }}>Mart</span>
            </span>
          </div>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', lineHeight:1.7, maxWidth:260 }}>
            Your go-to source for premium robotic and electronic components. Build the future, one component at a time.
          </p>
        </div>
        {[
          { title:'Products', links:[['All Products','/products'],['Microcontrollers','/products?category=microcontrollers'],['Sensors','/products?category=sensors'],['Motors','/products?category=motors'],['Featured','/products?featured=true']] },
          { title:'Account', links:[['My Orders','/orders'],['Profile','/profile'],['Wishlist','/wishlist'],['Support','/support']] },
          { title:'Company', links:[['About Us','/about'],['Blog','/blog'],['Careers','/careers'],['Contact','/contact']] },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, marginBottom:'1rem', fontSize:'1rem', color:'var(--text-primary)' }}>{title}</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to} style={{ color:'var(--text-muted)', textDecoration:'none', fontSize:'0.9rem', transition:'var(--transition)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="pcb-line" style={{ marginBottom:'1.5rem' }} />

      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
        <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>
          © {new Date().getFullYear()} RoboMart. All rights reserved.
        </p>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          {[
            { icon:<Github size={18}/>, href:'#' },
            { icon:<Twitter size={18}/>, href:'#' },
            { icon:<Linkedin size={18}/>, href:'#' },
            { icon:<Mail size={18}/>, href:'#' },
          ].map(({ icon, href }, i) => (
            <a key={i} href={href} style={{ color:'var(--text-muted)', transition:'var(--transition)', display:'flex' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >{icon}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
