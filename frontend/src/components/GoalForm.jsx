import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createGoal } from '../features/goals/goalSlice';
import axios from 'axios';

function GoalForm() {
  const [text, setText] = useState('');
  const [imgURL, setImgURL] = useState('');
  const [image, setImage] = useState(null); // Estado para la imagen seleccionada
  const [loading, setLoading] = useState(false); // Estado para mostrar un indicador de carga

  const dispatch = useDispatch();

  // Manejar el cambio de la imagen
  const onFileChange = (e) => {
    setImage(e.target.files[0]); // Guardamos el archivo en el estado
  };

  // Subir la imagen al servidor y obtener la URL de S3
  const uploadImage = async () => {
    if (!image) return; // Si no hay imagen seleccionada, no hacer nada
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', image); // Se envía la imagen seleccionada

    try {
      const response = await axios.post('/api/goals/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImgURL(response.data.imageUrl); // Guardamos la URL de la imagen
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar el envío del formulario
  const onSubmit = (e) => {
    e.preventDefault();

    if (!imgURL) {
      alert('Please upload an image before submitting');
      return;
    }

    // Despachar la acción para crear una nueva meta, incluyendo el texto y la URL de la imagen
    dispatch(createGoal({ text, imgURL }));
    setText(''); // Limpiar el campo de texto
    setImgURL(''); // Limpiar la URL de la imagen
    setImage(null); // Limpiar el archivo de la imagen
  };

  return (
    <section className='form'>
      <form onSubmit={onSubmit}>
        <div className='form-group'>
          <label htmlFor='text'>Goal</label>
          <input
            type='text'
            name='text'
            id='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='image'>Select Image</label>
          <input
            type='file'
            name='image'
            id='image'
            onChange={onFileChange} // Guardamos el archivo seleccionado
          />
        </div>

        <div className='form-group'>
          {image && !loading && <button type='button' onClick={uploadImage}>Upload Image</button>}
          {loading && <p>Uploading...</p>} {/* Indicador de carga */}
        </div>

        {imgURL && (
          <div className="form-group">
            <p>Image URL: {imgURL}</p> {/* Muestra la URL de la imagen subida */}
          </div>
        )}

        <div className='form-group'>
          <button className='btn btn-block' type='submit'>
            Add Goal
          </button>
        </div>
      </form>
    </section>
  );
}

export default GoalForm;
