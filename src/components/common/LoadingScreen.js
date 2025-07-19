import React from 'react';
import { Heart, Activity } from 'lucide-react';

const LoadingScreen = ({ message = "Loading your health companion..." }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: 'var(--font-family)'
    }}>
      {/* App Logo/Icon */}
      <div style={{
        width: '120px',
        height: '120px',
        marginBottom: '32px',
        borderRadius: 'var(--border-radius-2xl)',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, var(--secondary-100) 0%, var(--primary-100) 100%)',
          opacity: 0.3
        }} />
        
        {/* Icon */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          color: 'var(--primary-600)'
        }}>
          <Heart size={48} fill="currentColor" />
        </div>
        
        {/* Pulse animation overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}>
          <Activity 
            size={24} 
            style={{
              color: 'var(--primary-600)',
              animation: 'pulse 2s ease-in-out infinite'
            }}
          />
        </div>
      </div>

      {/* App Name */}
      <h1 style={{
        color: 'white',
        fontSize: 'var(--font-size-3xl)',
        fontWeight: '700',
        marginBottom: '8px',
        textAlign: 'center',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        Back Pain Manager
      </h1>

      {/* Tagline */}
      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 'var(--font-size-lg)',
        fontWeight: '400',
        marginBottom: '48px',
        textAlign: 'center',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}>
        Your Health Companion
      </p>

      {/* Loading Message */}
      <p style={{
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 'var(--font-size-base)',
        fontWeight: '500',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        {message}
      </p>

      {/* Loading Spinner */}
      <div style={{
        position: 'relative',
        width: '60px',
        height: '60px'
      }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute',
          width: '60px',
          height: '60px',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite'
        }} />
        
        {/* Inner ring */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          width: '44px',
          height: '44px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderBottom: '2px solid rgba(255, 255, 255, 0.8)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite reverse'
        }} />
      </div>

      {/* Progress dots */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '32px'
      }}>
        {[0, 1, 2].map(index => (
          <div
            key={index}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              animation: `bounce 1.4s ease-in-out infinite both`,
              animationDelay: `${index * 0.16}s`
            }}
          />
        ))}
      </div>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;