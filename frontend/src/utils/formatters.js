export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  export const formatConfidence = (confidence) => {
    return (confidence * 100).toFixed(2) + '%';
  };
  
  export const formatBlockchainHash = (hash) => {
    if (!hash) return 'Not verified';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };