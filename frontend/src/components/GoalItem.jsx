import { useDispatch, useSelector } from 'react-redux'
import { deleteGoal } from '../features/goals/goalSlice'
import { useState } from 'react'

function GoalItem({ goal }) {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  
  const [isOpen, setIsOpen] = useState(false)

  const isOwner = user && goal.user === user._id

  const openGoal = () => setIsOpen(true)
  const closeGoal = () => setIsOpen(false)

  return (
    <>
      <div className='goal' onClick={openGoal}>
        <h2>{goal.text}</h2>

        {goal.imgURL && <img src={goal.imgURL} alt="Goal" className="goal-image" />}

        {isOwner && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              dispatch(deleteGoal(goal._id))
            }} 
            className="close"
          >
            X
          </button>
        )}
      </div>

      {isOpen && (
        <div className="goalInner">
          <div className="goal-inner-content">
            <div className="popup-header">
              <h2>{goal.text}</h2>
              <button onClick={closeGoal} className="close-popup">×</button>
            </div>
            
            {goal.imgURL && (
              <div className="popup-image-container">
                <img src={goal.imgURL} alt="Goal" className="goal-popup-image" />
              </div>
            )}
            
            <div className="popup-description">
              <p>{goal.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GoalItem