import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGoal } from '../features/goals/goalSlice';
import axios from 'axios';

function GoalForm() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();

  // Handle image selection with preview
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      setImage(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  // Submit handler - uploads image and creates goal in one step
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate input
    if (!text.trim()) {
      setError('Please enter a goal description');
      return;
    }
    
    try {
      setLoading(true);
      
      let imgURL = null;
      
      // Only upload image if one is selected
      if (image) {
        // Create form data for file upload
        const formData = new FormData();
        formData.append('image', image);

        console.log('Preparing to upload file:', image.name, image.type, image.size);

        // Get the auth token from localStorage
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        console.log('Uploading image to backend...');
        
        // Make sure the API endpoint is correct
        const uploadUrl = '/api/goals/upload';
        
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Let axios set the content type for FormData
          },
        });
        
        console.log('Upload response:', response.data);
        imgURL = response.data.imageUrl;
        console.log('Image uploaded:', imgURL);
      }
      
      // Create goal with the text and image URL
      await dispatch(createGoal({ 
        text, 
        imgURL: imgURL || '' 
      })).unwrap();
      
      // Reset form on success
      setText('');
      setImage(null);
      setPreview(null);
      
    } catch (err) {
      console.error('Error creating goal:', err);
      
      // More detailed error reporting
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      
      setError(
        err.response?.data?.message || 
        err.message ||
        'Failed to create goal. Please try again.'
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
          <label htmlFor='text'>Goal Description</label>
          <input
            type='text'
            name='text'
            id='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your goal"
            disabled={loading}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='image'>Select Image (optional)</label>
          <input
            type='file'
            name='image'
            id='image'
            onChange={onFileChange}
            accept="image/*"
            disabled={loading}
          />
        </div>

        {preview && (
          <div className='image-preview'>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px' }} 
            />
          </div>
        )}

        <div className='form-group'>
          <button 
            className='btn btn-block' 
            type='submit'
            disabled={loading}
          >
            {loading ? 'Creating Goal...' : 'Add Goal'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;