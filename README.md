# Skillora React Example

A React application demonstrating how to integrate with the Skillora AI interview platform. This example showcases authentication, custom interview creation, and seamless iframe embedding of Skillora's interview interface.

## 🚀 Features

- **AI-Powered Interviews**: Interactive AI interviews embedded via iframe
- **Custom Interview Creation**: Create tailored interviews with specific focus areas, difficulty levels, and company targeting
- **Interview History**: View past interviews and performance statistics
- **Secure Authentication**: Token-based authentication with the Skillora platform
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Communication**: PostMessage API integration for secure iframe communication

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0 with Vite
- **Styling**: Tailwind CSS 4.1.8
- **Routing**: React Router DOM 6.30.1
- **Build Tool**: Vite 6.3.5
- **Code Quality**: ESLint with React-specific rules

## 📁 Project Structure

```
src/
├── components/
│   └── Header.jsx              # Navigation header component
├── pages/
│   ├── Welcome.jsx             # Landing page
│   ├── AIInterview.jsx         # AI interview interface
│   ├── CreateYourOwn.jsx       # Custom interview creation
│   └── MyInterview.jsx         # Interview history and stats
├── App.jsx                     # Main application component
└── main.jsx                    # Application entry point

lib/
├── context/
│   ├── AuthContext.jsx         # Mock authentication provider
│   └── SkilloraAuthContext.jsx # Skillora API integration
└── hooks/
    └── use-skillora-iframe.js  # Custom hook for iframe management
```

## 🔧 Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Skillora API key

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd skillora-react-example
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   VITE_SKILLORA_API_KEY=your_skillora_api_key_here
   ```

   > ⚠️ **Security Note**: In production, never expose API keys in client-side code. Use a backend service to handle API communications.

4. **Update Organization ID**
   Replace `ORGANIZATION_ID` in the following files with your actual organization ID:

   - `src/pages/AIInterview.jsx`
   - `src/pages/MyInterview.jsx`

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Authentication Flow

The application uses a two-tier authentication system:

### 1. Mock User Authentication (`AuthContext`)

- Provides a mock user with predefined credentials
- In production, replace with your actual authentication system

### 2. Skillora Platform Authentication (`SkilloraAuthContext`)

- Generates secure tokens for Skillora API access
- Handles token expiration and renewal
- Manages user data synchronization

```javascript
// Example authentication flow
const { user } = useAuth(); // Get current user
const { generateSkilloraAuthToken } = useSkilloraAuth();

// Generate Skillora token
const response = await generateSkilloraAuthToken({
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
});
```

## 📋 API Integration

### Key API Endpoints

1. **User Authentication**

   - `POST /v1/partners/auth/users/`
   - Authenticates users and returns access tokens

2. **Custom Interview Creation**

   - `POST /v1/partners/mock-interviews/`
   - Creates custom interviews with specified parameters

### Example: Creating a Custom Interview

```javascript
const interviewDetails = {
  email: user.email,
  focus_area: 'SKILL', // Options: SKILL, JOB, BEHAVIORAL
  topic: 'React State Management',
  difficulty_level: 2, // 1: Easy, 2: Medium, 3: Hard
  target_company: 'Meta',
  additional_customization: 'Please focus on redux and context API.',
  number_of_questions: 5,
};

const response = await createCustomInterview(interviewDetails);
```

## 🖼️ Iframe Integration

The application uses secure iframe embedding with sophisticated communication patterns:

### Security Features

- **Domain Whitelisting**: Only allowed domains can communicate with iframes
- **Token-based Authentication**: Secure token exchange via PostMessage API
- **Automatic Token Renewal**: Handles expired tokens transparently

### Communication Flow

1. Iframe loads and requests authentication
2. Parent window sends encrypted token via PostMessage
3. Iframe authenticates and displays content
4. Token expiration triggers automatic renewal
5. Iframe can request navigation to new pages within the same window

### Navigation Handling

The iframe can trigger navigation to different Skillora pages using PostMessage. The application handles the `SHOW_MOCK_INTERVIEW_ANALYSIS` message type to seamlessly transition to interview analysis:

```javascript
// From within the iframe
window.parent.postMessage(
  {
    type: 'SHOW_MOCK_INTERVIEW_ANALYSIS',
    mock_interview_id: 'interview_id_here',
  },
  '*'
);
```

When this message is received, the application:

1. **Validates the message**: Checks that the message comes from an allowed domain
2. **Extracts the interview ID**: Retrieves the `mock_interview_id` from the message payload
3. **Updates the iframe URL**: Sets the new URL to `https://app.skillora.ai/embed/my-interviews/{mock_interview_id}`
4. **Maintains authentication**: Preserves the existing authentication token for seamless access

This creates a smooth transition within the same iframe container, allowing users to view their interview analysis without losing their session or opening new tabs.

### Implementation Details

The navigation handling is implemented in the `CreateYourOwn.jsx` component using the browser's PostMessage API with several security and reliability features:

#### 1. Domain Security Validation

