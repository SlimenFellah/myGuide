/*
 * Author: Slimene Fellah
 * Available for freelance projects
 */
import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog content */}
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ className = '', children, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-xl border max-h-[90vh] overflow-y-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`p-6 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const DialogTitle = ({ className = '', children, ...props }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  );
};

const DialogDescription = ({ className = '', children, ...props }) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
};

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
};