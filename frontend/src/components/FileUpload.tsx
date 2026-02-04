/**
 * AegisSign - File Upload Component
 * 
 * Drag-and-drop zone for PDF file uploads.
 */

import { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
    isLoading?: boolean;
    error?: string | null;
}

export default function FileUpload({
    onFileSelect,
    selectedFile,
    onClear,
    isLoading = false,
    error = null,
}: FileUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (rejectedFiles.length > 0) {
                const rejection = rejectedFiles[0];
                if (rejection.errors[0]?.code === 'file-invalid-type') {
                    console.error('Only PDF files are accepted');
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 1,
        disabled: isLoading,
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {!selectedFile ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div
                            {...getRootProps()}
                            className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isDragReject ? 'border-aegis-danger' : ''
                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <input {...getInputProps()} />

                            <motion.div
                                animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="flex flex-col items-center gap-4"
                            >
                                <div className="relative">
                                    <div className="p-4 rounded-2xl bg-aegis-primary/10">
                                        <Upload className={`w-8 h-8 ${isDragActive ? 'text-aegis-primary' : 'text-dark-400'}`} />
                                    </div>
                                    {isDragActive && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1.2, opacity: 0.5 }}
                                            transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                                            className="absolute inset-0 rounded-2xl bg-aegis-primary"
                                        />
                                    )}
                                </div>

                                <div className="text-center">
                                    <p className="text-lg font-medium text-dark-200">
                                        {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
                                    </p>
                                    <p className="text-sm text-dark-500 mt-1">
                                        or click to browse
                                    </p>
                                </div>

                                <p className="text-xs text-dark-600">
                                    Supports PDF files up to 50MB
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="selected"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-card"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-aegis-accent/10">
                                <FileText className="w-6 h-6 text-aegis-accent" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-dark-100 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-dark-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClear();
                                }}
                                disabled={isLoading}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-aegis-danger/10 border border-aegis-danger/20 text-aegis-danger text-sm"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
