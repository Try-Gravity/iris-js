# @iris-technologies/api

A TypeScript client library for the Iris advertising API with automatic impression and click URL handling.

## Features

- **Smart Ad Retrieval**: Get contextually relevant advertisements
- **Automatic URL Handling**: Impression and click tracking URLs included
- **Error Handling**: Graceful fallbacks and comprehensive error logging
- **TypeScript Support**: Full type safety with detailed type definitions  
- **Configurable Topics**: Exclude unwanted ad categories
- **Comprehensive Testing**: 21 test cases covering all functionality

## Installation

```bash
npm install @iris-technologies/api
```

## Quick Start

```typescript
import { IrisClient } from '@iris-technologies/api';

// Initialize the client
const client = new IrisClient('your-api-key', ['politics', 'gambling']);

// Get an advertisement with tracking URLs
const ad = await client.getAd({
  messages: [
    { role: 'user', content: 'user looking for weather information' },
    { role: 'assistant', content: 'showing current weather conditions' }
  ],
  user: { uid: 'user-123' },
  device: { ip: '1.2.3.4', country: 'US', ua: 'UA' },
  excludedTopics: ['politics', 'gambling']
});

if (ad) {
  console.log('Ad text:', ad.adText);
  console.log('Impression URL:', ad.impUrl);
  console.log('Click URL:', ad.clickUrl);
  console.log('Publisher payout:', ad.payout);
} else {
  console.log('No ad available');
}
```

## API Reference

### `IrisClient`

#### Constructor

```typescript
new IrisClient(apiKey: string, excludedTopics: string[])
```

**Parameters:**
- `apiKey`: Your Iris API key for authentication
- `excludedTopics`: Array of topic strings to exclude from ads (e.g., `['politics', 'adult', 'gambling']`)

#### Methods

##### `getAd(params: BidParams): Promise<BidResponse | null>`

Retrieves a targeted advertisement with automatic tracking URL handling.

**Parameters (BidParams):**
- `messages`: Array of `{ role: 'user' | 'assistant', content: string }` representing conversation history
- `device` (optional): `{ ip: string; country: string; ua: string; os?: string; ifa?: string }`
- `user` (optional): `{ uid?: string; gender?: 'male' | 'female' | 'other'; age?: string; keywords?: string[] }`
- `excludedTopics` (optional): `string[]` of topics to exclude
- `apiKey` (optional): overrides the client API key for this call

**Returns:**
- `BidResponse | null`: Advertisement object with tracking URLs, or `null` if no ad is available (e.g., 204)

**Example:**
```typescript
const ad = await client.getAd({
  messages: [
    { role: 'user', content: 'How do I learn guitar?' },
    { role: 'assistant', content: 'Here are some tips for learning guitar...' }
  ],
  user: { uid: 'user-456' }
});
```

##### `updateExcludedTopics(excludedTopics: string[]): void`

Updates the list of excluded ad topics.

```typescript
client.updateExcludedTopics(['politics', 'crypto', 'dating']);
```

##### `getExcludedTopics(): string[]`

Returns a copy of the current excluded topics array.

```typescript
const currentExclusions = client.getExcludedTopics();
console.log('Excluding:', currentExclusions);
```

## Types

### `BidParams`

```typescript
type Role = 'user' | 'assistant';
type Gender = 'male' | 'female' | 'other';

interface MessageObject { role: Role; content: string }
interface DeviceObject { ip: string; country: string; ua: string; os?: string; ifa?: string }
interface UserObject { uid?: string; gender?: Gender; age?: string; keywords?: string[] }

interface BidParams {
  apiKey?: string;
  messages: MessageObject[];
  device?: DeviceObject;
  user?: UserObject;
  excludedTopics?: string[];
}
```

### `BidResponse`

```typescript
interface BidResponse {
  adText: string;         // Ad copy to display to users
  impUrl?: string;        // Impression tracking URL (fire when ad is shown)
  clickUrl?: string;      // Click tracking URL (use when ad is clicked)
  payout?: number;        // Publisher payout amount in USD
}
```

### Example Response

