# Frontend - Voice Agent UI

Giao diện React cho ứng dụng trò chuyện giọng nói với AI.

## Tính năng

- Real-time audio recording và streaming
- WebSocket connection đến Backend
- Visual waveform display
- Transcript display (partial + committed)
- Voice Activity Detection (VAD)
- Responsive UI design
- Audio playback cho AI responses

## Công nghệ sử dụng

- **React 19** - UI framework
- **Vite** - Build tool và dev server
- **Web Audio API** - Audio processing
- **WebSocket** - Real-time communication
- **Vitest** - Testing framework

## Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn
- Trình duyệt hỗ trợ Web Audio API (Chrome, Edge, Firefox)
- Microphone access

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình environment

```bash
# File .env đã có sẵn, chỉnh sửa nếu cần
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/audio-stream
```

### 3. Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Scripts

```bash
# Development server với hot reload
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests với watch mode
npm run test:watch

# Lint code
npm run lint
```

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/              # UI components
│   │   ├── Microphone.jsx      # Nút ghi âm với status indicator
│   │   ├── Microphone.css
│   │   ├── Transcript.jsx      # Hiển thị transcript
│   │   ├── Transcript.css
│   │   ├── Waveform.jsx        # Hiển thị waveform
│   │   ├── Waveform.css
│   │   └── LiveWaveform.jsx    # Real-time waveform
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useScribe.js        # WebSocket + Audio processing
│   │
│   ├── pages/                   # Page components
│   │   └── RealtimeTranscription.jsx
│   │
│   ├── config/                  # Configuration
│   ├── utils/                   # Utility functions
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
│
├── public/                      # Static assets
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── package.json
└── .env                        # Environment variables
```

## Components

### Microphone Component

Button component với status indicator cho recording.

```jsx
<Microphone
  isActive={isRecording}
  isConnecting={isConnecting}
  onStart={handleStart}
  onStop={handleStop}
  disabled={false}
/>
```

Props:
- `isActive` - Trạng thái đang ghi âm
- `isConnecting` - Trạng thái đang kết nối
- `onStart` - Callback khi bắt đầu
- `onStop` - Callback khi dừng
- `disabled` - Disable button

### Transcript Component

Hiển thị transcript với partial và committed text.

```jsx
<Transcript
  partialText="Đang nhận diện..."
  committedText="Xin chào"
/>
```

### Waveform Component

Hiển thị waveform visualization cho audio.

```jsx
<Waveform
  audioData={audioData}
  isActive={isRecording}
/>
```

## Custom Hooks

### useScribe Hook

Hook chính để xử lý WebSocket connection và audio streaming.

```javascript
const { status, connect, disconnect } = useScribe({
  backendUrl: 'ws://localhost:8000/ws/audio-stream',
  commitStrategy: CommitStrategy.VAD,
  vadThreshold: 0.01,
  vadSilenceThresholdSecs: 1.5,
  onPartialTranscript: (data) => {
    console.log('Partial:', data.text);
  },
  onCommittedTranscript: (data) => {
    console.log('Committed:', data.text);
  },
  onError: (error) => {
    console.error('Error:', error);
  }
});
```

Status values:
- `disconnected` - Chưa kết nối
- `connecting` - Đang kết nối
- `connected` - Đã kết nối, sẵn sàng
- `transcribing` - Đang nhận diện giọng nói

## Audio Processing

Frontend sử dụng Web Audio API để:

1. Capture audio từ microphone
2. Resample về 16kHz (yêu cầu của ElevenLabs)
3. Convert sang PCM 16-bit format
4. Encode base64
5. Stream qua WebSocket đến Backend

### Voice Activity Detection (VAD)

VAD được implement ở frontend để:
- Detect khi người dùng bắt đầu nói
- Detect khi người dùng dừng nói (silence)
- Tự động finalize transcript sau khoảng lặng

Cấu hình VAD:
```javascript
vadThreshold: 0.01,              // RMS threshold (0.0-1.0)
vadSilenceThresholdSecs: 1.5     // Silence duration (seconds)
```

## WebSocket Messages

### Gửi đến Backend

**Audio Chunk:**
```javascript
{
  type: 'audio',
  data: 'base64_encoded_pcm',
  timestamp: Date.now()
}
```

**Speech End:**
```javascript
{
  type: 'speech_end',
  timestamp: Date.now()
}
```

### Nhận từ Backend

**Partial Transcript:**
```javascript
{
  type: 'transcript_partial',
  text: 'Đang nhận diện...',
  timestamp: 1234567890.123
}
```

**Committed Transcript:**
```javascript
{
  type: 'transcript_committed',
  text: 'Xin chào',
  timestamp: 1234567890.123,
  is_final: true
}
```

**Status Update:**
```javascript
{
  type: 'status',
  state: 'listening',
  message: 'Listening to audio'
}
```

## Styling

Frontend sử dụng CSS modules và custom CSS cho styling:

- Modern, clean design
- Responsive layout
- Smooth animations
- Visual feedback cho user actions
- Accessibility compliant

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

Tests bao gồm:
- Component rendering tests
- Hook behavior tests
- WebSocket integration tests
- Audio processing tests

## Troubleshooting

### Microphone không hoạt động
- Kiểm tra browser permissions
- Thử trình duyệt khác (Chrome/Edge khuyến nghị)
- Kiểm tra microphone trong system settings

### WebSocket không kết nối
- Verify Backend đang chạy tại port 8000
- Kiểm tra `VITE_BACKEND_WS_URL` trong `.env`
- Check browser console cho errors

### Audio quality kém
- Điều chỉnh `vadThreshold` thấp hơn
- Kiểm tra microphone quality
- Giảm background noise

### Transcript không chính xác
- Nói rõ ràng hơn
- Giảm background noise
- Kiểm tra ngôn ngữ setting trong Backend

## Performance Optimization

- Audio chunks được buffer và gửi hiệu quả
- WebSocket reconnection tự động
- Lazy loading cho components
- Memoization cho expensive calculations
- Debouncing cho user inputs

## Browser Support

- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ⚠️ (limited Web Audio API support)

## Development Tips

### Hot Module Replacement (HMR)

Vite cung cấp HMR tự động. Code changes sẽ reflect ngay lập tức.

### Debug Mode

Bật debug logs trong console:
```javascript
// Trong useScribe.js
console.log('📥 Received message:', message);
console.log('🎚️ Audio RMS:', rms);
```

### Environment Variables

Tất cả env vars phải prefix với `VITE_`:
```bash
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/audio-stream
VITE_DEBUG_MODE=true
```

## Production Build

```bash
# Build
npm run build

# Preview
npm run preview
```

Build output trong `dist/` folder. Deploy lên:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

Nhớ cập nhật `VITE_BACKEND_WS_URL` trong `.env.production`.

## Security

- WebSocket connection qua wss:// trong production
- No sensitive data trong frontend code
- CORS được handle bởi Backend
- Input validation cho user data

## License

MIT