```javascript
const ALLOWED_DOMAINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://skillora.ai',
  'https://app.skillora.ai',
];

// Only process messages from trusted domains
if (!ALLOWED_DOMAINS.some((domain) => event.origin.startsWith(domain))) {
  console.log('Message from non-allowed domain, ignoring');
  return;
}
```

#### 2. Message Type Handling

The component listens for multiple message types from the iframe:

- **`TOKEN_EXPIRED`**: Automatically generates and sends new authentication tokens
- **`SHOW_MOCK_INTERVIEW_ANALYSIS`**: Handles navigation to interview analysis pages

```javascript
// Interview analysis navigation handler
if (event.data?.type === 'SHOW_MOCK_INTERVIEW_ANALYSIS') {
  const { mock_interview_id } = event.data;
  if (mock_interview_id) {
    const skilloraUrl = `https://app.skillora.ai/embed/my-interviews/${mock_interview_id}`;
    setInterviewUrl(skilloraUrl);
  } else {
    console.warn(
      'SHOW_MOCK_INTERVIEW_ANALYSIS message received but no interview_id provided'
    );
  }
}
```

#### 3. URL Construction and State Management

- Extracts the `mock_interview_id` from the message payload
- Constructs the full Skillora URL using the interview ID: `https://app.skillora.ai/embed/my-interviews/{mock_interview_id}`
- Updates the component's state to trigger iframe URL change
- Maintains authentication context for seamless access

#### 4. Event Listener Management

The component properly manages event listeners to prevent memory leaks:

```javascript
useEffect(() => {
  const handleMessage = async (event) => {
    // Message handling logic
  };

  window.addEventListener('message', handleMessage);

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, [user, isTokenLoading, generateSkilloraAuthToken]);
```

#### 5. Error Handling and Logging

- Comprehensive logging of all received messages for debugging
- Graceful handling of malformed messages
- Origin validation logging for security monitoring

This implementation ensures secure, reliable communication between the parent application and embedded Skillora iframes while maintaining a seamless user experience.

### Example Component Usage

The interview analysis navigation is implemented directly in the `CreateYourOwn.jsx` component:

```javascript
// Component state for managing iframe URL
const [interviewUrl, setInterviewUrl] = useState('');

// Message handler for iframe communication
useEffect(() => {
  const handleMessage = async (event) => {
    if (event.data?.type === 'SHOW_MOCK_INTERVIEW_ANALYSIS') {
      const { mock_interview_id } = event.data;
      if (mock_interview_id) {
        const skilloraUrl = `https://app.skillora.ai/embed/my-interviews/${mock_interview_id}`;
        setInterviewUrl(skilloraUrl);
      }
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## 📱 Pages and Features

### 1. Welcome Page (`/`)

- Landing page with navigation options
- Simple introduction to available features

### 2. AI Interview (`/ai-interview`)

- Embeds Skillora's AI interview platform
- Real-time AI-powered interview experience
- Camera and microphone access for realistic interviews

### 3. Custom Interview Creation (`/custom-create-interview`)

- Interactive form for creating tailored interviews
- Configurable parameters:
  - Focus area (Skill, Job, Behavioral)
  - Specific topics
  - Difficulty levels
  - Target companies
  - Custom requirements

### 4. My Interviews (`/my-interview`)

- Interview history and statistics
- Performance analytics
- Progress tracking

## 🔧 Configuration Options

### Iframe Permissions

The embedded iframes require specific permissions for optimal functionality:

```javascript
allow = 'camera; microphone; display-capture; autoplay; clipboard-write';
sandbox =
  'allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals';
```

### Allowed Domains

Configure trusted domains for iframe communication:

```javascript
const ALLOWED_DOMAINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://skillora.ai',
  'https://app.skillora.ai',
];
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint code analysis

## 🔒 Security Considerations

1. **API Key Management**: Never expose API keys in client-side code
2. **Domain Validation**: Always validate iframe message origins
3. **Token Security**: Implement proper token storage and rotation
4. **HTTPS**: Use HTTPS in production for secure communication

## 🛡️ Error Handling

The application implements comprehensive error handling:

- **Network Failures**: Graceful degradation with user-friendly messages
- **Authentication Errors**: Automatic retry mechanisms
- **Token Expiration**: Transparent token renewal
- **Iframe Loading**: Loading states and fallback content

## 🔄 State Management

### Context Providers

- **AuthContext**: Manages user authentication state
- **SkilloraAuthContext**: Handles Skillora-specific authentication and API calls

### Custom Hooks

- **useSkilloraIframe**: Manages iframe lifecycle, authentication, and communication

## 📊 Performance Optimizations

- **Lazy Loading**: Components load on demand
- **Token Caching**: Reduces unnecessary API calls
- **Iframe Optimization**: Efficient loading and communication patterns
- **Error Boundaries**: Prevents cascading failures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is provided as an example integration. Please refer to Skillora's terms of service for usage guidelines.

## 📞 Support

For questions about Skillora integration:

- Visit [Skillora Documentation](https://skillora.ai)
- Contact Skillora Support

For technical issues with this example:

- Open an issue in this repository
- Review the console logs for detailed error information

---

**Note**: This is an example implementation. Adapt the authentication, error handling, and security measures according to your production requirements.
