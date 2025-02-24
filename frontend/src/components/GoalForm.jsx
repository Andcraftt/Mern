import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createGoal } from '../features/goals/goalSlice'

function GoalForm() {
  const [text, setText] = useState('')
  const [imgURL, setImgURL] = useState('') // Estado para la URL de la imagen

  const dispatch = useDispatch()

  const onSubmit = (e) => {
    e.preventDefault()

    // Despachar la acción para crear una nueva meta, incluyendo el text y imgURL
    dispatch(createGoal({ text, imgURL })) 
    setText('')   // Limpiar el campo de texto
    setImgURL('') // Limpiar el campo de URL de imagen
  }

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
          <label htmlFor='imgURL'>Image URL</label>
          <input
            type='text'
            name='imgURL'
            id='imgURL'
            value={imgURL}
            onChange={(e) => setImgURL(e.target.value)} // Actualizar el estado de la URL de la imagen
          />
        </div>

        <div className='form-group'>
          <button className='btn btn-block' type='submit'>
            Add Goal
          </button>
        </div>
      </form>
    </section>
  )
}

export default GoalForm
