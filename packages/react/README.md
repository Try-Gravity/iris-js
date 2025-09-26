# @iris-technologies/react

React components for displaying Iris advertisements with automatic impression tracking and click URL handling.

## Features

- **Automatic Impression Tracking**: Fires impression URLs when ads are rendered
- **Smart Click Handling**: Uses dedicated click URLs for accurate tracking
- **Fully Headless**: Zero default styling for maximum customization
- **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- **Accessibility**: Keyboard navigation and semantic HTML
- **Comprehensive Testing**: 27 test cases covering all functionality

## Installation

```bash
npm install @iris-technologies/react
```

## Quick Start

```tsx
import React from 'react';
import { IrisAd } from '@iris-technologies/react';
import type { AdResponse } from '@iris-technologies/react';

function MyApp() {
  const ad: AdResponse = {
    text: "Discover amazing products that match your interests!",
    impUrl: "https://api.iris.tech/impression/abc123",  // Automatically fired on render
    clickUrl: "https://api.iris.tech/click/abc123",     // Used for click tracking
    payout: 0.25
  };

  return (
    <IrisAd
      ad={ad}
      className="my-ad-container"
      textClassName="my-ad-text"
      buttonClassName="my-ad-button"
      buttonText="Shop Now"
    />
  );
}
```

## How It Works

### Automatic Impression Tracking
When the `IrisAd` component renders, it automatically fires the impression URL (if provided) using `fetch()` with `no-cors` mode. This happens only once per component instance.

```tsx
// This will automatically fire the impression URL on mount
<IrisAd ad={adWithImpressionUrl} />
```

### Smart Click Handling
When users click the ad button:
1. If `clickUrl` is provided, it's used for tracking and navigation
2. If `clickUrl` is missing, no navigation occurs unless you provide a custom `onButtonClick`
3. Opens in a new tab by default (`_blank` with `noopener,noreferrer`)

## API Reference

### `IrisAd` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ad` | `AdResponse` | - | **Required.** The advertisement data to display |
| `className` | `string` | - | CSS class for the container element |
| `textClassName` | `string` | - | CSS class for the text element |
| `buttonClassName` | `string` | - | CSS class for the button element |
| `buttonText` | `string` | `"Learn More"` | Custom button text |
| `onButtonClick` | `(url: string, event: MouseEvent) => void` | - | Custom click handler. If provided, overrides default behavior |
| `show` | `boolean` | `true` | Whether to render the component |

### `AdResponse` Type

```tsx
interface AdResponse {
  text: string;           // Ad copy to display
  impUrl?: string;        // Impression tracking URL (fired automatically)
  clickUrl?: string;      // Click tracking URL (used on button click)
  payout?: number;        // Publisher payout amount
}
```

## Styling Examples

### Basic CSS Classes

```css
.my-ad-container {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  max-width: 400px;
}

.my-ad-text {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.my-ad-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.my-ad-button:hover {
  background: #0056b3;
}
```

### Tailwind CSS

```tsx
<IrisAd
  ad={ad}
  className="p-4 bg-white rounded-lg shadow-md border border-gray-200 max-w-sm"
  textClassName="text-gray-800 text-sm mb-3 leading-relaxed"
  buttonClassName="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
  buttonText="Learn More"
/>
```

### Styled Components

```tsx
import styled from 'styled-components';

const StyledContainer = styled.div`
  padding: 16px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StyledText = styled.p`
  color: #333;
  margin-bottom: 12px;
`;

const StyledButton = styled.button`
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
`;

<IrisAd
  ad={ad}
  className={StyledContainer}
  textClassName={StyledText}
  buttonClassName={StyledButton}
/>
```

## Advanced Usage

### Custom Click Handler

Override the default click behavior for custom analytics or navigation:

```tsx
const handleAdClick = (url: string, event: React.MouseEvent) => {
  // Track click event
  analytics.track('ad_clicked', { url });
  
  // Custom navigation logic
  if (event.ctrlKey || event.metaKey) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
};

<IrisAd
  ad={ad}
  onButtonClick={handleAdClick}
/>
```

### Conditional Rendering

```tsx
<IrisAd
  ad={ad}
  show={user.allowsAds && ad !== null}
  className="conditional-ad"
/>
```

### Error Handling

The component gracefully handles missing or invalid URLs:

```tsx
// Still renders even if impression URL is missing
const adWithoutImpression = {
  text: "Great product!",
  // impUrl missing - component works fine
};

<IrisAd ad={adWithoutImpression} />
```

## Data Attributes

For additional styling hooks, the component includes data attributes:

- `data-iris-ad="container"` - On the main container
- `data-iris-ad="text"` - On the text element  
- `data-iris-ad="button"` - On the button element

```css
[data-iris-ad="container"] {
  /* Container styles */
}

[data-iris-ad="text"] {
  /* Text styles */
}

[data-iris-ad="button"] {
  /* Button styles */
}
```

## Accessibility

The component follows accessibility best practices:

- Uses semantic HTML elements (`<button>`, `<p>`)
- Button is fully keyboard accessible
- Supports screen readers
- Proper focus management

## Testing

This package includes comprehensive test coverage (27 test cases):

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### What's Tested
- ✅ Impression URL firing on component mount
- ✅ Click URL handling and fallback behavior
- ✅ Custom click handlers
- ✅ Conditional rendering (`show` prop, null ads)
- ✅ Component structure and data attributes
- ✅ Error handling (missing URLs, network errors)
- ✅ Accessibility features
- ✅ Edge cases (empty strings, long URLs)

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development  
npm run dev

# Clean build artifacts
npm run clean

# Run tests
npm test
```

## Peer Dependencies

This package requires React 18+ as a peer dependency:

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

## TypeScript

The component is fully typed with TypeScript. Import types as needed:

```tsx
import type { AdResponse, IrisAdProps } from '@iris-technologies/react';
```

## Integration with Iris API

Use with the [@iris-technologies/api](https://www.npmjs.com/package/@iris-technologies/api) client:

```tsx
import { IrisClient } from '@iris-technologies/api';
import { IrisAd } from '@iris-technologies/react';

const client = new IrisClient('your-api-key', []);

// Get ad from API
const ad = await client.getAd(
  'user input context',
  'assistant response', 
  'user-123'
);

// Render with automatic tracking
{ad && <IrisAd ad={ad} />}
```

## License

ISC