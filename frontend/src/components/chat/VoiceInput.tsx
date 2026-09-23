import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setError(`Mic error: ${event.error}`);
        setIsRecording(false);
        setTimeout(() => setError(null), 3000);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (disabled) return;
    if (!recognitionRef.current) {
      setError('Voice recognition not supported in this browser.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording', err);
        setIsRecording(false);
      }
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: isRecording
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
            : 'rgba(255, 255, 255, 0.08)',
          color: isRecording ? '#ffffff' : '#94a3b8',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isRecording ? '0 0 15px rgba(239, 68, 68, 0.6)' : 'none'
        }}
        title={isRecording ? 'Click to stop recording' : 'Speak your query'}
      >
        {isRecording ? <MicOff size={18} className="recording-pulse" /> : <Mic size={18} />}
      </button>

      {error && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: '0',
          marginBottom: '8px',
          padding: '6px 12px',
          borderRadius: '6px',
          background: '#ef4444',
          color: '#fff',
          fontSize: '0.72rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 50
        }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
};
