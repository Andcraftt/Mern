import { useDispatch, useSelector } from 'react-redux'
import { deleteGoal } from '../features/goals/goalSlice'
import { useState } from 'react'

function GoalItem({ goal }) {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  // Estado para manejar si el popup está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false)

  // Comparamos el ID del usuario autenticado con el ID del creador del goal
  const isOwner = user && goal.user === user._id

  const openGoal = () => setIsOpen(true)
  const closeGoal = () => setIsOpen(false)

  return (
    <>
      <button onClick={openGoal}>
        <div className='goal'>
          <h2>{goal.text}</h2>

          {/* Si hay una URL de imagen, la mostramos */}
          {goal.imgURL && <img src={goal.imgURL} alt="Goal" className="goal-image" />}

          {/* Solo mostramos el botón X si el usuario es el propietario del goal */}
          {isOwner && (
            <button onClick={() => dispatch(deleteGoal(goal._id))} className="close">
              X
            </button>
          )}
        </div>
      </button>

      {/* Popup (goalInner) que se muestra si isOpen es verdadero */}
      {isOpen && (
        <div className="goalInner">
          <div className="goal-inner-content">
            <h2>{goal.text}</h2>
            <p>{goal.description}</p>
            {goal.imgURL && <img src={goal.imgURL} alt="Goal" className="goal-image" />}
            <button onClick={closeGoal} className="close-popup">CLOSE</button>
          </div>
        </div>
      )}
    </>
  )
}

export default GoalItem
