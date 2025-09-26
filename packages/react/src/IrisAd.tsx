import React, { useEffect } from 'react';
import type { IrisAdProps } from '../../shared-types';

/**
 * IrisAd - A headless React component for displaying Iris advertisements
 * 
 * This component is designed to be completely unstyled to allow maximum customization.
 * Style it using CSS classes or CSS-in-JS solutions to match your application's design.
 */
export const IrisAd: React.FC<IrisAdProps> = ({
  ad,
  className,
  textClassName,
  buttonClassName,
  buttonText = 'Learn More',
  onButtonClick,
  show = true,
}) => {
  // Don't render if show is false or ad is null/undefined
  if (!show || !ad) {
    return null;
  }

  useEffect(() => {
    if (!ad.impUrl) return;
    try {
      fetch(ad.impUrl, { method: 'GET', mode: 'no-cors' });
    } catch (_) {
      // ignore
    }
    // fire only once per render of this component instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Default click handler - opens URL in new tab
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const targetUrl = ad.clickUrl;
    if (onButtonClick) {
      onButtonClick(targetUrl ?? '', event);
      return;
    }
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={className} data-iris-ad="container">
      <p className={textClassName} data-iris-ad="text">
        {ad.text}
      </p>
      <button
        type="button"
        className={buttonClassName}
        onClick={handleButtonClick}
        data-iris-ad="button"
      >
        {buttonText}
      </button>
    </div>
  );
};

// Set display name for better debugging
IrisAd.displayName = 'IrisAd';