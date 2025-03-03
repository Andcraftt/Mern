import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGoal } from '../features/goals/goalSlice';
import axios from 'axios';

function GoalForm() {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();
  
  // Get user token from Redux store
  const { user } = useSelector((state) => state.auth);

  // Handle image selection with preview
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
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
    
    if (!image) {
      setError('Please select an image');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Upload image and get back S3 URL
      const formData = new FormData();
      formData.append('image', image);
      
      // Include the auth token in the request
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const response = await axios.post('/api/goals/upload', formData, config);
      
      const imgURL = response.data.imageUrl;
      
      // 2. Create goal with the text and image URL
      await dispatch(createGoal({ text, imgURL })).unwrap();
      
      // 3. Reset form on success
      setText('');
      setImage(null);
      setPreview(null);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal. Please try again.');
      console.error('Error creating goal:', err);
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
          <label htmlFor='image'>Select Image</label>
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
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </div>
        )}

        <div className='form-group'>
          <button 
            className='btn btn-block' 
            type='submit'
            disabled={loading}
          >
            {loading ? 'Creating Goal...' : 'Add Goal with Image'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;