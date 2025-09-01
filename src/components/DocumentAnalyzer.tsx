import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Image, 
  Code, 
  File, 
  X, 
  Eye, 
  Download,
  Share2,
  Search,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'code' | 'text' | 'other';
  size: number;
  content?: string;
  analysis?: DocumentAnalysis;
  uploadedAt: Date;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
}

interface DocumentAnalysis {
  summary: string;
  keyPoints: string[];
  topics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  complexity: 'simple' | 'moderate' | 'complex';
  recommendations: string[];
  relatedTools: string[];
}

interface DocumentAnalyzerProps {
  onDocumentAnalysis: (analysis: DocumentAnalysis) => void;
  onFileUpload: (files: File[]) => void;
}

const DocumentAnalyzer: React.FC<DocumentAnalyzerProps> = ({
  onDocumentAnalysis,
  onFileUpload
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFileTypes = {
    'application/pdf': 'pdf',
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'text/plain': 'text',
    'text/javascript': 'code',
    'text/typescript': 'code',
    'text/python': 'code',
    'application/json': 'code'
  };

  const getFileType = (file: File): string => {
    return supportedFileTypes[file.type as keyof typeof supportedFileTypes] || 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const document: Document = {
        id: `doc_${Date.now()}_${Math.random()}`,
        name: file.name,
        type: getFileType(file) as any,
        size: file.size,
        uploadedAt: new Date(),
        status: 'uploading'
      };

      setDocuments(prev => [...prev, document]);

      try {
        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Read file content
        const content = await readFileContent(file);
        
        // Analyze document
        const analysis = await analyzeDocument(file, content);
        
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, content, analysis, status: 'completed' }
            : doc
        ));

        onDocumentAnalysis(analysis);
      } catch (error) {
        console.error('Error processing file:', error);
        setDocuments(prev => prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'error' }
            : doc
        ));
      }
    }

    onFileUpload(fileArray);
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      
      reader.onerror = reject;
      
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const analyzeDocument = async (file: File, content: string): Promise<DocumentAnalysis> => {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const analysis: DocumentAnalysis = {
      summary: generateSummary(file, content),
      keyPoints: generateKeyPoints(file, content),
      topics: extractTopics(file, content),
      sentiment: analyzeSentiment(content),
      complexity: assessComplexity(content),
      recommendations: generateRecommendations(file, content),
      relatedTools: suggestRelatedTools(file, content)
    };

    return analysis;
  };

  const generateSummary = (file: File, content: string): string => {
    const fileType = getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return "This PDF document contains technical information about AI implementation strategies and best practices.";
      case 'image':
        return "This image appears to be a screenshot or diagram related to AI system architecture or workflow.";
      case 'code':
        return "This code file contains implementation details for AI-related functionality, including API integrations and data processing.";
      case 'text':
        return "This text document provides insights into AI concepts, methodologies, or project documentation.";
      default:
        return "This document contains various types of content that may be relevant to AI development and implementation.";
    }
  };

  const generateKeyPoints = (file: File, content: string): string[] => {
    const fileType = getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return [
          "AI implementation strategies",
          "Best practices for automation",
          "Integration methodologies",
          "Performance optimization techniques"
        ];
      case 'image':
        return [
          "Visual representation of AI workflow",
          "System architecture diagram",
          "Process flow visualization",
          "Technical diagram components"
        ];
      case 'code':
        return [
          "API integration patterns",
          "Data processing logic",
          "Error handling mechanisms",
          "Performance optimization code"
        ];
      default:
        return [
          "Document structure analysis",
          "Content categorization",
          "Key information extraction",
          "Relevance assessment"
        ];
    }
  };

  const extractTopics = (file: File, content: string): string[] => {
    const topics = ['AI', 'automation', 'integration', 'development'];
    return topics.filter(topic => 
      content.toLowerCase().includes(topic.toLowerCase())
    );
  };

  const analyzeSentiment = (content: string): 'positive' | 'negative' | 'neutral' => {
    const positiveWords = ['success', 'improve', 'benefit', 'advantage', 'solution'];
    const negativeWords = ['problem', 'issue', 'error', 'fail', 'difficult'];
    
    const positiveCount = positiveWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    const negativeCount = negativeWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const assessComplexity = (content: string): 'simple' | 'moderate' | 'complex' => {
    const wordCount = content.split(' ').length;
    const technicalTerms = ['API', 'integration', 'algorithm', 'optimization', 'architecture'];
    const technicalCount = technicalTerms.filter(term => 
      content.includes(term)
    ).length;
    
    if (wordCount > 1000 || technicalCount > 3) return 'complex';
    if (wordCount > 500 || technicalCount > 1) return 'moderate';
    return 'simple';
  };

  const generateRecommendations = (file: File, content: string): string[] => {
    return [
      "Consider implementing automated testing for this codebase",
      "Add comprehensive error handling for better reliability",
      "Optimize performance by implementing caching strategies",
      "Document the API endpoints for better maintainability"
    ];
  };

  const suggestRelatedTools = (file: File, content: string): string[] => {
    const fileType = getFileType(file);
    
    switch (fileType) {
      case 'code':
        return ['GitHub Copilot', 'VS Code', 'Postman', 'Jest'];
      case 'image':
        return ['Midjourney', 'DALL-E', 'Canva', 'Figma'];
      case 'pdf':
        return ['ChatGPT', 'Notion', 'Obsidian', 'Zapier'];
      default:
        return ['ChatGPT', 'Notion', 'Zapier', 'Make'];
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'analyzing': return <Search className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-400" />;
      case 'image': return <Image className="w-5 h-5 text-green-400" />;
      case 'code': return <Code className="w-5 h-5 text-blue-400" />;
      case 'text': return <FileText className="w-5 h-5 text-purple-400" />;
      default: return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragging 
            ? 'border-purple-500 bg-purple-500/10' 
            : 'border-white/20 bg-white/5 hover:border-white/30'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Upload Documents</h3>
        <p className="text-gray-400 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.txt,.js,.ts,.py,.json"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
      </motion.div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Uploaded Documents</h3>
          <div className="space-y-3">
            {documents.map((document) => (
              <motion.div
                key={document.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(document.type)}
                  <div>
                    <div className="text-sm font-medium text-white">{document.name}</div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(document.size)} • {document.type.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(document.status)}
                  <button
                    onClick={() => setSelectedDocument(document)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeDocument(document.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Document Analysis */}
      <AnimatePresence>
        {selectedDocument && selectedDocument.analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white/10 rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Document Analysis</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Summary</h4>
                <p className="text-sm text-gray-300">{selectedDocument.analysis.summary}</p>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Key Points</h4>
                <div className="space-y-1">
                  {selectedDocument.analysis.keyPoints.map((point, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2" />
                      <span className="text-sm text-gray-300">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Sentiment</div>
                  <div className={`text-sm font-medium ${
                    selectedDocument.analysis.sentiment === 'positive' ? 'text-green-400' :
                    selectedDocument.analysis.sentiment === 'negative' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {selectedDocument.analysis.sentiment}
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">Complexity</div>
                  <div className="text-sm font-medium text-blue-400">
                    {selectedDocument.analysis.complexity}
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.analysis.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Recommendations</h4>
                <div className="space-y-2">
                  {selectedDocument.analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <span className="text-sm text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Tools */}
              <div>
                <h4 className="text-sm font-medium text-purple-400 mb-2">Related Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.analysis.relatedTools.map((tool, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs border border-blue-500/30"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentAnalyzer;
