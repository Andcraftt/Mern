import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGoal } from '../features/goals/goalSlice';

function GoalForm() {
  const [text, setText] = useState('');
  const [description, setDescription] = useState(''); 
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [base64Image, setBase64Image] = useState('');

  const dispatch = useDispatch();

  // Convert file to Base64 when a file is selected
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Verify file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('El tamaño del archivo debe ser menor a 25MB');
        return;
      }
      
      setImage(selectedFile);
      
      // Create preview and convert to Base64
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        setBase64Image(reader.result); // Store the Base64 representation
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImage(null);
      setPreview(null);
      setBase64Image('');
    }
  };

  // Form submission handler - now using Base64 for image storage
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate required fields
    if (!text.trim() || !description.trim()) {
      setError('Por favor, ingresa una descripción y texto para el objetivo');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create goal with text, description and Base64 image string
      // No need for a separate upload process now
      await dispatch(createGoal({ 
        text, 
        description,
        imgURL: base64Image || '' // Store the Base64 image string directly
      })).unwrap();
      
      // Reset form after success
      setText('');
      setDescription('');
      setImage(null);
      setPreview(null);
      setBase64Image('');
      
    } catch (err) {
      console.error('Error al crear el objetivo:', err);
      
      if (err.response) {
        console.error('Estado de la respuesta:', err.response.status);
        console.error('Datos de la respuesta:', err.response.data);
      }
      
      setError(
        err.response?.data?.message || 
        err.message ||
        'No se pudo crear el objetivo. Intenta nuevamente.'
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
          <label htmlFor='image'>Select an image</label>
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
              alt="Vista previa" 
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
            {loading ? 'Uploading post...' : 'Post'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;