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
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewImageBase64, setPreviewImageBase64] = useState('');
  const DEFAULT_IMAGE = 'https://www.shutterstock.com/image-vector/default-ui-image-placeholder-wireframes-600nw-1037719192.jpg';

  const categories = ['Videgames', 'Art', 'Food', 'Code', 'Health', 'Web Designs'];

  const dispatch = useDispatch();

  // Convert file to Base64 when a file is selected
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
  
    // Reset preview image states
    setPreviewImage(null);
    setPreviewImageBase64('');
    setShowImageUpload(false);
  
    if (selectedFile) {
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('File size must be less than 25MB');
        return;
      }
  
      setFile(selectedFile);
      setFileType(selectedFile.type);
  
      const metadata = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified
      };
      setFileMetadata(metadata);
  
      const reader = new FileReader();
  
      reader.onload = () => {
        setBase64File(reader.result);
  
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const isImage = validImageTypes.includes(selectedFile.type);
  
        if (isImage) {
          setPreview({
            type: 'image',
            src: reader.result
          });
          setShowImageUpload(false);
        } else if (selectedFile.type.startsWith('video/')) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.onloadedmetadata = function () {
            video.currentTime = Math.min(1, video.duration / 2);
            video.onseeked = function () {
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
          setShowImageUpload(true);
        } else {
          setPreview({
            type: 'file',
            name: selectedFile.name,
            extension: selectedFile.name.split('.').pop().toUpperCase()
          });
          setShowImageUpload(true);
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
  
  // Handle preview image upload
  const onPreviewImageChange = (e) => {
    const selectedImage = e.target.files[0];
    
    if (selectedImage) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (!validImageTypes.includes(selectedImage.type)) {
        setError('Preview file must be an image (JPEG, JPG, PNG, WebP)');
        return;
      }
      
      if (selectedImage.size > 10 * 1024 * 1024) {
        setError('Preview image size must be less than 10MB');
        return;
      }
      
      setPreviewImage(selectedImage);
      
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImageBase64(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setPreviewImage(null);
      setPreviewImageBase64('');
    }
  };

  // Form submission handler
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate all stuff
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
        imgURLpreview: previewImageBase64 || '',
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
      setPreviewImage(null);
      setPreviewImageBase64('');
      
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

        {showImageUpload && (
          <div className='form-group'>
            <label htmlFor='previewImage'>Upload Preview Image (optional)</label>
            <input
              type='file'
              id='previewImage'
              accept='image/*'
              onChange={onPreviewImageChange}
              disabled={loading}
            />
            <small>Add a preview image for your non-image file</small>
          </div>
        )}

        <div className='file-preview'>
          {preview?.type === 'image' && (
            <img 
              src={preview.src} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px' }} 
            />
          )}
          {preview?.type === 'video' && (
            <div className="video-preview">
              <img 
                src={preview.thumbnail} 
                alt="Video thumbnail" 
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
              <div className="video-indicator">Video</div>
            </div>
          )}
          {preview?.type === 'file' && (
            <div className="generic-file-preview">
              <div className="file-icon">{preview.extension}</div>
              <div className="file-name">{preview.name}</div>
            </div>
          )}
          {showImageUpload && (
            <div className="preview-image-container">
              <h4>Preview Image:</h4>
              <img
                src={previewImageBase64 || DEFAULT_IMAGE}
                alt="Preview for non-image file"
                style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '10px' }}
              />
            </div>
          )}
        </div>

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