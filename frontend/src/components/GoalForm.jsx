import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGoal } from '../features/goals/goalSlice';

function GoalForm() {
  const [text, setText] = useState('');
  const [description, setDescription] = useState(''); 
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [base64File, setBase64File] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileMetadata, setFileMetadata] = useState({});
  const [category, setCategory] = useState('');
const categories = ['Videgames', 'Art', 'Food', 'Code', 'Health', 'Web Designs'];

  const dispatch = useDispatch();

  // Convert file to Base64 when a file is selected
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Verify file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File size must be less than 25MB');
        return;
      }
      
      setFile(selectedFile);
      setFileType(selectedFile.type);
      
      // Create file metadata
      const metadata = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified
      };
      setFileMetadata(metadata);
      
      // Create preview based on file type
      const reader = new FileReader();
      
      reader.onload = () => {
        setBase64File(reader.result); // Store the Base64 representation
        
        // Handle preview based on file type
        if (selectedFile.type.startsWith('image/')) {
          // Image preview
          setPreview({
            type: 'image',
            src: reader.result
          });
        } else if (selectedFile.type.startsWith('video/')) {
          // Video preview - create a video element to extract thumbnail
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = function() {
            // Set video at 1 second or middle if shorter
            video.currentTime = Math.min(1, video.duration / 2);
            video.onseeked = function() {
              // Create canvas to capture frame
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
              setPreview({
                type: 'video',
                src: reader.result,
                thumbnail: thumbnailDataUrl
              });
            };
          };
          video.src = reader.result;
        } else {
          // Generic file preview
          setPreview({
            type: 'file',
            name: selectedFile.name,
            extension: selectedFile.name.split('.').pop().toUpperCase()
          });
        }
      };
      
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
      setBase64File('');
      setFileType('');
      setFileMetadata({});
    }
  };

  // Form submission handler - now using Base64 for all file types
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    //Validate all stuff
    if (!text.trim() || !description.trim() || !category) {
      setError('Please enter a title, description, and select a category');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create goal with text, description, category, Base64 file and metadata
      await dispatch(createGoal({ 
        text, 
        description,
        category, 
        imgURL: base64File || '',
        fileType: fileType,
        fileMetadata: JSON.stringify(fileMetadata)
      })).unwrap();
      
      // Reset form after success
      setText('');
      setDescription('');
      setFile(null);
      setPreview(null);
      setBase64File('');
      setFileType('');
      setFileMetadata({});
      
    } catch (err) {
      console.error('Error creating post:', err);
      
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      
      setError(
        err.response?.data?.message || 
        err.message ||
        'Could not create the post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='form'>
      <form onSubmit={onSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        <div className='form-group'>
          <label htmlFor='text'>Title</label>
          <input
            type='text'
            name='text'
            id='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your title here"
            disabled={loading}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description </label>
          <textarea
            name='description'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Your description here"
            disabled={loading}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='category'>Category</label>
          <select
            id='category'
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value=''>-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>


        <div className='form-group'>
          <label htmlFor='file'>Select a file (image, video, etc.)</label>
          <input
            type='file'
            name='file'
            id='file'
            onChange={onFileChange}
            disabled={loading}
          />
        </div>

        {preview && (
          <div className='file-preview'>
            {preview.type === 'image' && (
              <img 
                src={preview.src} 
                alt="Preview" 
                style={{ maxWidth: '100%', maxHeight: '200px' }} 
              />
            )}
            {preview.type === 'video' && (
              <div className="video-preview">
                <img 
                  src={preview.thumbnail} 
                  alt="Video thumbnail" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
                <div className="video-indicator">Video</div>
              </div>
            )}
            {preview.type === 'file' && (
              <div className="generic-file-preview">
                <div className="file-icon">{preview.extension}</div>
                <div className="file-name">{preview.name}</div>
              </div>
            )}
          </div>
        )}

        <div className='form-group'>
          <button 
            className='btn btn-block' 
            type='submit'
            disabled={loading}
          >
            {loading ? 'Uploading post...' : 'Post'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;