```javascript
{
  text: "Learn guitar online with interactive lessons!",
  impUrl: "https://api.iris.tech/impression?id=abc123&price=0.15",
  clickUrl: "https://api.iris.tech/click?id=abc123&redirect=https://guitarlessons.com/signup",
  payout: 0.075
}
```

## Advanced Usage

### Error Handling

The client handles errors gracefully and logs detailed information:

```typescript
// Network errors, HTTP errors, and invalid responses are handled automatically
const ad = await client.getAd({
  messages: [
    { role: 'user', content: 'context' },
    { role: 'assistant', content: 'response' }
  ],
  user: { uid: 'user' }
});

// Always check for null response
if (!ad) {
  console.log('No ad available - could be network error, no inventory, or excluded topic');
}
```

### Dynamic Topic Management

```typescript
const client = new IrisClient('api-key', ['politics']);

// Add more excluded topics based on user preferences
const userPreferences = getUserAdPreferences();
if (userPreferences.excludeGambling) {
  const current = client.getExcludedTopics();
  client.updateExcludedTopics([...current, 'gambling', 'casino']);
}

// Get ad with updated exclusions
const ad = await client.getAd({
  messages: [
    { role: 'user', content: context },
    { role: 'assistant', content: response }
  ],
  user: { uid: userId }
});
```

### Integration with React Component

Perfect pairing with [@iris-technologies/react](https://www.npmjs.com/package/@iris-technologies/react):

```typescript
import { IrisClient } from '@iris-technologies/api';
import { IrisAd } from '@iris-technologies/react';

const client = new IrisClient('your-api-key', ['politics']);

function AdContainer({ userInput, botResponse, userId }) {
  const [ad, setAd] = useState(null);
  
  useEffect(() => {
    client.getAd(userInput, botResponse, userId)
      .then(setAd);
  }, [userInput, botResponse, userId]);
  
  return ad ? <IrisAd ad={ad} /> : null;
}
```

## Configuration

### API Endpoint

The client connects to `https://api.iristech.dev` by default. The endpoint includes:

- Authentication via Bearer token
- 10-second request timeout
- JSON content type headers
- Error logging for debugging

### Excluded Topics

Common topic exclusions:

```typescript
const excludedTopics = [
  'politics',      // Political content
  'adult',         // Adult/NSFW content  
  'gambling',      // Gambling and betting
  'crypto',        // Cryptocurrency
  'dating',        // Dating and relationships
  'religion',      // Religious content
  'health',        // Medical/health claims
  'financial',     // Financial advice
];

const client = new IrisClient('api-key', excludedTopics);
```

## Testing

This package includes comprehensive test coverage (21 test cases):

```bash
# Run tests
npm test

# Run tests in watch mode  
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### What's Tested
- ✅ API response parsing and URL extraction
- ✅ HTTP error handling (404, 500, timeouts)
- ✅ Network error handling
- ✅ Invalid response data handling
- ✅ Excluded topics management
- ✅ Configuration and authentication
- ✅ Edge cases (missing URLs, special characters)

## Error Handling

The client provides comprehensive error handling:

### Network Errors
```typescript
// Automatic retry logic and graceful degradation
const ad = await client.getAd(context, response, userId);
// Returns null on network failure, logs error details
```

### HTTP Errors
```typescript
// Handles 404, 500, timeout errors automatically
// Logs detailed error information for debugging
// Always returns null instead of throwing
```

### Invalid Data
```typescript
// Validates response structure
// Handles missing required fields
// Graceful fallback for malformed responses
```

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

## Publishing

### Version Management
```bash
# Patch version (1.0.0 → 1.0.1) - for bug fixes
npm run version:patch

# Minor version (1.0.0 → 1.1.0) - for new features
npm run version:minor

# Major version (1.0.0 → 2.0.0) - for breaking changes
npm run version:major
```

### Publishing to NPM
```bash
# Test publish (dry run)
npm run publish:dry-run

# Publish patch version
npm run publish:patch

# Publish with beta tag
npm run publish:beta
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import { 
  IrisClient, 
  AdResponse, 
  GetAdParams,
  IrisClientConfig 
} from '@iris-technologies/api';

// All methods and responses are fully typed
const client: IrisClient = new IrisClient('key', []);
const ad: AdResponse | null = await client.getAd('', '', '');
```

## License

ISC