import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Square,
  Activity,
  Settings,
  Download,
  Share2
} from 'lucide-react';

interface VoiceInterfaceProps {
  onTranscript: (text: string) => void;
  onVoiceToggle: (enabled: boolean) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

interface VoiceMessage {
  id: string;
  audioBlob: Blob;
  duration: number;
  timestamp: Date;
  transcript?: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onTranscript,
  onVoiceToggle,
  isRecording,
  setIsRecording,
  voiceEnabled,
  setVoiceEnabled
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    voice: 'Parth',
    speed: 1.0,
    pitch: 1.0
  });

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = voiceSettings.language;
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
          console.log('Speech recognition started');
        };
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(prev => prev + ' ' + finalTranscript);
            onTranscript(finalTranscript);
          }
          
          setInterimTranscript(interimTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          console.log('Speech recognition ended');
        };
      }
    }
  }, [voiceSettings.language, onTranscript]);

  // Initialize audio context for voice level monitoring
  useEffect(() => {
    if (isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
          
          analyserRef.current.fftSize = 256;
          microphoneRef.current.connect(analyserRef.current);
          
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const updateAudioLevel = () => {
            if (analyserRef.current && isRecording) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setAudioLevel(average / 255);
              requestAnimationFrame(updateAudioLevel);
            }
          };
          
          updateAudioLevel();
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    } else {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioLevel(0);
    }
  }, [isRecording]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const voiceMessage: VoiceMessage = {
          id: `voice_${Date.now()}`,
          audioBlob,
          duration: Date.now() - recordingStartTime,
          timestamp: new Date()
        };
        
        setVoiceMessages(prev => [...prev, voiceMessage]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setRecordingStartTime(Date.now());
      setIsRecording(true);
      console.log('Voice recording started');
    } catch (error) {
      console.error('Error starting voice recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Voice recording stopped');
    }
  };

  const startSpeechRecognition = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleSpeechToggle = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const playVoiceMessage = (messageId: string) => {
    const message = voiceMessages.find(m => m.id === messageId);
    if (message) {
      const audio = new Audio(URL.createObjectURL(message.audioBlob));
      audio.play();
      setIsPlaying(messageId);
      
      audio.onended = () => {
        setIsPlaying(null);
      };
    }
  };

  const downloadVoiceMessage = (message: VoiceMessage) => {
    const url = URL.createObjectURL(message.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice_message_${message.timestamp.toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(voice => 
        voice.name.includes('Parth') || voice.name.includes('Male')
      ) || null;
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <div className="flex items-center space-x-4">
        {/* Voice Recording */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVoiceToggle}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            isRecording 
              ? 'bg-red-600 text-white shadow-lg' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-sm">{isRecording ? 'Stop Recording' : 'Record Voice'}</span>
        </motion.button>

        {/* Speech Recognition */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpeechToggle}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            isListening 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-sm">{isListening ? 'Listening...' : 'Voice Input'}</span>
        </motion.button>

        {/* Voice Output Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
            voiceEnabled 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="text-sm">Voice Output</span>
        </motion.button>
      </div>

      {/* Audio Level Indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-3 p-4 bg-red-600/20 rounded-xl border border-red-500/30"
        >
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-6 bg-red-400 rounded-full"
                animate={{
                  height: audioLevel > i * 0.2 ? 24 : 8,
                  opacity: audioLevel > i * 0.2 ? 1 : 0.3
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>
          <span className="text-sm text-red-400 font-medium">Recording...</span>
        </motion.div>
      )}

      {/* Speech Recognition Status */}
      {isListening && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-blue-600/20 rounded-xl border border-blue-500/30"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span className="text-sm text-blue-400 font-medium">Listening...</span>
          </div>
          
          {interimTranscript && (
            <div className="text-sm text-gray-300 italic">
              "{interimTranscript}"
            </div>
          )}
        </motion.div>
      )}

      {/* Voice Messages */}
      {voiceMessages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Voice Messages</h4>
          {voiceMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20"
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => playVoiceMessage(message.id)}
                  className="w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
                >
                  {isPlaying === message.id ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </button>
                <div>
                  <div className="text-sm text-gray-300">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {Math.round(message.duration / 1000)}s
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadVoiceMessage(message)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {/* Share functionality */}}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Voice Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 bg-white/10 rounded-xl border border-white/20"
      >
        <div className="flex items-center space-x-2 mb-3">
          <Settings className="w-4 h-4 text-gray-400" />
          <h4 className="text-sm font-semibold text-white">Voice Settings</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400">Language</label>
            <select
              value={voiceSettings.language}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
              className="w-full mt-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-gray-400">Speed</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={voiceSettings.speed}
              onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="w-full mt-1"
            />
            <div className="text-xs text-gray-400 mt-1">{voiceSettings.speed}x</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VoiceInterface;
