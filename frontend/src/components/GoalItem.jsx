import { useDispatch, useSelector } from 'react-redux'
import { deleteGoal } from '../features/goals/goalSlice'

function GoalItem({ goal }) {
  const { user } = useSelector((state) => state.auth) // Accedemos al usuario autenticado desde el estado global
  const dispatch = useDispatch()

  // Comparamos el ID del usuario autenticado con el ID del creador del goal
  const isOwner = user && goal.user === user._id

  return (
    <><button id="openGoal">
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
    </button><div class="goalInner" id="goalInner">
        {goal.text}
        {goal.description}
        {goal.imgURL && <img src={goal.imgURL} alt="Goal" className="goal-image" />}
        <button id="closeGoal"> CLOSE </button>
      </div></>
  )
}

export default GoalItem