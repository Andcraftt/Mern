import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGoal } from '../features/goals/goalSlice';
import axios from 'axios';

function GoalForm() {
  const [text, setText] = useState('');
  const [description, setDescription] = useState(''); // Nuevo estado para la descripción
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const dispatch = useDispatch();

  // Manejar la selección de imagen con vista previa
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Verificar el tamaño del archivo (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El tamaño de la imagen debe ser menor a 5MB');
        return;
      }
      
      setImage(selectedFile);
      
      // Crear vista previa
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

  // Manejador de envío - carga la imagen y crea el objetivo en un solo paso
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar los campos
    if (!text.trim() || !description.trim()) {
      setError('Por favor, ingresa una descripción y texto para el objetivo');
      return;
    }
    
    try {
      setLoading(true);
      
      let imgURL = null;
      
      // Solo cargar la imagen si se selecciona una
      if (image) {
        // Crear FormData para la carga del archivo
        const formData = new FormData();
        formData.append('image', image);

        console.log('Preparando la carga del archivo:', image.name, image.type, image.size);

        // Obtener el token de autenticación desde localStorage
        const token = JSON.parse(localStorage.getItem('user'))?.token;
        
        if (!token) {
          throw new Error('Token de autenticación no encontrado');
        }
        
        console.log('Cargando la imagen al backend...');
        
        // Asegurarse de que el endpoint de la API es correcto
        const uploadUrl = '/api/goals/upload';
        
        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            // Permitir que axios establezca el tipo de contenido para FormData
          },
        });
        
        console.log('Respuesta de la carga:', response.data);
        imgURL = response.data.imageUrl;
        console.log('Imagen cargada:', imgURL);
      }
      
      // Crear el objetivo con el texto, descripción y URL de la imagen
      await dispatch(createGoal({ 
        text, 
        description, // Ahora se incluye la descripción
        imgURL: imgURL || '' 
      })).unwrap();
      
      // Resetear el formulario después de un éxito
      setText('');
      setDescription(''); // Limpiar el campo de descripción
      setImage(null);
      setPreview(null);
      
    } catch (err) {
      console.error('Error al crear el objetivo:', err);
      
      // Más detalles sobre el error
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
          <label htmlFor='text'>Descripción del Objetivo</label>
          <input
            type='text'
            name='text'
            id='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ingresa tu objetivo"
            disabled={loading}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Descripción Detallada</label>
          <textarea
            name='description'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingresa una descripción detallada"
            disabled={loading}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='image'>Seleccionar Imagen (opcional)</label>
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
            {loading ? 'Creando objetivo...' : 'Agregar Objetivo'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;
